"""
A small Modified Nodal Analysis (MNA) solver for simplified DC circuits.

This is the same fundamental technique real SPICE-class simulators use:
build a system of equations from Kirchhoff's Current Law at every node plus
Ohm's Law for every resistor, and solve it as linear algebra. What's
simplified here (deliberately, for a teaching tool rather than a full
SPICE clone):

  - DC steady-state only (no transient/AC analysis)
  - Diodes use an ideal fixed-voltage-drop model with a bounded 2-pass
    on/off check, not full Newton-Raphson iteration
  - Transistors, MOSFETs, and ICs aren't behaviorally simulated - they
    simply don't conduct (see electrical_models.py)
  - A microcontroller board (ESP32, Arduino, etc) is expanded into several
    independent ideal voltage sources - one per powered/driven pin, all
    referenced to the board's own ground pin(s) - rather than modeled as a
    single two-terminal element. An undriven GPIO pin (no pin_states entry
    for it) is treated as floating/open, not as 0V, until code is actually
    running on the board and calling digitalWrite/pinMode.

Terminology: a "net" is a set of terminal points that are all electrically
the same node (joined by wires or zero-resistance parts) - equivalent to a
node in SPICE.
"""

import numpy as np
from collections import defaultdict, deque

from electrical_models import classify, resistor_ohms, diode_forward_voltage, source_volts, board_pins


class _UnionFind:
    def __init__(self):
        self.parent = {}

    def find(self, x):
        self.parent.setdefault(x, x)
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[ra] = rb


def solve_circuit(nodes, edges):
    """
    Returns a dict describing the solved circuit - see readings/source
    current fields below. { "ok": False } means there's no power source.
    """
    uf = _UnionFind()

    for n in nodes:
        if classify(n) == "zero":
            uf.union((n["id"], "a"), (n["id"], "b"))

    # A board's own ground pins (there can be more than one, e.g. the ESP32
    # has two GND pins) are always the same net on the board itself, even
    # before any wire connects them - merge those up front.
    for n in nodes:
        if classify(n) == "board":
            gnd_terms = [p["terminal"] for p in board_pins(n) if p.get("role") == "ground"]
            for t in gnd_terms[1:]:
                uf.union((n["id"], t), (n["id"], gnd_terms[0]))

    for e in edges:
        uf.union((e["sourceId"], e["sourceTerminal"]), (e["targetId"], e["targetTerminal"]))

    def net(node_id, terminal):
        return uf.find((node_id, terminal))

    resistors, diodes, sources = [], [], []
    for n in nodes:
        kind = classify(n)
        if kind == "board":
            continue  # handled separately below - a board isn't a two-terminal element
        a, b = net(n["id"], "a"), net(n["id"], "b")
        if kind == "resistor":
            ohms = resistor_ohms(n)
            if ohms and ohms > 0:
                resistors.append({"id": n["id"], "n1": a, "n2": b, "ohms": ohms})
        elif kind == "diode":
            diodes.append({"id": n["id"], "anode": a, "cathode": b, "vf": diode_forward_voltage(n)})
        elif kind == "source":
            sources.append({"id": n["id"], "pos": a, "neg": b, "volts": source_volts(n)})

    # Expand each board into independent sources: one per powered pin
    # (3V3/VIN) and one per GPIO pin that's actively being driven, all
    # referenced to that board's own ground net. An undriven GPIO is left
    # out entirely - it floats, exactly like a real input-mode/unconfigured
    # pin, rather than pulling to 0V.
    for n in nodes:
        if classify(n) != "board":
            continue
        pins = board_pins(n)
        gnd_terms = [p["terminal"] for p in pins if p.get("role") == "ground"]
        if not gnd_terms:
            continue
        board_gnd = net(n["id"], gnd_terms[0])
        pin_states = n.get("pin_states") or {}

        for p in pins:
            role = p.get("role")
            term = p["terminal"]
            if role == "power":
                volts = p.get("volts") or n.get("default_value") or 3.3
                sources.append({"id": f'{n["id"]}::{term}', "pos": net(n["id"], term), "neg": board_gnd, "volts": volts})
            elif role == "gpio" and term in pin_states:
                sources.append({"id": f'{n["id"]}::{term}', "pos": net(n["id"], term), "neg": board_gnd, "volts": pin_states[term]})

    if not sources:
        return {"ok": False}

    # A source whose + and - terminals land on the exact same net (e.g. a
    # bare wire straight across a battery) is a dead short. The normal MNA
    # matrix goes singular for that source's row in this case (KCL/KVL can't
    # assign it a finite current), so pull these out before solving and
    # report them with a large sentinel current instead of trying to solve
    # for something that's physically "as much current as the wire allows".
    DEAD_SHORT_MA = 9999.0
    shorted_sources = [s for s in sources if s["pos"] == s["neg"]]
    sources = [s for s in sources if s["pos"] != s["neg"]]

    if not sources and shorted_sources:
        readings = {
            s["id"]: {
                "voltage": round(s["volts"], 3),
                "current_mA": DEAD_SHORT_MA,
                "power_mW": round(s["volts"] * DEAD_SHORT_MA, 2),
                "state": "on",
            }
            for s in shorted_sources
        }
        source_currents_mA = {s["id"]: DEAD_SHORT_MA for s in shorted_sources}
        return {
            "ok": True,
            "readings": readings,
            "source_currents_mA": source_currents_mA,
            "any_source_current": True,
            "max_source_current_mA": DEAD_SHORT_MA,
            "board_pin_voltages": {},
        }
    if not sources:
        return {"ok": False}

    ground_net = sources[0]["neg"]

    conn = defaultdict(set)
    for r in resistors:
        conn[r["n1"]].add(r["n2"]); conn[r["n2"]].add(r["n1"])
    for s in sources:
        conn[s["pos"]].add(s["neg"]); conn[s["neg"]].add(s["pos"])
    for d in diodes:
        conn[d["anode"]].add(d["cathode"]); conn[d["cathode"]].add(d["anode"])

    reachable = {ground_net}
    queue = deque([ground_net])
    while queue:
        cur = queue.popleft()
        for nxt in conn[cur]:
            if nxt not in reachable:
                reachable.add(nxt)
                queue.append(nxt)

    resistors = [r for r in resistors if r["n1"] in reachable and r["n2"] in reachable]
    sources_in = [s for s in sources if s["pos"] in reachable and s["neg"] in reachable]
    diodes_in = [d for d in diodes if d["anode"] in reachable and d["cathode"] in reachable]

    def _solve(diode_on_states):
        nets = sorted(
            ({n for r in resistors for n in (r["n1"], r["n2"])}
             | {n for s in sources_in for n in (s["pos"], s["neg"])}
             | {d["anode"] for d, on in zip(diodes_in, diode_on_states) if on}
             | {d["cathode"] for d, on in zip(diodes_in, diode_on_states) if on})
            - {ground_net},
            key=str,
        )
        idx = {n: i for i, n in enumerate(nets)}
        on_diodes = [d for d, on in zip(diodes_in, diode_on_states) if on]

        m = len(nets)
        extra = len(sources_in) + len(on_diodes)
        size = m + extra
        if size == 0:
            return {}, {}, {}

        A = np.zeros((size, size))
        z = np.zeros(size)

        def i_of(n):
            return idx.get(n) if n != ground_net else None

        for r in resistors:
            g = 1.0 / r["ohms"]
            i1, i2 = i_of(r["n1"]), i_of(r["n2"])
            if i1 is not None:
                A[i1, i1] += g
            if i2 is not None:
                A[i2, i2] += g
            if i1 is not None and i2 is not None:
                A[i1, i2] -= g
                A[i2, i1] -= g

        for si, s in enumerate(sources_in):
            row = m + si
            ip, ineg = i_of(s["pos"]), i_of(s["neg"])
            if ip is not None:
                A[ip, row] += 1
                A[row, ip] += 1
            if ineg is not None:
                A[ineg, row] -= 1
                A[row, ineg] -= 1
            z[row] = s["volts"]

        for di, d in enumerate(on_diodes):
            row = m + len(sources_in) + di
            ia, ic = i_of(d["anode"]), i_of(d["cathode"])
            if ia is not None:
                A[ia, row] += 1
                A[row, ia] += 1
            if ic is not None:
                A[ic, row] -= 1
                A[row, ic] -= 1
            z[row] = d["vf"]

        try:
            x = np.linalg.solve(A, z)
        except np.linalg.LinAlgError:
            x, *_ = np.linalg.lstsq(A, z, rcond=None)

        voltages = {ground_net: 0.0}
        for n, i in idx.items():
            voltages[n] = float(x[i])
        source_I = {sources_in[si]["id"]: float(x[m + si]) for si in range(len(sources_in))}
        diode_I = {on_diodes[di]["id"]: float(x[m + len(sources_in) + di]) for di in range(len(on_diodes))}
        return voltages, source_I, diode_I

    diode_state = [False] * len(diodes_in)
    voltages, source_I, diode_I = _solve(diode_state)

    changed = False
    for i, d in enumerate(diodes_in):
        va = voltages.get(d["anode"], 0.0)
        vc = voltages.get(d["cathode"], 0.0)
        if (va - vc) > d["vf"] - 1e-9:
            diode_state[i] = True
            changed = True

    if changed:
        voltages, source_I, diode_I = _solve(diode_state)
        flipped = False
        for i, d in enumerate(diodes_in):
            if diode_state[i] and diode_I.get(d["id"], 0.0) < -1e-9:
                diode_state[i] = False
                flipped = True
        if flipped:
            voltages, source_I, diode_I = _solve(diode_state)

    readings = {}
    for r in resistors:
        v = voltages.get(r["n1"], 0.0) - voltages.get(r["n2"], 0.0)
        i_amps = v / r["ohms"]
        readings[r["id"]] = {
            "voltage": round(abs(v), 3),
            "current_mA": round(abs(i_amps) * 1000, 2),
            "power_mW": round(abs(v * i_amps) * 1000, 2),
            "state": "on" if abs(i_amps) > 1e-6 else "off",
        }
    for i, d in enumerate(diodes_in):
        on = diode_state[i]
        i_amps = diode_I.get(d["id"], 0.0) if on else 0.0
        anode_v = voltages.get(d["anode"], 0.0)
        cathode_v = voltages.get(d["cathode"], 0.0)
        readings[d["id"]] = {
            "voltage": round(d["vf"], 3) if on else round(anode_v - cathode_v, 3),
            "current_mA": round(abs(i_amps) * 1000, 2),
            "power_mW": round(abs(d["vf"] * i_amps) * 1000, 2),
            "state": "on" if on and i_amps > 1e-6 else "off",
        }
    for s in sources_in:
        i_amps = source_I.get(s["id"], 0.0)
        readings[s["id"]] = {
            "voltage": round(s["volts"], 3),
            "current_mA": round(abs(i_amps) * 1000, 2),
            "power_mW": round(abs(s["volts"] * i_amps) * 1000, 2),
            "state": "on" if abs(i_amps) > 1e-6 else "off",
        }

    source_currents_mA = {s["id"]: abs(source_I.get(s["id"], 0.0)) * 1000 for s in sources_in}

    # fold in any sources that were dead-shorted straight to themselves
    for s in shorted_sources:
        readings[s["id"]] = {
            "voltage": round(s["volts"], 3),
            "current_mA": DEAD_SHORT_MA,
            "power_mW": round(s["volts"] * DEAD_SHORT_MA, 2),
            "state": "on",
        }
        source_currents_mA[s["id"]] = DEAD_SHORT_MA

    max_source_mA = max(source_currents_mA.values()) if source_currents_mA else 0.0
    any_current = any(c > 1e-3 for c in source_currents_mA.values())

    # Raw per-pin voltages for every board (relative to that board's own
    # ground) - not just the ones with an active source. This is what lets
    # analogRead()/digitalRead() see an externally-applied signal (e.g. a
    # potentiometer wiper wired into a GPIO) rather than only ever reading
    # back what the code itself just wrote.
    board_pin_voltages = {}
    for n in nodes:
        if classify(n) != "board":
            continue
        pins = board_pins(n)
        gnd_terms = [p["terminal"] for p in pins if p.get("role") == "ground"]
        if not gnd_terms:
            continue
        board_gnd = net(n["id"], gnd_terms[0])
        gnd_v = voltages.get(board_gnd, 0.0)
        for p in pins:
            term = p["terminal"]
            pin_net = net(n["id"], term)
            board_pin_voltages[f'{n["id"]}::{term}'] = round(voltages.get(pin_net, gnd_v) - gnd_v, 4)

    return {
        "ok": True,
        "readings": readings,
        "source_currents_mA": source_currents_mA,
        "any_source_current": any_current,
        "max_source_current_mA": max_source_mA,
        "board_pin_voltages": board_pin_voltages,
    }