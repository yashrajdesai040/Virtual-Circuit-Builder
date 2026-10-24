"""
Maps each catalog component to a simplified DC electrical model, used by the
MNA (Modified Nodal Analysis) solver in mna_solver.py. This is a
teaching-level model, not a full SPICE engine - documented simplifications
below.

Every two-terminal part falls into exactly one bucket:

  ZERO_RESISTANCE - wire, fuse, inductor (DC steady-state = short), and a
                     closed switch/DIP switch. Terminals are electrically
                     merged into the same node.

  OPEN            - capacitors (DC steady-state = fully charged = open),
                     an open switch/DIP switch, and unmodeled active/logic
                     parts (transistors, MOSFET, 555/op-amp ICs) - we don't
                     simulate their internal behavior, so they simply don't
                     conduct between their two exposed terminal points.

  RESISTOR        - a normal linear resistor between its two terminals.
                     Includes real component values (resistor, potentiometer,
                     LDR, thermistor, speaker impedance) and two assumed
                     typical values noted below where the catalog only
                     stores a rated voltage, not a datasheet resistance.

  DIODE           - an ideal diode with a fixed forward-voltage drop
                     (LED, diode, zener). Terminal "a" is the anode (+),
                     "b" is the cathode (-) - matches the +/- markers shown
                     in the Builder. Conducts only when forward biased.

  SOURCE          - an ideal DC voltage source (battery, solar panel, or a
                     voltage regulator's fixed output). Terminal "a" is
                     positive, "b" is negative.

  BOARD           - a multi-pin microcontroller/dev board (ESP32, Arduino,
                     etc). Unlike everything else above, a board isn't one
                     two-terminal element - it's several independent ideal
                     voltage sources (each GPIO pin, plus 3V3/VIN) sharing
                     one common ground reference. See mna_solver.py for how
                     board pins get expanded into individual sources -
                     classify() just identifies the node as a board here.
"""

ZERO_RESISTANCE_KEYS = {"wire", "fuse", "inductor"}
TOGGLE_KEYS = {"switch", "dip_switch"}
CAPACITOR_KEYS = {"capacitor_electrolytic", "capacitor_ceramic"}
DIODE_KEYS = {"led", "diode", "zener_diode"}
UNMODELED_ACTIVE_KEYS = {"transistor_npn", "transistor_pnp", "mosfet", "ic_555", "ic_opamp"}
SOURCE_CATEGORIES = {"source"}
BOARD_CATEGORIES = {"board"}
FIXED_SOURCE_KEYS = {"voltage_regulator"}  # regulated output, category is "ic" not "source"

# Assumed typical resistances (ohms) for parts where the catalog only stores
# a rated voltage rather than a datasheet coil/winding resistance. Real parts
# vary; these are reasonable order-of-magnitude stand-ins so the solver has
# something physical to work with.
ASSUMED_OHMS = {
    "buzzer": 100.0,
    "dc_motor": 20.0,
    "relay": 400.0,  # coil resistance if ever wired as a plain resistive load
}


def _to_ohms(value, unit):
    if value is None:
        return None
    if unit == "kΩ":
        return value * 1000.0
    return value  # already Ω, or unit doesn't apply


def classify(node):
    """Returns one of: 'zero', 'open', 'resistor', 'diode', 'source', 'board'."""
    key = node.get("key")
    category = node.get("category")

    if category in BOARD_CATEGORIES:
        return "board"

    if key in TOGGLE_KEYS:
        return "zero" if node.get("on") is not False else "open"

    if key in ZERO_RESISTANCE_KEYS:
        return "zero"

    if key in CAPACITOR_KEYS or key in UNMODELED_ACTIVE_KEYS:
        return "open"

    if key in DIODE_KEYS:
        return "diode"

    if category in SOURCE_CATEGORIES or key in FIXED_SOURCE_KEYS:
        volts = node.get("default_value")
        return "source" if volts and volts > 0 else "open"

    return "resistor"  # everything else - resistor, potentiometer, LDR, thermistor, speaker, buzzer, dc_motor


def resistor_ohms(node):
    key = node.get("key")
    if key in ASSUMED_OHMS:
        return ASSUMED_OHMS[key]
    return _to_ohms(node.get("default_value"), node.get("unit"))


def diode_forward_voltage(node):
    return node.get("default_value") or 0.7


def source_volts(node):
    return node.get("default_value") or 0


def board_pins(node):
    """Pin layout for a board-type node - list of dicts with terminal/role/
    volts, copied onto the placed node from the catalog component's
    spec.pins when it was dropped onto the builder (see Builder.jsx onDrop).
    """
    return node.get("pins") or []