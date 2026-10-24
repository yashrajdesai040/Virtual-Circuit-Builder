import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import AppShell from "../components/AppShell";
import KineticHeadline from "../components/KineticHeadline";

/* ---------------- Category styling ---------------- */
const TAG_COLOR = {
  Fundamentals: "var(--color-green)",
  Components: "var(--accent)",
  Tools: "var(--gold)",
  Troubleshooting: "var(--danger)",
  Digital: "#5b8dee",
  "Using CircuitLab": "#b98aff",
};

const DIFFICULTY_LEVEL = { Beginner: 1, Intermediate: 2, Advanced: 3 };
const DIFFICULTY_COLOR = {
  Beginner: "var(--color-green)",
  Intermediate: "var(--gold)",
  Advanced: "var(--danger)",
};

/* ---------------- Lesson icons - small, self-contained glyph set ---------------- */
const ICONS = {
  bolt: (c) => <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill={c} />,
  bulb: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.45 1 1.2 1 2.1h5c0-.9.4-1.65 1-2.1A6 6 0 0 0 12 3z" />
    </g>
  ),
  branch: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <path d="M4 12h4M20 6h-4M20 18h-4M8 12 16 6M8 12l8 6" />
    </g>
  ),
  loop: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <path d="M4 8V6a2 2 0 0 1 2-2h5" />
      <path d="M20 16v2a2 2 0 0 1-2 2h-5" />
      <path d="M4 12h5m6 0h5" strokeDasharray="2 2.5" />
    </g>
  ),
  bands: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none">
      <rect x="4" y="9" width="16" height="6" rx="2" />
      <path d="M8 9v6M11 9v6M14.5 9v6" stroke="#0a0e13" strokeWidth="2" />
    </g>
  ),
  toggle: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <rect x="4" y="8" width="16" height="8" rx="4" />
      <circle cx="15" cy="12" r="2.6" fill={c} stroke="none" />
    </g>
  ),
  gauge: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <path d="M4 15a8 8 0 0 1 16 0" />
      <path d="M12 15 16 9" />
      <circle cx="12" cy="15" r="1.4" fill={c} stroke="none" />
    </g>
  ),
  plusMinus: (c) => (
    <g stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round">
      <path d="M7 8v6M4 11h6" />
      <path d="M14 11h6" />
    </g>
  ),
  diode: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinejoin="round">
      <path d="M4 12h6" strokeLinecap="round" />
      <path d="M10 7v10l7-5-7-5z" />
      <path d="M17 7v10" strokeLinecap="round" />
      <path d="M17 12h3" strokeLinecap="round" />
    </g>
  ),
  capacitor: (c) => (
    <g stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round">
      <path d="M4 12h6" />
      <path d="M10 6v12M14 6v12" />
      <path d="M14 12h6" />
    </g>
  ),
  coil: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <path d="M3 12h2" />
      <circle cx="8" cy="12" r="2.6" />
      <circle cx="12.5" cy="12" r="2.6" />
      <circle cx="17" cy="12" r="2.6" />
      <path d="M19.5 12h2" />
    </g>
  ),
  transistor: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M9 8v8M9 12h4M13 12l4-4M13 12l4 4" />
    </g>
  ),
  radar: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <path d="M12 12 20 8" />
      <path d="M15 5.5a8 8 0 0 1 0 13" />
      <path d="M12.5 8.7a4 4 0 0 1 0 6.6" />
      <circle cx="12" cy="12" r="1.6" fill={c} stroke="none" />
    </g>
  ),
  gate: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 6v12h4a6 6 0 0 0 0-12H5z" />
      <path d="M2 9h3M2 15h3M19 12h3" />
    </g>
  ),
  chip: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <path d="M9 6V3M15 6V3M9 21v-3M15 21v-3M6 9H3M6 15H3M21 9h-3M21 15h-3" />
      <path d="M16.5 7.5c1.6-1.6 1.6-1.6 3-.2" />
    </g>
  ),
  document: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 12h5M9.5 15h5M9.5 9h2" />
    </g>
  ),
  grid: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <rect x="4" y="5" width="16" height="14" rx="1.5" />
      {[7, 10.5, 14, 17].map((x) => (
        <line key={x} x1={x} y1="7" x2={x} y2="17" strokeDasharray="0.1 3" />
      ))}
    </g>
  ),
  wrench: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5l-6 6 2.4 2.4 6-6a4 4 0 0 0 5-5.4l-2.6 2.6-2-2 2.6-2.6z" />
    </g>
  ),
  people: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="2.6" />
      <path d="M4 19c0-3 2.2-5 5-5s5 2 5 5" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M15 19c.2-2.3 1.7-4 3.8-4.3" />
    </g>
  ),
  sigma: (c) => (
    <g stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 5h10l-6 7 6 7H7" />
    </g>
  ),
  power: (c) => (
    <g stroke={c} strokeWidth="1.5" fill="none">
      <circle cx="12" cy="12" r="9" />
      <path d="M13 7 8 13h4l-1 4 5-6h-4l1-4z" fill={c} stroke="none" />
    </g>
  ),
  fuse: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h4" />
      <rect x="6" y="8" width="12" height="8" rx="2" />
      <path d="M8.5 12h1l1-3 2 6 2-6 1 3h1" />
      <path d="M18 12h4" />
    </g>
  ),
  relay: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="7" height="8" rx="1.5" />
      <path d="M10 12h2.5" strokeDasharray="1.4 1.6" />
      <path d="M14.5 12 20 8" />
      <path d="M14.5 12 20 16" strokeOpacity="0.4" />
      <circle cx="14.5" cy="12" r="1.3" fill={c} stroke="none" />
    </g>
  ),
  regulator: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="12" height="10" rx="2" />
      <circle cx="12" cy="8.4" r="1.3" />
      <path d="M9 14v6M12 14v7M15 14v6" />
    </g>
  ),
  pullResistor: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" />
      <path d="M9 6h1l1 2.5 2-5 2 5 1-2.5h1" />
      <path d="M12 11v10" strokeDasharray="1.6 1.8" />
    </g>
  ),
  batteryCells: (c) => (
    <g stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round">
      <path d="M2 12h4" />
      <path d="M7 7v10" strokeWidth="2.4" />
      <path d="M9.5 9v6" />
      <path d="M13.5 7v10" strokeWidth="2.4" />
      <path d="M16 9v6" />
      <path d="M18.5 12H22" />
    </g>
  ),
  pwm: (c) => (
    <g stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 16h3.5v-8H9v8h3.5v-4H16v4h3.5v-8H22" />
    </g>
  ),
  solder: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21l6-6" />
      <path d="M9 16l7-7 3 3-7 7z" />
      <circle cx="19" cy="6" r="1.4" fill={c} stroke="none" />
    </g>
  ),
  exportIcon: (c) => (
    <g stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v10" />
      <path d="M8 9l4 4 4-4" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </g>
  ),
  /* ---- new glyphs ---- */
  transformer: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <path d="M2 8v8M2 8h2M2 16h2" />
      <circle cx="8" cy="9" r="2" />
      <circle cx="8" cy="13" r="2" />
      <path d="M11 6v12" strokeDasharray="0.1 2.4" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="16" cy="16" r="2" />
      <path d="M22 8v8M22 8h-2M22 16h-2" />
    </g>
  ),
  rectify: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12c2 0 2-6 4-6s2 6 4 6 2-6 4-6 2 6 4 6 2-6 4-6" opacity="0.35" />
      <path d="M2 16c2 0 2-4 4-4s2 4 4 4 2-4 4-4 2 4 4 4 2-4 4-4" />
    </g>
  ),
  wave: (c) => (
    <g stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12c2.5-6 4.5-6 6 0s3.5 6 6 0 4.5-6 6-6" />
    </g>
  ),
  groundSym: (c) => (
    <g stroke={c} strokeWidth="1.7" fill="none" strokeLinecap="round">
      <path d="M12 3v8" />
      <path d="M6 11h12" />
      <path d="M8 14.5h8" />
      <path d="M10 18h4" />
    </g>
  ),
  wireGauge: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 15c4-4 6-6 9-6s6 2 9 2" />
      <path d="M4 5 8 9M8 5 4 9" />
      <path d="M20 15v4M17 17h6" />
    </g>
  ),
  motor: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <circle cx="12" cy="12" r="7" />
      <text x="12" y="15.5" fontSize="8" fill={c} stroke="none" textAnchor="middle" fontFamily="sans-serif">M</text>
      <path d="M2 12h3M19 12h3" />
    </g>
  ),
  servo: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="9" width="10" height="10" rx="1.5" />
      <path d="M10 9V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2" />
      <path d="M14 5 19 3" />
    </g>
  ),
  stepper: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 12 12 5M12 12l6 3M12 12l-5.6 3.2" />
      <circle cx="12" cy="12" r="1.3" fill={c} stroke="none" />
    </g>
  ),
  opamp: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6v12l12-6z" />
      <path d="M2 9h4M2 15h4M18 12h4" />
      <path d="M8 8.5h2M8 15.5h2" />
    </g>
  ),
  bus: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18" strokeDasharray="2 2" />
      <circle cx="7" cy="6" r="1.2" fill={c} stroke="none" />
      <circle cx="14" cy="12" r="1.2" fill={c} stroke="none" />
      <circle cx="10" cy="18" r="1.2" fill={c} stroke="none" />
    </g>
  ),
  adcStair: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 16c2-8 4-10 6-10" opacity="0.35" />
      <path d="M2 18h3v-3h3v-3h3v-3h3v-3h4" />
    </g>
  ),
  ledMatrixGrid: (c) => (
    <g fill={c}>
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((col) => (
          <circle key={`${r}-${col}`} cx={7 + col * 5} cy={7 + r * 5} r="1.6" opacity={r === 1 && col === 1 ? 1 : 0.45} />
        ))
      )}
    </g>
  ),
  buzzerWave: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10v4h3l5 4V6l-5 4H3z" />
      <path d="M15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12" opacity="0.7" />
    </g>
  ),
  cellChem: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="7" width="13" height="10" rx="1.5" />
      <path d="M17 10v4" strokeWidth="2.4" />
      <path d="M8 10v4M10.5 10v4" opacity="0.6" />
      <circle cx="20" cy="9" r="1.2" fill={c} stroke="none" />
      <circle cx="20" cy="13" r="1.2" fill={c} stroke="none" opacity="0.5" />
    </g>
  ),
  heatsinkFins: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <path d="M4 20V6M8 20V6M12 20V6M16 20V6M20 20V6" />
      <path d="M3 6h18" />
    </g>
  ),
  buckBoost: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 17h4l3-10 3 10 3-10 3 10h4" />
    </g>
  ),
  shuntResistor: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h3l1.5-4 3 8 3-8 3 8 1.5-4H22" />
    </g>
  ),
  connectorPlug: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3v5M15 3v5" />
      <path d="M6 8h12v4a6 6 0 0 1-12 0V8z" />
      <path d="M12 18v3" />
    </g>
  ),
  oscilloscope: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="13" rx="1.5" />
      <path d="M5 11c1.5 0 1.5-4 3-4s1.5 6 3 6 1.5-5 3-5 1.5 3 3 3 1.5-2 3-2" />
      <path d="M8 20h8" />
    </g>
  ),
};

/* ---------------- Lesson content ---------------- */
const TOPICS = [
  {
    icon: "bolt", tag: "Fundamentals", difficulty: "Beginner",
    title: "Ohm's Law — the one formula everything else builds on",
    summary: "V = I x R. Know any two, find the third.",
    body: `Ohm's Law says V = I x R — voltage equals current times resistance. If you know any two of those, you can find the third.

A 9V battery pushing current through a 220 ohm resistor gives I = V / R = 9 / 220, about 41mA. That's the same math CircuitLab's simulator runs to give you real voltage/current/power numbers when you hit "Run circuit."

Higher resistance means less current for the same voltage. That's why a resistor in series with an LED protects it — it limits how much current can flow.

Worth memorizing the shortcut triangle: cover the quantity you want, and the other two show you whether to multiply or divide. Cover V and you see I next to R, so V = I x R. Cover I and you see V over R, so I = V / R. It's a small trick, but it removes the guesswork when you're solving on paper mid-build.`,
  },
  {
    icon: "power", tag: "Fundamentals", difficulty: "Beginner",
    title: "Power in a circuit: P = I x V",
    summary: "The formula behind every wattage rating you'll see.",
    body: `Power is the rate energy is used, measured in watts. P = I x V — multiply the current through a component by the voltage across it, and you get the power it's dissipating.

Combine it with Ohm's Law and you get two more useful forms: P = I squared x R, and P = V squared / R. Any one of them works — pick whichever two quantities you already know.

This is exactly why resistors carry a power rating (in watts) alongside their resistance value: exceed it and the resistor overheats. A typical small resistor is rated around a quarter watt, which is why component choice matters even in a simple LED circuit.

It's worth sanity-checking power before you build, not after something gets hot. A 5V rail driving a 100 ohm resistor dissipates 5 squared / 100 = 0.25W — right at the edge of a standard quarter-watt part. Bump the voltage to 12V on the same resistor and it jumps to 1.44W, nearly six times as much, which is exactly the kind of change that quietly cooks a part sized for the wrong rail.`,
  },
  {
    icon: "sigma", tag: "Fundamentals", difficulty: "Intermediate",
    title: "Kirchhoff's Current and Voltage Laws",
    summary: "What goes in must come out — and around a loop, voltage sums to zero.",
    body: `Kirchhoff's Current Law (KCL) says the current flowing into any junction must equal the current flowing out. Nothing is created or lost at a connection point — it just splits or combines.

Kirchhoff's Voltage Law (KVL) says that if you add up all the voltage rises and drops going around any closed loop, they sum to zero. Whatever voltage the source provides gets "spent" exactly across the components in that loop.

Together these two rules are what let you solve circuits that are too tangled for simple series/parallel math — and they're the underlying logic CircuitLab's simulator is applying every time it works out real voltage and current values for a circuit you've wired up.

A practical use of KCL: if three wires meet at a junction and two are carrying 30mA and 15mA into it, the third wire must be carrying 45mA out, whether or not you can trace where it eventually goes. That's often faster than tracing the whole path by eye, especially once a circuit has several branches feeding the same node.`,
  },
  {
    icon: "bulb", tag: "Components", difficulty: "Beginner",
    title: "Why your LED needs a resistor",
    summary: "LEDs don't limit their own current — they'll happily burn out.",
    body: `An LED doesn't limit current on its own — hook one directly across a battery and it'll try to draw as much current as the circuit allows, which is usually way more than the ~20mA it can handle. It burns out almost instantly.

A resistor in series fixes this. Pick one large enough to keep current under the LED's rated maximum (check its datasheet — most common LEDs are happy around 15-20mA).

This is exactly what CircuitLab's simulator checks: run a bare LED across a battery and you'll get a real calculated current figure, flagged the moment it exceeds ~20mA.

Sizing that resistor is one subtraction and one division: R = (supply voltage - LED forward voltage) / target current. A red LED with a ~2V forward drop on a 9V supply, aiming for 15mA, needs about (9 - 2) / 0.015 ≈ 467 ohms — round up to the nearest standard value (like 470 ohms) rather than down, since a slightly higher resistance is safe while a lower one risks overdriving the LED.`,
  },
  {
    icon: "branch", tag: "Fundamentals", difficulty: "Beginner",
    title: "Series vs. parallel circuits",
    summary: "Same current, divided voltage — or the reverse.",
    body: `Series: components are connected end-to-end in a single loop. The same current flows through all of them, but voltage divides across each one.

Parallel: components are connected across the same two points. Voltage is the same across each branch, but current divides between them.

Most real circuits are a mix of both — a battery might power two parallel branches, each of which has components wired in series. Try building a two-resistor voltage divider in the Builder and watch the voltages split exactly according to their ratio.

There's a quick way to tell which you're looking at without tracing every wire: if removing one component breaks the path for everything else on that loop, it's series. If removing one component leaves the rest still working, it's parallel. That single test is often faster than following wires with your eyes, especially on a busier board.`,
  },
  {
    icon: "loop", tag: "Fundamentals", difficulty: "Beginner",
    title: "Open circuits, closed circuits, and short circuits",
    summary: "The three states every circuit you build can be in.",
    body: `A closed circuit has a complete loop from the power source, through your components, and back — current can flow, and things work.

An open circuit has a break somewhere in that loop — a disconnected wire, an open switch — so no current flows at all. Nothing lights up, nothing runs.

A short circuit happens when current finds a path with little or no resistance between the two terminals of your source — like a wire connected straight across a battery. Current spikes far beyond what the source or wires are meant to handle. In real electronics this can overheat components, damage the battery, or start a fire. CircuitLab's simulator flags this explicitly as a "short" result with a dangerously high current reading.

Shorts aren't always as obvious as a bare wire bridging the terminals — a solder blob connecting two adjacent pads, a stray wire strand, or a component wired backwards can all create one accidentally. That's part of why the troubleshooting checklist starts with tracing the loop by eye before assuming a part has failed.`,
  },
  {
    icon: "bands", tag: "Components", difficulty: "Beginner",
    title: "Reading resistor color bands",
    summary: "Four stripes, one number.",
    body: `Most resistors use 4 colored bands to encode their value. The first two bands are significant digits, the third is a multiplier, and the fourth is tolerance.

Common colors as digits: black=0, brown=1, red=2, orange=3, yellow=4, green=5, blue=6, violet=7, grey=8, white=9.

Example: red-red-brown-gold reads as 2, 2, x10, giving 220 ohms, +/-5% tolerance (gold). That's the exact resistor CircuitLab uses as its default catalog value.

Five-band resistors work the same way but with an extra digit of precision: three significant-digit bands, then a multiplier, then tolerance — common on tighter, +/-1% tolerance parts. Either way, the tolerance band tells you how far the real resistor is allowed to drift from its printed value; gold is +/-5%, silver is +/-10%, and no fourth band at all traditionally means +/-20%.`,
  },
  {
    icon: "toggle", tag: "Components", difficulty: "Beginner",
    title: "What a switch actually does",
    summary: "A controllable break in a wire — nothing more.",
    body: `A switch is just a controllable break in a wire. Closed (on), it behaves like a plain wire — near-zero resistance, current flows freely. Open (off), it behaves like a total break — infinite resistance, no current at all.

In the Builder, click a placed switch (or the ON/OFF pill on its label) to toggle it — you'll see the lever flip and its color change, and running the circuit again will reflect whether that path is now open or closed. Rocker and slide switches work exactly the same way, just with a different real-world form factor.

Beyond simple on/off, real switches come in a few common contact arrangements worth knowing by name: SPST (single pole, single throw) is the basic one-wire-path switch described above; SPDT (single pole, double throw) routes one input to one of two outputs, useful for choosing between two power sources or signal paths from a single switch.`,
  },
  {
    icon: "relay", tag: "Components", difficulty: "Intermediate",
    title: "Relays: using a small signal to switch a big one",
    summary: "An electromagnet, a spring, and a set of contacts.",
    body: `A relay is a mechanical switch controlled by an electromagnet. Send current through its coil and the resulting magnetic field pulls a lever, which physically opens or closes a separate set of contacts.

The key idea is isolation: the coil side (say, a low-voltage signal from a microcontroller) and the contact side (which might switch mains voltage to a motor or appliance) are electrically separate. A small, safe signal can control a much larger, more dangerous one without the two ever touching.

This is what makes relays common anywhere a microcontroller needs to switch something it can't safely touch directly — a solid-state alternative using a transistor works on a similar isolation principle, but without moving parts.

One detail that trips people up: a relay's coil is itself an inductor, and when you cut power to it, the collapsing magnetic field generates a brief voltage spike that can damage nearby transistors driving it. That's why relay modules almost always include a small "flyback" diode wired backwards across the coil, giving that spike a safe path to dissipate instead of jumping into the driving circuit.`,
  },
  {
    icon: "fuse", tag: "Components", difficulty: "Beginner",
    title: "Fuses and circuit protection",
    summary: "A wire deliberately designed to fail first.",
    body: `A fuse is a thin strip of metal designed to melt and break the circuit if current exceeds a rated threshold. It's a sacrificial part — once it blows, it has to be replaced (unlike a circuit breaker, which can simply be reset).

The idea is to fail safely and predictably: if a short circuit or fault would otherwise push dangerous current through your wiring, the fuse gives way first, protecting everything downstream of it.

Fuses are rated in amps, and picking one means balancing two things: low enough to blow before your wiring or components are damaged, but high enough that it doesn't trip during normal operation.

Fuses also come in "fast-blow" and "slow-blow" (time-delay) varieties. Fast-blow trips almost instantly at its rated current, suited to sensitive electronics. Slow-blow tolerates brief current spikes — like the surge a motor draws the instant it starts — without tripping, which is why motors and transformers are usually protected with a slow-blow fuse of the same amp rating that a fast-blow would trip on unnecessarily.`,
  },
  {
    icon: "regulator", tag: "Components", difficulty: "Intermediate",
    title: "Voltage regulators: turning messy power into a steady rail",
    summary: "Whatever comes in, a fixed voltage comes out.",
    body: `A voltage regulator takes an input voltage that might be higher than needed, or a little unstable, and outputs a steady, fixed voltage regardless of small fluctuations upstream. A common example is a 7805, which takes anywhere from about 7V to 25V in and outputs a clean 5V.

Linear regulators work by simply dropping the excess voltage as heat, which is simple and clean electrically but wasteful for large voltage differences. Switching regulators convert more efficiently by rapidly switching current on and off, at the cost of more complexity and some electrical noise.

This is the same job a USB power bank or phone charger's internal regulator is doing every time it takes a variable-ish input and hands your device a steady rail.

The heat a linear regulator sheds is easy to estimate: P = (input voltage - output voltage) x current. Feeding a 7805 12V to make 5V at 500mA burns (12 - 5) x 0.5 = 3.5W as heat, which is why linear regulators dropping more than a couple volts almost always need a heatsink, and why a switching regulator becomes the better choice once that gap gets large.`,
  },
  {
    icon: "pullResistor", tag: "Components", difficulty: "Intermediate",
    title: "Pull-up and pull-down resistors",
    summary: "Giving a floating digital input a defined default.",
    body: `A digital input that isn't actively driven high or low doesn't just sit at zero — it "floats," picking up noise and reading unpredictably. A pull-up or pull-down resistor fixes that by weakly connecting the pin to a known rail.

A pull-up resistor connects the pin to the positive rail through a resistor, so it reads HIGH by default and only reads LOW when something actively pulls it down (like a button press connecting it to ground). A pull-down does the opposite — LOW by default, HIGH when actively driven.

This is why a simple pushbutton circuit almost always includes one of these resistors: without it, the reading when the button isn't pressed is essentially random.

Values usually land in the 4.7k-10k ohm range — high enough that the resistor doesn't waste much current or fight the button when it's pressed, but low enough to reliably overpower stray noise. Many microcontrollers, including most Arduino and ESP32 pins, even include a switchable internal pull-up resistor, letting you skip the external part entirely for a simple button.`,
  },
  {
    icon: "batteryCells", tag: "Components", difficulty: "Beginner",
    title: "Batteries in series vs. parallel",
    summary: "Stack for voltage, gang up for capacity.",
    body: `Wiring batteries in series — positive to negative, end to end — adds their voltages together while the capacity (how long they last) stays the same as a single cell. Two 1.5V cells in series give you 3V.

Wiring batteries in parallel — positive to positive, negative to negative — keeps the voltage the same as a single cell but adds their capacities together, so the combination lasts longer under the same load.

Mixing the two (series-parallel packs) is how larger battery packs, like the ones in power tools or laptops, hit both a target voltage and a target capacity at the same time.

One safety note that matters more as pack size grows: never mix batteries of noticeably different charge levels or ages in the same series or parallel group. In series, a weaker cell can be forced into reverse charging by its stronger neighbors; in parallel, a fresher cell will dump current into a weaker one trying to equalize. Both situations generate heat and, with rechargeable chemistries especially, are a real safety concern.`,
  },
  {
    icon: "diode", tag: "Components", difficulty: "Intermediate",
    title: "Diodes and rectification",
    summary: "One-way valves for current.",
    body: `A diode only conducts in one direction — forward bias, from anode to cathode — and blocks current the other way (reverse bias). Real diodes have a small forward voltage drop, typically around 0.7V for silicon diodes.

Zener diodes are a special case: they're designed to conduct in reverse once a specific breakdown voltage is reached, which makes them useful as voltage references. Schottky diodes have a lower forward drop, which matters in power-efficient designs.

A bridge rectifier is four diodes arranged to convert AC (which alternates direction) into pulsing DC (which only flows one way) — the basis of nearly every mains power adapter.

CircuitLab's simulator models diodes with a real forward-voltage drop, and figures out which direction current actually wants to flow rather than just assuming.

Diodes also show up purely for protection rather than signal shaping — a "reverse polarity" diode placed in series with a battery input simply refuses to conduct if the battery gets connected backwards, sacrificing a small forward-voltage loss in exchange for protecting everything downstream from a wiring mistake.`,
  },
  {
    icon: "capacitor", tag: "Components", difficulty: "Intermediate",
    title: "Capacitors: storing charge, blocking DC",
    summary: "They charge up, then stop conducting.",
    body: `A capacitor stores energy as an electric field between two plates. When you first apply voltage, current flows to charge it up — but once it's fully charged, no more current flows through it in steady-state DC.

This is why capacitors are described as "blocking DC" — in a circuit that's been powered for a while, a capacitor branch simply stops carrying current. CircuitLab's simulator applies exactly this rule: capacitors are treated as an open circuit in the DC steady-state analysis, which is the physically correct behavior.

Where capacitors matter is in filtering and smoothing — evening out ripples in a power supply — and in timing circuits, where the charge/discharge rate sets a delay.

Capacitance is measured in farads, though a full farad is enormous for most electronics — everyday values are in microfarads (uF), nanofarads (nF), or picofarads (pF). A bigger capacitor stores more charge and smooths larger ripples, but also takes proportionally longer to charge and discharge through a given resistance, which is the exact relationship an RC timing circuit is built around.`,
  },
  {
    icon: "coil", tag: "Components", difficulty: "Advanced",
    title: "Inductors and why they're a dead short in DC",
    summary: "The mirror image of a capacitor.",
    body: `An inductor is a coil of wire that resists changes in current by storing energy in a magnetic field. When current is changing (like in AC), it pushes back. But once current has settled into a steady DC flow, an ideal inductor behaves like a plain wire — zero resistance.

That's the opposite of a capacitor, which is open in steady-state DC. CircuitLab's simulator applies this correctly: inductors are merged into the circuit as a zero-resistance connection, same as a wire.

In practice, inductors show up in filters, chokes, and switching power converters — anywhere you need to smooth out rapid current changes.

Like a relay's coil, an inductor fights sudden current changes hard enough to generate a real voltage spike the instant current is interrupted — the same physical effect, just without the mechanical contacts. It's why switching regulators and motor drivers are always designed with that collapsing field in mind, usually with a diode or snubber circuit to give the spike somewhere safe to go.`,
  },
  {
    icon: "transistor", tag: "Components", difficulty: "Advanced",
    title: "Transistors as switches",
    summary: "A small current controlling a much bigger one.",
    body: `A transistor is a three-terminal device. In an NPN transistor, a small current flowing into the base lets a much larger current flow from collector to emitter — effectively using a weak signal to control a strong one. That's the basis of both amplification and digital switching.

MOSFETs work on a similar principle but are voltage-controlled rather than current-controlled, and can switch much higher power efficiently — they're the backbone of modern power electronics.

Because real transistor behavior depends on three terminals and nonlinear equations, CircuitLab's simplified two-terminal simulation doesn't calculate exact currents through them yet — they're a known, documented limitation rather than a hidden gap. They still work great as visual/logical placeholders in a design.

A useful mental model: think of an NPN transistor as a valve where the base current controls how far the valve opens for current flowing collector-to-emitter. Fully "open" (saturated) it behaves close to a closed switch; fully "closed" (cut off) it behaves close to an open one — which is exactly why transistors are so common anywhere a microcontroller's tiny output pin needs to switch something bigger, like a motor or a strip of LEDs.`,
  },
  {
    icon: "radar", tag: "Components", difficulty: "Intermediate",
    title: "How sensors turn the world into resistance",
    summary: "Light, heat, and motion — measured as changing resistance.",
    body: `Many simple sensors work by changing their resistance in response to something physical. A photoresistor (LDR) drops in resistance as more light hits it. A thermistor's resistance shifts predictably with temperature. Pair either with a fixed resistor and you get a voltage divider whose output voltage reveals the reading.

Other sensors — PIR motion, ultrasonic distance, gas, humidity, touch — work on different physical principles entirely (infrared, sound reflection, chemical reactions, capacitance) and typically output a digital or analog signal rather than a simple resistance.

CircuitLab's catalog includes both types. LDRs and thermistors participate in the live simulation as resistive elements; the more specialized sensors are represented visually and functionally in the Builder, without a simplified electrical model behind them yet.

A PIR (passive infrared) motion sensor, for example, doesn't measure resistance at all — it watches for a sudden change in infrared radiation across its field of view, which is what a moving warm body produces, and outputs a simple digital HIGH when it detects that change. An ultrasonic sensor instead times how long a sound pulse takes to bounce back, converting that delay into a distance using the speed of sound.`,
  },
  {
    icon: "gate", tag: "Digital", difficulty: "Intermediate",
    title: "Logic gates: the building blocks of digital circuits",
    summary: "AND, OR, NOT — and everything built from them.",
    body: `A logic gate takes one or more digital inputs (each either HIGH or LOW) and produces a single digital output based on a fixed rule.

AND outputs HIGH only if every input is HIGH. OR outputs HIGH if any input is HIGH. NOT simply flips its single input. NAND and NOR are AND/OR with the output inverted — and are actually "universal" gates, meaning any other gate can be built from enough of just one of them. XOR outputs HIGH only when its inputs differ.

A flip-flop goes a step further: it's a gate arrangement that can hold (remember) a single bit of state, which is the foundation of registers, counters, and memory.

All of these ship in CircuitLab's catalog as realistic DIP-package chips, ready to drop into a design.

A truth table is the clearest way to check your understanding of any gate: list every possible combination of inputs, and write down the output for each. For a 2-input AND gate there are only four rows — LOW/LOW, LOW/HIGH, HIGH/LOW, HIGH/HIGH — and only the last one outputs HIGH. Once that habit is automatic, reasoning through a multi-gate circuit becomes a matter of working through it one gate at a time rather than trying to hold the whole thing in your head at once.`,
  },
  {
    icon: "pwm", tag: "Digital", difficulty: "Intermediate",
    title: "PWM: faking an analog output digitally",
    summary: "Switching fast enough that the average looks smooth.",
    body: `A digital pin can only really be fully on or fully off — but PWM (pulse-width modulation) fakes something in between by switching on and off very rapidly and varying how much of each cycle is spent HIGH versus LOW.

That fraction is the "duty cycle." A 25% duty cycle spends a quarter of each cycle HIGH — to an LED, a motor, or your eye, the switching happens fast enough that it just looks like 25% brightness or 25% speed rather than a flicker.

It's how microcontrollers dim LEDs, control motor speed, and even generate rough audio, all using pins that are technically only capable of a hard on/off.

The other setting that matters alongside duty cycle is frequency — how many on/off cycles happen per second. Too low, and you'll actually see or hear the switching as flicker or a buzz; typical PWM frequencies for dimming an LED run in the hundreds of hertz to kilohertz range, well above what the eye or, for motors, the mechanics can perceive as anything but smooth.`,
  },
  {
    icon: "gauge", tag: "Tools", difficulty: "Intermediate",
    title: "Using a multimeter (the real-world version of Run circuit)",
    summary: "Voltage, current, and continuity — one tool, three modes.",
    body: `A multimeter measures voltage, current, or resistance depending on its mode.

Voltage mode: probes go across (in parallel with) the component you're measuring.
Current mode: the meter goes in series, becoming part of the circuit path itself.
Continuity/resistance mode: checks whether two points are electrically connected — this is basically what CircuitLab's connectivity check is doing in software, and what the live Readings panel is doing when it shows you real voltage/current per part.

Always start on the highest range if you're unsure, and never measure resistance on a circuit that still has power connected.

Current mode is the one people get wrong most often, because it means breaking the circuit open and inserting the meter itself into the path — measure current the way you'd measure voltage, in parallel, and you're effectively creating a short through the meter, which can blow its internal fuse. If you only remember one rule: voltage probes go across a component without touching its wires, current probes become part of the wire.`,
  },
  {
    icon: "solder", tag: "Tools", difficulty: "Beginner",
    title: "Soldering basics: making a joint that lasts",
    summary: "Heat the parts, not the solder.",
    body: `Good soldering comes down to one habit: heat the joint — the component lead and the pad or wire together — with the iron tip, then feed solder into the heated joint, not onto the tip itself. Molten solder should flow toward the heat and coat both surfaces smoothly.

A good joint looks shiny and slightly concave, like a small volcano, with a clean, defined shape. A dull, grainy, or blobby joint usually means it wasn't heated enough — a "cold joint" — and can fail electrically even though it looks vaguely connected.

Keep the tip clean on a damp sponge or brass wool between joints, and give a fresh joint a second or two to cool undisturbed before moving the wire — motion while it's still liquid is one of the most common causes of a bad connection.

Most modern solder for electronics is already "rosin-core," meaning a thin channel of flux runs through the middle of the wire and gets released as it melts. That flux is doing real work: it cleans oxidation off the metal right as you solder, which is what lets the solder actually bond instead of beading up. If a joint looks dull no matter how careful you are, a fresh spool of solder or a touch of separate flux paste is often the fix.`,
  },
  {
    icon: "plusMinus", tag: "Components", difficulty: "Beginner",
    title: "Polarity — why + and - matter",
    summary: "Some parts only work one way round.",
    body: `Some components only work one way round. Batteries, LEDs, electrolytic capacitors, solar panels, and coin cells are polarized — connect them backwards and at best they won't work, at worst (especially electrolytic capacitors) they can be damaged or dangerous.

In the Builder, polarized parts show a glowing + (red) and - (blue) at their terminals so you can see which way current is meant to flow before you wire them in.

Manufacturers mark polarity in a few common ways worth learning to spot on real parts: LEDs usually have one lead longer than the other (longer = positive/anode) and often a flat edge on the case near the negative side; electrolytic capacitors print a stripe of minus signs down the negative side; and most connectors and battery holders are keyed or labeled so they only physically fit one way.`,
  },
  {
    icon: "chip", tag: "Using CircuitLab", difficulty: "Beginner",
    title: "Microcontrollers vs. batteries — what ESP32/Arduino actually add",
    summary: "A power source that can also think.",
    body: `In CircuitLab, boards like the ESP32, Arduino Uno, Arduino Nano, and Raspberry Pi Pico behave as power sources in the simulation, the same way a battery does — they output a fixed voltage (3.3V or 5V depending on the board).

What makes them different in real life is that they're programmable: instead of just supplying power, they can read sensors, make decisions, and switch outputs on and off in code — a battery can't decide anything. An ESP32 specifically adds built-in Wi-Fi and Bluetooth, which is why it's the default choice for IoT projects.

Treating them as sources in the simplified model is a deliberate simplification — it lets you power a circuit realistically without needing to simulate actual firmware.

Board choice usually comes down to three questions: how many pins do you need, does the project need wireless connectivity, and how much current can the board's regulator actually supply to your circuit alongside itself. A Nano is fine for a small standalone sensor project; an ESP32 earns its keep the moment the project needs to talk to the internet or another device wirelessly.`,
  },
  {
    icon: "document", tag: "Tools", difficulty: "Intermediate",
    title: "Reading a datasheet: the numbers that actually matter",
    summary: "Four ratings to check before you trust a part.",
    body: `Every real component has a datasheet, and most of what you need from it boils down to a handful of numbers: the rated voltage or forward voltage, the maximum current, the power rating (for resistors, in watts), and the tolerance (how far the real part can vary from its labeled value).

Exceed the current or power rating and a part can overheat or fail — this is exactly what CircuitLab's "Run circuit" warnings are checking for, using the same ratings shown in each part's spec panel on the Components page.

Tolerance matters more in precision circuits than beginner ones — a +/-5% resistor is fine for an LED current limiter, but not for a precise timing circuit.

Two more figures worth learning to spot: the "absolute maximum ratings" table, which lists the hard limits a part can survive briefly without instant failure (not the limits it should be run at continuously), and the operating temperature range, which matters far more once a project leaves a climate-controlled room — a sensor rated for 0-50°C is not a safe choice for something left outdoors.`,
  },
  {
    icon: "grid", tag: "Tools", difficulty: "Beginner",
    title: "Prototyping on a breadboard",
    summary: "Solderless connections for fast iteration.",
    body: `A breadboard is a reusable prototyping surface — rows of holes connected internally so you can plug components in and wire them together without soldering. Rows in the middle section are typically connected in short groups (for placing components across the center gap), while the outer rows form long power rails for shared +V and ground connections.

Terminal blocks serve a related purpose in permanent installations — screw-down connectors for joining wires securely, often used for shared power distribution rather than fast iteration.

Both are included in CircuitLab's catalog under Tools/Misc, mainly as a way to visually represent a real prototyping setup alongside your simulated components.

Once a breadboard design is working and needs to move somewhere more permanent, a perfboard (a rigid board of individually plated holes, no internal connections) is the usual next step — parts get soldered directly to it and hand-wired underneath, trading breadboard's instant reconfigurability for a build that survives being moved, bumped, or shipped.`,
  },
  {
    icon: "wrench", tag: "Troubleshooting", difficulty: "Beginner",
    title: "Troubleshooting checklist: my circuit isn't working",
    summary: "Work through these before assuming something's broken.",
    body: `1. Is there a power source on the board at all? No battery/board means nothing can ever run — CircuitLab will tell you this directly.

2. Is the loop actually closed? Trace the path with your eyes from the source's + terminal, through every part, back to its - terminal. A single missing wire breaks everything downstream of it.

3. Is a switch in the "off" position? Easy to forget — check the label pill on any switches in the path.

4. Is a polarized part backwards? LEDs, batteries, and electrolytic capacitors care which way round they're connected.

5. Check the suggestions panel after running — it's specifically looking for the most common mistakes (missing resistors, unconnected parts, open loops) and will usually point you straight at the fix.

6. If everything above checks out and it still won't work, isolate the problem by simplifying: strip the circuit down to just the power source and one component at a time, confirming each piece works in isolation before reconnecting the rest. It's slower than eyeballing the whole board at once, but it turns "something is wrong somewhere" into a specific, findable fault.`,
  },
  {
    icon: "people", tag: "Using CircuitLab", difficulty: "Beginner",
    title: "Working with teammates: sharing a circuit",
    summary: "One circuit, edited from more than one account.",
    body: `For group projects, open a circuit in the Builder and click the Share button to invite a teammate by the email they registered with. Once invited, they can open the exact same project from their own account on their own device and see (and edit) the same layout.

This works on a "whoever saves last wins" basis rather than live, cursor-by-cursor syncing — closer to a shared document than a real-time collaborative canvas. It's enough for splitting up a group project (one person handles the sensor section, another the power supply) as long as you're not editing at the exact same moment.

Shared projects show up on both people's dashboards, tagged so you can tell it's a team circuit rather than a personal one.

Because saves overwrite rather than merge, the most reliable workflow for a team is to divide the board into clearly separate sections and agree on who edits which, rather than both people adjusting the same wiring at the same time — the same discipline you'd use with any shared document that doesn't support simultaneous editing.`,
  },
  {
    icon: "exportIcon", tag: "Using CircuitLab", difficulty: "Beginner",
    title: "Saving and exporting your circuit",
    summary: "Keep a copy, or move your design somewhere else.",
    body: `CircuitLab autosaves your work as you build, so your circuit is there the next time you open it from your dashboard — no separate save step needed.

When you want a copy outside the app, use Export from the Builder to download your circuit as an image or a project file, handy for a lab report, a portfolio piece, or attaching to an assignment.

Renaming a project from the dashboard just relabels it for you — it doesn't change anything about the circuit itself, so feel free to give things clear names as your project list grows.

If you're building toward a real physical version of a circuit later, exporting early and often is worth the habit — a saved image captures the exact layout and part values you tested virtually, so you're not relying on memory when you sit down to breadboard or solder the real thing.`,
  },
  /* ---------------- New lessons ---------------- */
  {
    icon: "wave", tag: "Fundamentals", difficulty: "Beginner",
    title: "AC vs. DC: two ways current can flow",
    summary: "One direction, or back and forth many times a second.",
    body: `DC (direct current) flows in one direction only — the kind a battery, a solar panel, or a USB port supplies. Voltage might be steady or it might ripple a little, but current only ever flows one way around the loop.

AC (alternating current) reverses direction on a regular cycle — mains power in most of the world alternates 50 or 60 times per second, tracing a smooth sine wave between positive and negative.

AC is the practical choice for long-distance power transmission because transformers can step its voltage up or down easily, cutting transmission losses. DC is what almost every electronic component inside your devices actually needs to run on — which is why nearly every AC-powered gadget hides a small rectifier and regulator that converts mains AC down to clean, steady DC before it ever reaches the electronics.

Nearly every circuit built in CircuitLab's simulator is DC — batteries, boards, and the Builder's steady-state analysis all assume current settles into one direction, which is exactly the assumption that makes capacitors act as open circuits and inductors act as plain wires once things stabilize.`,
  },
  {
    icon: "rectify", tag: "Components", difficulty: "Intermediate",
    title: "Half-wave vs. full-wave rectification",
    summary: "Turning the negative half of an AC wave into something usable.",
    body: `A single diode gives you half-wave rectification: it passes the positive half of an AC wave and blocks the negative half entirely, leaving a pulsing signal with gaps where the negative half used to be. Simple, but wasteful — half the wave is thrown away.

A bridge rectifier — four diodes arranged so current always flows the same direction through the load regardless of which way the AC input is currently swinging — gives full-wave rectification instead. Both halves of the original wave get used, flipped into the same polarity, so the output pulses twice as often with no gaps.

Either way, what comes out is still pulsing DC, not smooth DC — it's momentarily at zero (half-wave) or dips toward zero (full-wave) on every cycle. That's where a smoothing capacitor comes in: placed across the output, it charges on each pulse and slowly discharges through the load in between, filling in the dips into something close to steady DC.

This two-stage pattern — rectify, then smooth — is exactly what sits behind the plug of most simple AC-powered devices, right before the regulator that cleans the remaining ripple into a precise voltage.`,
  },
  {
    icon: "transformer", tag: "Components", difficulty: "Advanced",
    title: "Transformers: changing AC voltage without touching DC",
    summary: "Two coils, a shared core, and a turns ratio.",
    body: `A transformer has two coils of wire wound around a shared iron core, electrically isolated from each other. Alternating current in the primary coil creates a changing magnetic field in the core, which induces a matching alternating voltage in the secondary coil — with no direct electrical connection between the two sides.

The voltage ratio between primary and secondary matches the ratio of turns in each coil. A transformer with twice as many turns on the secondary as the primary doubles the voltage (a "step-up" transformer); half as many turns halves it ("step-down").

Because transformers only respond to a changing magnetic field, they only work on AC — feed one DC and, after the initial surge as the field builds, current through the primary simply stops changing and induction stops happening, so the secondary sees nothing.

This is a big part of why power grids use AC in the first place: transmitting electricity at very high voltage and low current keeps resistive losses down over long distances, and a transformer is the simple, efficient way to step voltage up for transmission and back down to something safe before it reaches a wall outlet.`,
  },
  {
    icon: "groundSym", tag: "Fundamentals", difficulty: "Beginner",
    title: "Ground and common: the reference every voltage is measured from",
    summary: "Voltage is always relative to something.",
    body: `Voltage is never an absolute quantity — it's always measured between two points. "Ground" (or "common") is simply the point in a circuit chosen as the 0V reference that every other voltage gets measured against.

In a simple battery circuit, ground is usually just the battery's negative terminal. In a circuit with a microcontroller, ground is the pin (often labeled GND) that the board's internal 0V reference connects to — and every sensor, LED, or module sharing that circuit needs its ground wired back to the same point, or the board can't make sense of any voltage it reads.

This matters more than it sounds: two circuits with separate power supplies but no shared ground connection have no common reference point, so a signal from one can't be meaningfully compared or read by the other, even if their voltage levels look compatible on paper. "Common ground" is the fix — tying the ground/negative rails of both supplies together so every voltage in the combined system is being measured against the same zero.

In household electrical wiring, "ground" additionally means something more literal — a safety path to the earth itself, meant to carry fault current away safely rather than through a person. That earth ground and the circuit's 0V reference are related concepts but not always the same node, especially in mains-powered equipment.`,
  },
  {
    icon: "wireGauge", tag: "Tools", difficulty: "Beginner",
    title: "Wire gauge: why thickness matters",
    summary: "Thicker wire, less resistance, more current it can carry safely.",
    body: `Wire has resistance too, just usually small enough to ignore for short runs at low current. That resistance depends on the wire's thickness (gauge) and length — thinner or longer wire has more resistance, which shows up as both wasted power (heat) and voltage drop along the run.

Wire gauge is often specified in AWG (American Wire Gauge), and counterintuitively, a smaller AWG number means thicker wire — 12 AWG is noticeably thicker, and can safely carry more current, than 22 AWG.

For low-current signal wiring (a sensor talking to a microcontroller) gauge barely matters — almost any reasonable wire works fine. For higher-current runs (a motor, a battery pack, mains wiring) it matters a lot: undersized wire for the current it's carrying heats up, wastes power as voltage drop, and in extreme cases is a fire risk.

As a rough rule of thumb for hobby electronics: standard breadboard jumper wire (roughly 22 AWG) is fine well below 1A, but anything drawing several amps — a decent-sized DC motor, an LED strip, a higher-power relay load — deserves a look at a wire gauge chart rather than an assumption that "wire is wire."`,
  },
  {
    icon: "motor", tag: "Components", difficulty: "Intermediate",
    title: "DC motors and driving them with an H-bridge",
    summary: "Spin one way, spin the other, or brake — with four switches.",
    body: `A simple DC motor spins in one direction when current flows one way through it, and the opposite direction when current is reversed. A microcontroller pin alone can't do that — it can only source a fixed-polarity voltage, and usually can't supply anywhere near the current a motor draws.

An H-bridge solves both problems. It's an arrangement of four switches (usually transistors or MOSFETs) around the motor, wired so that switching diagonal pairs on sends current through the motor in one direction or the other, while a microcontroller's low-current logic pins just tell the switches when to open and close.

Combine an H-bridge with PWM on its enable input and you get reversible speed control from just a couple of digital pins — full forward, full reverse, variable speed in either direction, and often an active-brake state where both motor terminals are shorted together to stop it quickly.

Small H-bridge driver chips package all four switches, plus protection circuitry, into a single part — which is why most beginner motor-control projects reach for a driver module rather than wiring four discrete transistors by hand.`,
  },
  {
    icon: "servo", tag: "Components", difficulty: "Intermediate",
    title: "Servo motors: motors that know their own position",
    summary: "A motor, a gearbox, and a built-in angle sensor in one box.",
    body: `A hobby servo isn't just a motor — it's a small closed-loop system: a DC motor, a reduction gearbox, and a position sensor (usually a potentiometer) all built into one housing, with a tiny built-in controller comparing the sensor's reading against a commanded target angle and driving the motor to close the gap.

That's what makes a servo fundamentally different from a plain DC motor: you don't command a speed, you command an angle, typically somewhere in a 0-180 degree range, and the servo handles getting there and holding position on its own.

Servos take that angle command as a PWM signal, but a different kind than motor speed control uses — what matters isn't the duty cycle percentage, it's the actual pulse width in milliseconds, typically ranging from about 1ms (one extreme of rotation) to 2ms (the other), repeated roughly every 20ms.

Because they hold position actively, a servo under load draws current continuously trying to maintain its commanded angle, rather than only while moving — worth remembering when budgeting current draw for a battery-powered project with more than one or two servos attached.`,
  },
  {
    icon: "stepper", tag: "Components", difficulty: "Advanced",
    title: "Stepper motors: precise rotation, one step at a time",
    summary: "No feedback sensor needed — just count the steps.",
    body: `A stepper motor divides a full rotation into a fixed number of discrete steps — commonly 200 per revolution, or 1.8 degrees each — and moves exactly one step at a time as its coils are energized in a specific sequence. Unlike a servo, it has no built-in position sensor; as long as it never skips a step, the controller can simply count steps to know exactly where the shaft is.

That open-loop precision is the big appeal: accurate positioning without the cost or complexity of a feedback sensor, which is why steppers are everywhere in 3D printers, CNC machines, and camera sliders.

The trade-off is that steppers need a specific coil energizing sequence rather than a simple voltage, which is why they're almost always driven through a dedicated stepper driver chip that handles the sequencing (and often microstepping, which breaks each full step into smaller sub-steps for smoother motion) from simple step-and-direction signals sent by a microcontroller.

If a stepper is pushed to move faster or against more resistance than it can handle, it simply skips steps silently — the controller's step count and the motor's actual position quietly disagree, with no error signal to catch it. Homing routines (moving to a known physical limit at startup) are the usual fix for resetting that position knowledge periodically.`,
  },
  {
    icon: "opamp", tag: "Components", difficulty: "Advanced",
    title: "Op-amps: the general-purpose amplifier",
    summary: "Two inputs, one output, and a a huge default gain.",
    body: `An operational amplifier (op-amp) has two inputs — inverting (-) and non-inverting (+) — and one output, and by default amplifies the tiny difference between its two inputs by an enormous factor, tens of thousands of times or more.

Used "open loop" like that, an op-amp is mostly useful as a comparator — the output slams to one rail or the other depending on which input is slightly higher, useful for simple threshold detection.

Its real power shows up with feedback: connecting part of the output back to the inverting input tames that huge open-loop gain into something precise and controllable. A few resistors around an op-amp can build a stable amplifier with an exact, chosen gain, a buffer that isolates a sensitive signal from whatever's reading it, or a filter that shapes which frequencies pass through.

Op-amps are one of the most reused building blocks in analog electronics precisely because the same chip, wired differently with different feedback components, can perform such different jobs — amplification, comparison, filtering, and signal conditioning are all the same underlying part in different configurations.`,
  },
  {
    icon: "chip", tag: "Digital", difficulty: "Intermediate",
    title: "The 555 timer: one chip, endless timing circuits",
    summary: "A classic IC that turns resistors and a capacitor into precise timing.",
    body: `The 555 timer is one of the most widely produced chips ever made, and it does one core job: it watches a capacitor charge and discharge through external resistors, and switches its output based on where that charge level crosses two internal reference thresholds.

In "astable" mode, it free-runs — continuously charging and discharging the capacitor to produce a repeating square wave, with the resistor and capacitor values setting the frequency and duty cycle. That makes it a simple, self-contained way to blink an LED, generate a tone, or provide a clock signal, all without a microcontroller or any code.

In "monostable" mode, it instead sits idle until triggered, then outputs a single pulse of a fixed duration set by the resistor and capacitor values, before returning to idle — useful for things like a fixed-length delay after a button press.

Part of the 555's staying power is that it needs almost nothing else to work — a couple of resistors, a capacitor, and a power supply are often the entire circuit, which is exactly why it remains a go-to teaching example for how timing and oscillation can be built from purely analog components.`,
  },
  {
    icon: "bus", tag: "Digital", difficulty: "Advanced",
    title: "Shift registers: more outputs from fewer pins",
    summary: "Send bits in one at a time, get them all out in parallel.",
    body: `A microcontroller only has so many pins, and driving eight LEDs individually would use eight of them. A shift register solves that by taking data in serially — one bit at a time, on one data pin, timed by a separate clock pin — and, once all the bits have been shifted in, presenting them all at once on eight parallel output pins.

That trades pin count for a small amount of extra time and code: instead of one microcontroller pin per output, you need only two or three pins total (data, clock, and often a "latch" pin that controls when the new data actually appears on the outputs) no matter how many shift registers you chain together.

Chaining is the other half of the appeal — the serial output of one shift register can feed directly into the serial input of the next, so eight, sixteen, or more outputs can be controlled from the same handful of microcontroller pins just by shifting out more bits.

This same serial-in, parallel-out idea (and its mirror image, parallel-in serial-out, used for reading many inputs with few pins) underpins a lot of larger digital designs, including how many LED matrices and multi-digit 7-segment displays are driven without needing a dedicated pin for every single segment.`,
  },
  {
    icon: "bus", tag: "Digital", difficulty: "Advanced",
    title: "I2C, SPI, and UART: how chips talk to each other",
    summary: "Three common languages for wires between components.",
    body: `Once a project has more than one chip, they need a shared way to exchange data, and three protocols cover the vast majority of hobby electronics.

UART (serial) is the simplest: two wires, one carrying data each direction (TX from one device to RX on the other, and vice versa), with both sides agreeing on a speed (baud rate) beforehand. It's a direct point-to-point link between exactly two devices — the same basic scheme a computer uses to talk to an Arduino over USB.

I2C uses just two shared wires (data and clock) that many devices can connect to at once, each identified by a unique address the controlling device specifies before talking to it. That address-based sharing is what lets a single microcontroller talk to a dozen different sensors and displays using the same two physical wires.

SPI uses more wires — separate data-out and data-in lines, a shared clock, and a dedicated "chip select" line per device — trading extra wiring for significantly higher speed than I2C, which is why it's the usual choice for anything moving a lot of data quickly, like an SD card or a display.

Picking between them usually comes down to what the specific chip you're using supports — most sensor and module datasheets state plainly which protocol (or protocols) they speak, and that choice is rarely left up to you.`,
  },
  {
    icon: "toggle", tag: "Digital", difficulty: "Intermediate",
    title: "Debouncing: why a button press isn't as clean as it looks",
    summary: "Mechanical contacts bounce before they settle.",
    body: `When a mechanical switch or button closes, its metal contacts don't meet cleanly in one instant — they physically bounce apart and together several times over a few milliseconds before settling into a solid connection. To a fast-reading microcontroller, that bounce looks like several rapid presses instead of one.

Left unhandled, this means a single physical press can be read as two, three, or more separate button-press events, which is obviously wrong for anything counting presses or toggling a state.

Debouncing fixes this, either in hardware or in code. A hardware fix pairs the switch with a small resistor-capacitor filter that smooths out the fast bounce before it ever reaches the microcontroller pin. A software fix simply ignores any additional changes on that pin for a short window (often 20-50ms) immediately after the first detected change, since real bounce settles well within that time.

Debouncing is one of those problems that's invisible until it isn't — a demo that works fine when pressed slowly and deliberately can start double-counting the moment someone presses the button quickly or with a worn, slightly dirty switch, which is exactly the kind of edge case worth testing for deliberately.`,
  },
  {
    icon: "adcStair", tag: "Digital", difficulty: "Intermediate",
    title: "Analog-to-digital conversion: turning a voltage into a number",
    summary: "A microcontroller's window into the analog world.",
    body: `A microcontroller's digital logic only really understands HIGH and LOW, but plenty of real-world signals — a potentiometer's position, a light sensor's brightness, a microphone's waveform — are continuously variable voltages. An analog-to-digital converter (ADC) bridges the gap by sampling a voltage and reporting it as a number.

Resolution determines how finely that number can distinguish between voltage levels. A common 10-bit ADC divides its input range into 1024 discrete steps; a 12-bit ADC divides the same range into 4096, giving finer distinctions between similar voltages at the cost of a slightly larger number to work with in code.

Sample rate is the other half of the picture — how often the ADC takes a new reading. A slowly changing signal, like a temperature sensor, barely needs any sampling rate at all; a fast-changing signal, like audio, needs sampling fast enough to catch its changes, or the digitized version misses information that was actually there.

This is exactly the reverse of what a PWM output does — PWM fakes an analog voltage using fast digital switching, while an ADC takes a real analog voltage and turns it into a digital number a program can actually reason about.`,
  },
  {
    icon: "ledMatrixGrid", tag: "Digital", difficulty: "Intermediate",
    title: "7-segment displays and LED matrices",
    summary: "Lighting individual segments (or dots) to form characters.",
    body: `A 7-segment display is exactly what it sounds like — seven individual LED segments arranged in a figure-eight pattern, each one controllable on its own. Lighting the right combination of segments forms any digit 0-9 (and a rough approximation of a handful of letters).

An LED matrix takes the same idea further, arranging many individual LEDs in a grid so that lighting the right combination of dots can form letters, numbers, or simple graphics — an 8x8 matrix has 64 individually addressable LEDs.

Wiring every segment or dot to its own microcontroller pin quickly runs out of pins, so both are almost always wired in a grid pattern (rows and columns rather than individual wires) and driven with multiplexing — lighting one row at a time, very quickly, cycling through all rows fast enough that persistence of vision makes the whole display look continuously lit.

This is also exactly where a shift register earns its keep — driving a multi-digit 7-segment display or a larger LED matrix with a shift register (or a small dedicated driver chip built around the same idea) means the segment/row/column pattern gets shifted out serially, keeping pin count low no matter how many digits or dots are involved.`,
  },
  {
    icon: "buzzerWave", tag: "Components", difficulty: "Beginner",
    title: "Buzzers and simple audio output",
    summary: "Turning an electrical signal into a sound you can hear.",
    body: `A passive buzzer has no internal oscillator — feed it a square wave at a chosen frequency (easy to generate on almost any microcontroller pin) and it reproduces that frequency as a tone. Change the frequency and the pitch changes, which is enough to play simple melodies or beeps directly from code.

An active buzzer, by contrast, has a built-in oscillator circuit — apply steady DC power and it produces one fixed tone on its own, with no frequency control needed or possible. That makes it simpler to wire (just power it on or off) but far less flexible than a passive buzzer.

Both are usually piezoelectric — a thin ceramic disc that physically flexes when voltage is applied across it, converting electrical energy directly into mechanical vibration and, in turn, sound — rather than the coil-and-magnet mechanism a traditional speaker uses.

For anything beyond simple beeps and tones — real audio playback, adjustable volume, higher fidelity — a small speaker driven through an amplifier circuit is the usual next step up from a buzzer, trading simplicity for actual sound quality.`,
  },
  {
    icon: "cellChem", tag: "Components", difficulty: "Intermediate",
    title: "Battery chemistry: alkaline, NiMH, and LiPo",
    summary: "Different chemistries trade off voltage, capacity, and safety differently.",
    body: `Alkaline cells (the standard AA/AAA battery) are cheap, widely available, non-rechargeable, and output about 1.5V per cell fresh, gradually sagging as they're used — fine for low-drain, infrequent-use projects, but a poor fit for anything drawing significant current.

NiMH (nickel-metal hydride) cells are rechargeable, output a slightly lower 1.2V per cell, and hold a much flatter voltage curve through most of their discharge compared to alkaline — useful where a steady voltage matters more than squeezing out the last bit of capacity.

LiPo (lithium polymer) and similar lithium chemistries pack far more energy into the same size and weight, and output a higher nominal voltage (typically 3.7V per cell), which is why they dominate anywhere weight and size matter — drones, wearables, small robots.

That energy density comes with real safety considerations lithium cells don't forgive the way alkaline or NiMH mostly do: over-discharging, overcharging, physical damage, or a short circuit can cause a lithium cell to overheat or catch fire, which is why LiPo packs are always charged through a dedicated balance charger and never left charging unattended.`,
  },
  {
    icon: "heatsinkFins", tag: "Troubleshooting", difficulty: "Intermediate",
    title: "Heat, heatsinks, and thermal management",
    summary: "Every inefficiency in a circuit shows up as heat somewhere.",
    body: `Any time a component drops voltage while carrying current without doing useful mechanical or light-producing work, that energy has to go somewhere — and it goes out as heat. A linear regulator dropping several volts, a transistor switching a motor, a resistor absorbing excess current: all of them get warm in direct proportion to the power they're dissipating (P = I x V, the same formula from earlier).

A heatsink is simply a piece of metal, usually with fins to maximize surface area, that's thermally (and often mechanically) attached to a hot component to help it shed that heat into the surrounding air faster than the bare part could on its own.

Component datasheets specify a maximum junction temperature the part can tolerate, and a thermal resistance figure that tells you how many degrees the part heats up above ambient per watt it dissipates — combine those two numbers with how much power your circuit will make it dissipate, and you can work out whether a bare part is fine or a heatsink (or a design change entirely) is genuinely required.

In practice, "it gets a little warm to the touch" is normal for plenty of parts; "too hot to keep a finger on for more than a second" is a sign to stop and check the numbers rather than assume it's fine.`,
  },
  {
    icon: "capacitor", tag: "Components", difficulty: "Advanced",
    title: "Decoupling capacitors: quieting a noisy power rail",
    summary: "A tiny local reservoir of charge, right next to the chip that needs it.",
    body: `Every time a digital chip switches state, it draws a brief, sharp spike of current — far faster than the rest of the power supply and wiring can really respond to smoothly. That fast current demand causes a tiny, momentary dip in the voltage the chip sees, which can be enough to cause glitches, resets, or unreliable behavior, especially in circuits with several fast-switching chips sharing one supply.

A decoupling capacitor — commonly a small ceramic capacitor around 0.1uF, placed as physically close as possible to a chip's power pins — acts as a tiny local reservoir of charge. It can supply that fast current spike almost instantly from its own stored charge, rather than making it wait for current to travel through wiring and back to the main power supply.

This is a different job from the larger smoothing capacitors used after a rectifier: those handle slower, larger ripple over an entire circuit; decoupling capacitors handle fast, tiny, local spikes right at the chip that's causing them, and larger circuits typically use both together.

It's easy to skip decoupling capacitors in a simple simulated circuit and never notice, since a simulator's ideal power source has no trouble supplying instantaneous current — but on a real physical board with real wire and battery internal resistance, missing decoupling capacitors is a classic, hard-to-diagnose source of intermittent chip misbehavior.`,
  },
  {
    icon: "buckBoost", tag: "Components", difficulty: "Advanced",
    title: "Buck and boost converters: efficient switching power conversion",
    summary: "Stepping DC voltage down or up without wasting it as heat.",
    body: `A linear regulator drops excess voltage as heat, which gets wasteful fast when there's a large gap between input and output voltage. A switching converter takes a fundamentally different approach: it rapidly switches an inductor on and off, storing and releasing energy in its magnetic field each cycle, to convert voltage with far less energy lost as heat — often 85-95% efficient compared to a linear regulator's efficiency dropping sharply as the voltage gap grows.

A buck converter steps DC voltage down — from, say, 12V to 5V — by controlling how much of each switching cycle the inductor spends connected to the input versus discharging into the output, similar in spirit to how PWM's duty cycle controls an average output level.

A boost converter does the reverse, stepping voltage up — useful for something like running a 5V circuit from a single, lower-voltage battery cell — by using the inductor's tendency to resist sudden current changes to briefly push the output voltage higher than the input.

The trade-off for that efficiency is complexity and some electrical noise: switching converters need more supporting components (an inductor, a diode or synchronous switch, filter capacitors) than a simple linear regulator, and the rapid switching itself can radiate some electrical noise that occasionally needs additional filtering in sensitive analog circuits.`,
  },
  {
    icon: "shuntResistor", tag: "Tools", difficulty: "Advanced",
    title: "Current-sense resistors: measuring current without breaking the circuit open",
    summary: "A tiny, known resistance turns current into a measurable voltage.",
    body: `Measuring current directly usually means breaking the circuit open and inserting a meter in series — inconvenient for something you want to monitor continuously while a circuit is running. A current-sense (shunt) resistor offers another way: place a very small, precisely known resistance in series with the load, and measure the tiny voltage drop across it.

By Ohm's Law, that voltage drop is directly proportional to the current flowing through it — a 0.1 ohm shunt carrying 1A produces exactly 0.1V across it, so measuring that voltage tells you the current without ever interrupting the circuit to insert a meter.

Shunt resistors are deliberately sized very low (often well under 1 ohm) specifically so they don't meaningfully add resistance to the circuit they're monitoring or waste significant power as heat themselves — the goal is to sense current, not limit it.

Because the resulting voltage is so small, current-sense circuits are almost always paired with an amplifier (frequently a dedicated current-sense amplifier chip, or an op-amp configured for the job) to boost that tiny voltage into something a microcontroller's ADC can read reliably.`,
  },
  {
    icon: "connectorPlug", tag: "Tools", difficulty: "Beginner",
    title: "Connectors: headers, JST, and terminal blocks",
    summary: "The right connector makes a circuit reliable and reusable.",
    body: `Pin headers are the simple rows of pins found on most development boards — cheap, simple, and great for breadboard prototyping, but they rely on friction alone to stay connected, which makes them a poor choice anywhere a project might get moved, bumped, or shipped.

JST connectors are small, keyed (only fit one way), locking connectors extremely common on battery packs and small modules — the lock means they won't work loose from vibration or a light tug the way a header pin might, at the cost of needing the matching connector on both sides.

Terminal blocks use a screw or spring clamp to grip a bare wire directly, and are the go-to choice for permanent installations or anywhere wires might need to be swapped without soldering — common in anything mains-powered or panel-mounted.

Picking a connector is mostly about matching the situation: headers for fast prototyping you'll take apart again soon, JST (or similar locking connectors) for anything battery-powered that moves around, and terminal blocks for permanent, serviceable wiring — using the wrong one is rarely dangerous, just an avoidable source of intermittent connections later.`,
  },
  {
    icon: "chip", tag: "Tools", difficulty: "Beginner",
    title: "Through-hole vs. surface-mount (SMD) components",
    summary: "Two ways the same component can be packaged.",
    body: `Through-hole components have long metal leads meant to poke through holes in a circuit board and get soldered on the other side. They're physically robust, easy to solder by hand, and the standard choice for breadboarding and beginner projects — most of the resistors, capacitors, and LEDs in a typical starter kit are through-hole.

Surface-mount (SMD) components sit flat on the board's surface and solder directly to pads, with no holes involved. They're dramatically smaller — a common SMD resistor can be a fraction the size of its through-hole equivalent — which is exactly why nearly all modern commercial electronics, from phones to laptops, are built almost entirely from SMD parts to fit more circuitry into less space.

The trade-off is hand-assembly difficulty: SMD parts, especially small ones, are genuinely harder to solder by hand than through-hole, often needing finer soldering tips, tweezers, and sometimes magnification, which is part of why through-hole remains the friendlier starting point for learning.

Many chips and modules are available in both packages specifically so hobbyists can choose the through-hole version for easy hand-assembly, while a commercial product using the identical part chooses SMD to save board space.`,
  },
  {
    icon: "oscilloscope", tag: "Tools", difficulty: "Advanced",
    title: "Oscilloscopes: watching a signal change over time",
    summary: "A multimeter gives you one number; a scope gives you the whole shape.",
    body: `A multimeter reports a single number — the voltage right now, or an average over a short window. That's fine for steady DC, but useless for understanding a signal that's actually changing quickly, like a PWM output, a sensor's noisy reading, or a communication protocol's data line.

An oscilloscope instead plots voltage against time continuously, showing the actual shape of a signal as it happens — you can see a square wave's exact duty cycle, spot noise riding on top of what should be a clean DC rail, or watch two signals' timing relative to each other on the same screen.

The two settings that matter most when first using one are the vertical scale (volts per division, setting how much voltage each gridline represents) and the horizontal scale (time per division, setting how much time each gridline spans) — dialing both in appropriately is what turns a flat or unreadable trace into a clear picture of the signal.

A scope is overkill for most beginner projects built around steady DC, but becomes close to essential the moment something is behaving strangely in a way a multimeter's single number can't explain — an intermittent glitch, unexpected noise, or a communication line that "should" be working but isn't.`,
  },
  {
    icon: "bolt", tag: "Troubleshooting", difficulty: "Beginner",
    title: "ESD: the static shock you don't feel can still kill a chip",
    summary: "Static electricity is small to you, but huge to sensitive electronics.",
    body: `Walking across a carpet can build up a static charge of several thousand volts on your body — far more than most electronic components are rated to handle, even though the resulting shock (if you even feel it) lasts a tiny fraction of a second and carries almost no real energy.

Many chips, especially MOSFETs and other components with extremely thin internal insulating layers, can be damaged or destroyed by a static discharge that's far too small for a person to notice or feel at all — which is what makes electrostatic discharge (ESD) a genuinely sneaky failure mode: a component can be silently weakened by a static event and only fail later, making the original cause hard to trace.

Simple precautions go a long way: touching a grounded metal object before handling sensitive parts to discharge any static buildup, storing ESD-sensitive chips in the anti-static (usually pink or black conductive) bags they ship in rather than loose in a drawer, and avoiding synthetic-fiber clothing or working directly on carpet in dry conditions where static buildup is worst.

This mostly matters for bare ICs and modules with exposed sensitive pins — a fully assembled, cased product is much less vulnerable day-to-day, which is why ESD precautions get the most attention specifically during assembly and repair rather than normal use.`,
  },
  {
    icon: "wrench", tag: "Troubleshooting", difficulty: "Intermediate",
    title: "Troubleshooting: a component keeps running hot",
    summary: "Heat is a symptom — trace it back to the actual cause.",
    body: `A part that runs noticeably hot is telling you it's dissipating more power than it comfortably should, and there are really only a few underlying reasons that's happening, worth checking roughly in this order.

First, check for a wiring mistake causing excess current — a short circuit, a missing or wrong-value current-limiting resistor, or a polarized part connected backwards can all push far more current through a component than intended, and the fix is usually a wiring or value correction rather than a different part.

Second, check whether the part is simply undersized for the job — a regulator dropping a large voltage gap at real current, or a resistor rated for a quarter watt asked to dissipate closer to a full watt, will run hot even when everything is wired correctly, and the fix there is choosing a higher-rated part or a more efficient approach (a switching converter instead of a linear regulator, for instance).

Third, consider whether the part is doing its job correctly but simply needs help shedding the heat that job inevitably produces — a heatsink, more airflow, or more copper area on a real board — rather than any change to the circuit itself. Working through those three in order (wiring fault, then undersized part, then insufficient cooling) usually finds the real cause faster than guessing at a fix and hoping.`,
  },
  {
    icon: "sigma", tag: "Fundamentals", difficulty: "Intermediate",
    title: "Voltage dividers in depth: picking resistor ratios on purpose",
    summary: "Two resistors, one output voltage exactly where you want it.",
    body: `A voltage divider is two resistors in series across a voltage source, with the output taken from the midpoint between them. The output voltage is Vout = Vin x (R2 / (R1 + R2)), where R2 is the resistor between the output tap and ground.

That formula is worth internalizing rather than just looking up each time: the output voltage is simply the input voltage scaled by what fraction of the total resistance sits below the tap point. Equal resistors give exactly half the input voltage; a smaller R2 relative to R1 pulls the output closer to ground, and a larger R2 pulls it closer to the input voltage.

Beyond simply scaling a fixed voltage down, this is exactly the circuit that turns a resistive sensor — an LDR, a thermistor, a flex sensor — into a readable voltage: replace one of the two fixed resistors with the sensor, and the output voltage now shifts as the sensor's resistance changes with light, temperature, or bend.

One limitation worth knowing: a voltage divider's output isn't a strong, stiff voltage source — if whatever you connect to the output draws meaningful current itself, it effectively becomes a third resistor in the network and pulls the actual output voltage away from what the simple formula predicts. That's why voltage dividers feeding a high-impedance input, like a microcontroller's ADC, work cleanly, while ones expected to directly power something current-hungry usually need a buffer stage in between.`,
  },
];

const CATEGORY_ORDER = Object.keys(TAG_COLOR);

const gridVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

function LessonIcon({ id, color, size = 40 }) {
  const glyph = ICONS[id] || ICONS.bulb;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: `color-mix(in srgb, ${color} 14%, var(--surface-2))`,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24">
        {glyph(color)}
      </svg>
    </div>
  );
}

function DifficultyMeter({ level, color, label }) {
  return (
    <span style={styles.meter} role="img" aria-label={`Difficulty: ${label}`} title={label}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          style={{
            ...styles.meterBar,
            height: 5 + i * 3,
            background: i <= level ? color : "var(--border)",
          }}
        />
      ))}
    </span>
  );
}

/* Simple, calm card - a border and a lift on hover. No tilt, no spotlight. */
function LessonCard({ topic, onClick }) {
  const tagColor = TAG_COLOR[topic.tag] || "var(--primary)";
  return (
    <motion.button
      layout
      layoutId={`card-${TOPICS.indexOf(topic)}`}
      onClick={onClick}
      variants={cardVariants}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="lesson-card"
      style={styles.card}
    >
      <div style={styles.cardTop}>
        <LessonIcon id={topic.icon} color={tagColor} />
        <DifficultyMeter
          level={DIFFICULTY_LEVEL[topic.difficulty]}
          color={DIFFICULTY_COLOR[topic.difficulty]}
          label={topic.difficulty}
        />
      </div>
      <div style={styles.cardTitle}>{topic.title}</div>
      <div style={styles.cardSummary}>{topic.summary}</div>
      <div style={{ ...styles.cardFooter, color: tagColor }}>
        Read lesson
        <svg width="12" height="12" viewBox="0 0 24 24" className="card-arrow">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.button>
  );
}

export default function Tutorials() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [activeTopic, setActiveTopic] = useState(null);
  const reduceMotion = useReducedMotion();
  const modalRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setActiveTopic(null);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        setActiveTopic((cur) => {
          if (cur === null) return cur;
          const next = e.key === "ArrowRight" ? cur + 1 : cur - 1;
          if (next < 0 || next >= TOPICS.length) return cur;
          return next;
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (modalRef.current) modalRef.current.scrollTop = 0;
  }, [activeTopic]);

  const filtered = useMemo(() => {
    return TOPICS.filter((t) => {
      const matchesTag = activeTag === "All" || t.tag === activeTag;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q) || t.body.toLowerCase().includes(q);
      return matchesTag && matchesQuery;
    });
  }, [query, activeTag]);

  const sections = useMemo(() => {
    return CATEGORY_ORDER.map((tag) => ({
      tag,
      color: TAG_COLOR[tag],
      items: filtered.filter((t) => t.tag === tag),
    })).filter((s) => s.items.length > 0);
  }, [filtered]);

  const openTopic = activeTopic !== null ? TOPICS[activeTopic] : null;
  const openParagraphs = useMemo(() => (openTopic ? openTopic.body.split(/\n\n+/) : []), [openTopic]);
  const readingMinutes = useMemo(() => {
    if (!openTopic) return 1;
    const words = openTopic.body.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  }, [openTopic]);

  return (
    <AppShell>
      {/* ---------------- Header ---------------- */}
      <section style={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="eyebrow">Learn</div>
          <KineticHeadline
            text="Master Circuit Design"
            as="h1"
            style={styles.heroTitle}
          />
          <p style={styles.heroSubtitle}>
            {TOPICS.length} short, practical lessons — the exact concepts behind everything CircuitLab
            checks for you when you hit Run.
          </p>

          <div style={styles.statsRow}>
            <div style={styles.statBlock}>
              <span style={{ ...styles.statNumber, color: "var(--color-green)", fontFamily: "var(--font-data)" }}>{TOPICS.length}</span>
              <span style={styles.statLabel}>Lessons</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statBlock}>
              <span style={{ ...styles.statNumber, color: "var(--color-accent)", fontFamily: "var(--font-data)" }}>{CATEGORY_ORDER.length}</span>
              <span style={styles.statLabel}>Categories</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statBlock}>
              <span style={{ ...styles.statNumber, color: "var(--gold)", fontFamily: "var(--font-data)" }}>3</span>
              <span style={styles.statLabel}>Skill levels</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---------------- Toolbar ---------------- */}
      <motion.div
        style={styles.toolbar}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div style={styles.toolbarInner}>
          <div style={styles.searchWrap}>
            <svg width="15" height="15" viewBox="0 0 24 24" style={styles.searchIcon}>
              <circle cx="10.5" cy="10.5" r="6.5" stroke="var(--text-faint)" strokeWidth="2" fill="none" />
              <path d="M20 20 15.5 15.5" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lessons..."
              style={styles.search}
            />
          </div>
          <div style={styles.chipRow}>
            {["All", ...CATEGORY_ORDER].map((tag) => {
              const active = activeTag === tag;
              const color = TAG_COLOR[tag] || "var(--text-dim)";
              const count = tag === "All" ? TOPICS.length : TOPICS.filter((t) => t.tag === tag).length;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  aria-pressed={active}
                  style={{
                    ...styles.chip,
                    borderColor: active ? color : "var(--border)",
                    color: active ? color : "var(--text-dim)",
                    background: active ? `color-mix(in srgb, ${color} 12%, var(--surface))` : "var(--surface)",
                  }}
                >
                  {tag !== "All" && <span style={{ ...styles.chipSwatch, background: color }} />}
                  {tag} <span style={{ opacity: 0.55 }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ---------------- Lesson sections ---------------- */}
      <div style={{ padding: "10px 6vw 90px" }}>
        {sections.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ color: "var(--text)", fontSize: 14, fontWeight: 600, margin: 0 }}>
              No lessons match "{query}"
            </p>
            <p style={{ color: "var(--text-faint)", fontSize: 12.5, margin: "4px 0 0" }}>
              Try a different term, or clear the {activeTag !== "All" ? `${activeTag} filter` : "search"}.
            </p>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.tag} style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={{ ...styles.sectionDot, background: section.color }} />
                <h2 style={styles.sectionTitle}>{section.tag}</h2>
                <span style={styles.sectionCount}>{section.items.length}</span>
                <span style={styles.sectionRule} />
              </div>

              <motion.div
                style={styles.cardGrid}
                variants={gridVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
              >
                {section.items.map((topic) => {
                  const globalIndex = TOPICS.indexOf(topic);
                  return (
                    <LessonCard key={topic.title} topic={topic} onClick={() => setActiveTopic(globalIndex)} />
                  );
                })}
              </motion.div>
            </div>
          ))
        )}
      </div>

      {/* ---------------- Expanded lesson modal ---------------- */}
      <AnimatePresence>
        {openTopic && (
          <>
            <motion.div
              key="backdrop"
              style={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveTopic(null)}
            />
            <div style={styles.modalWrap}>
              <motion.div
                layoutId={`card-${activeTopic}`}
                style={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-label={openTopic.title}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                ref={modalRef}
              >
                <div style={styles.modalHeader}>
                  <LessonIcon id={openTopic.icon} color={TAG_COLOR[openTopic.tag]} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.metaRow}>
                      <span style={{ ...styles.tagPill, color: TAG_COLOR[openTopic.tag], borderColor: TAG_COLOR[openTopic.tag] }}>
                        {openTopic.tag}
                      </span>
                      <DifficultyMeter
                        level={DIFFICULTY_LEVEL[openTopic.difficulty]}
                        color={DIFFICULTY_COLOR[openTopic.difficulty]}
                        label={openTopic.difficulty}
                      />
                      <span style={styles.readTime}>{readingMinutes} min read</span>
                    </div>
                    <div style={styles.modalTitle}>{openTopic.title}</div>
                  </div>
                  <button style={styles.closeBtn} onClick={() => setActiveTopic(null)} aria-label="Close lesson">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div style={styles.modalBody}>
                  {openParagraphs.map((para, i) => (
                    <motion.p
                      key={i}
                      style={styles.modalParagraph}
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.08 + i * 0.05, duration: 0.35 } }}
                    >
                      {para}
                    </motion.p>
                  ))}
                </div>
                <div style={styles.modalFooter}>
                  <button
                    className="btn-ghost-vibe"
                    style={{ padding: "8px 14px", fontSize: 13, gap: 6, opacity: activeTopic > 0 ? 1 : 0.35 }}
                    onClick={() => activeTopic > 0 && setActiveTopic(activeTopic - 1)}
                    disabled={activeTopic === 0}
                    aria-label="Previous lesson"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span>Previous</span>
                    <span className="hotkey-badge" style={{ fontSize: 9 }}>←</span>
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ ...styles.modalCounter, fontFamily: "var(--font-data)" }}>{activeTopic + 1} / {TOPICS.length}</span>
                    <span className="hotkey-badge">ESC</span>
                  </div>
                  <button
                    className="btn-ghost-vibe"
                    style={{ padding: "8px 14px", fontSize: 13, gap: 6, opacity: activeTopic < TOPICS.length - 1 ? 1 : 0.35 }}
                    onClick={() => activeTopic < TOPICS.length - 1 && setActiveTopic(activeTopic + 1)}
                    disabled={activeTopic === TOPICS.length - 1}
                    aria-label="Next lesson"
                  >
                    <span>Next</span>
                    <span className="hotkey-badge" style={{ fontSize: 9 }}>→</span>
                    <svg width="13" height="13" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .lesson-card { text-align: left; cursor: pointer; transition: border-color 0.25s ease, box-shadow 0.25s ease; }
        .lesson-card:hover { border-color: var(--text-faint); box-shadow: 0 12px 28px color-mix(in srgb, #000 16%, transparent); }
        .lesson-card:hover .card-arrow { transform: translateX(3px); }
        .card-arrow { transition: transform 0.25s ease; }
        .lesson-card:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
      `}</style>
    </AppShell>
  );
}

const styles = {
  hero: {
    padding: "48px 6vw 32px",
    borderBottom: "1px solid var(--border)",
    maxWidth: 680,
  },
  heroTitle: {
    margin: "8px 0 0",
    fontSize: "clamp(26px, 3.2vw, 36px)",
    fontWeight: 700,
    fontFamily: "var(--font-body)",
    lineHeight: 1.15,
  },
  heroSubtitle: {
    color: "var(--text-dim)",
    fontSize: 14.5,
    lineHeight: 1.6,
    margin: "10px 0 0",
  },
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    marginTop: 22,
  },
  statBlock: { display: "flex", alignItems: "baseline", gap: 6 },
  statNumber: {
    fontFamily: "var(--font-display)",
    fontSize: 18,
    fontWeight: 700,
  },
  statLabel: {
    fontSize: 11,
    color: "var(--text-faint)",
  },
  statDivider: {
    width: 1,
    height: 14,
    background: "var(--border)",
  },
  toolbar: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: "rgba(18, 20, 26, 0.72)",
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
    padding: "16px 6vw",
  },
  toolbarInner: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 16,
    maxWidth: 1180,
    margin: "0 auto",
  },
  searchWrap: {
    position: "relative",
    width: 260,
    flexShrink: 0,
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  search: {
    width: "100%",
    background: "rgba(14, 16, 20, 0.65)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.09)",
    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.3)",
    borderRadius: "var(--radius-sm)",
    padding: "9px 12px 9px 34px",
    color: "var(--text)",
    fontSize: 13,
    outline: "none",
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  chip: {
    fontFamily: "var(--font-display)",
    fontSize: 11.5,
    padding: "6px 12px",
    borderRadius: 20,
    border: "1px solid",
    cursor: "pointer",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
  },
  chipSwatch: {
    width: 7,
    height: 7,
    borderRadius: 2,
    display: "inline-block",
    flexShrink: 0,
  },
  emptyState: {
    border: "1px dashed var(--border)",
    borderRadius: "var(--radius)",
    padding: "28px 20px",
    maxWidth: 420,
    margin: "40px auto 0",
    textAlign: "center",
  },
  section: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "40px 0 8px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  sectionDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    flexShrink: 0,
  },
  sectionTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text)",
    margin: 0,
    whiteSpace: "nowrap",
  },
  sectionCount: {
    fontSize: 11.5,
    color: "var(--text-faint)",
    background: "var(--surface-2)",
    borderRadius: 20,
    padding: "1px 8px",
  },
  sectionRule: {
    flex: 1,
    height: 1,
    background: "var(--border)",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 14,
  },
  card: {
    background: "var(--surface)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    textAlign: "left",
    font: "inherit",
    color: "inherit",
    width: "100%",
    boxShadow: "var(--card-shadow)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meter: {
    display: "inline-flex",
    alignItems: "flex-end",
    gap: 2.5,
    height: 14,
  },
  meterBar: {
    width: 3.5,
    borderRadius: 1,
    display: "inline-block",
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: 600,
    color: "var(--text)",
    lineHeight: 1.35,
  },
  cardSummary: {
    fontSize: 13,
    color: "var(--text-dim)",
    lineHeight: 1.5,
    flex: 1,
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "var(--font-display)",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(6, 8, 12, 0.72)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    zIndex: 70,
  },
  modalWrap: {
    position: "fixed",
    inset: 0,
    zIndex: 71,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "5vh 5vw",
    pointerEvents: "none",
  },
  modal: {
    pointerEvents: "auto",
    background: "rgba(18, 20, 26, 0.82)",
    backdropFilter: "blur(24px) saturate(170%)",
    WebkitBackdropFilter: "blur(24px) saturate(170%)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    borderRadius: "var(--radius)",
    maxWidth: 640,
    width: "100%",
    maxHeight: "82vh",
    overflowY: "auto",
    padding: 28,
    boxShadow: "0 28px 80px rgba(0, 0, 0, 0.75), inset 0 1px 1px rgba(255, 255, 255, 0.18), 0 0 36px rgba(229, 228, 226, 0.08)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  tagPill: {
    fontFamily: "var(--font-display)",
    fontSize: 9.5,
    letterSpacing: "0.04em",
    padding: "2px 9px",
    borderRadius: 20,
    border: "1px solid",
  },
  readTime: {
    fontSize: 11,
    color: "var(--text-faint)",
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: 700,
    color: "var(--text)",
    lineHeight: 1.3,
  },
  closeBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "50%",
    width: 32,
    height: 32,
    display: "grid",
    placeItems: "center",
    color: "var(--text-dim)",
    cursor: "pointer",
    flexShrink: 0,
  },
  modalBody: {
    marginTop: 22,
  },
  modalParagraph: {
    color: "var(--text-dim)",
    fontSize: 14.5,
    lineHeight: 1.8,
    margin: "0 0 16px",
  },
  modalFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 26,
    paddingTop: 18,
    borderTop: "1px solid var(--border)",
  },
  modalNavBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "7px 14px",
    fontSize: 12.5,
    fontFamily: "var(--font-display)",
    color: "var(--text-dim)",
    cursor: "pointer",
  },
  modalCounter: {
    fontSize: 11,
    color: "var(--text-faint)",
    fontFamily: "var(--font-display)",
  },
};