import { CATEGORY_COLOR } from "../constants/categoryColors";

const GLYPHS = {
  passive: (c) => (
    <path d="M4 12h3l1.5-5 3 10 3-10 1.5 5H20" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  active: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h5l6-4v8l-6-4" />
      <line x1="16" y1="8" x2="16" y2="16" />
      <line x1="19" y1="12" x2="19" y2="12" />
    </g>
  ),
  ic: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <rect x="6" y="7" width="12" height="10" rx="1.5" />
      <line x1="8" y1="7" x2="8" y2="4.5" />
      <line x1="12" y1="7" x2="12" y2="4.5" />
      <line x1="16" y1="7" x2="16" y2="4.5" />
      <line x1="8" y1="17" x2="8" y2="19.5" />
      <line x1="12" y1="17" x2="12" y2="19.5" />
      <line x1="16" y1="17" x2="16" y2="19.5" />
    </g>
  ),
  source: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="6" width="8" height="13" rx="1.5" />
      <line x1="11" y1="4" x2="11" y2="6" />
      <line x1="9.5" y1="10.5" x2="12.5" y2="10.5" />
      <line x1="11" y1="9" x2="11" y2="12" />
    </g>
  ),
  control: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round">
      <circle cx="6" cy="15" r="1.4" fill={c} stroke="none" />
      <circle cx="18" cy="15" r="1.4" fill={c} stroke="none" />
      <line x1="6" y1="15" x2="14" y2="8" />
      <line x1="18" y1="15" x2="14.5" y2="15" />
    </g>
  ),
  output: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10v4h3l4 3V7l-4 3H6z" />
      <path d="M16 9.5c1 .8 1 4.2 0 5" />
      <path d="M18.3 8c1.6 1.4 1.6 6.6 0 8" />
    </g>
  ),
  sensor: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12c2.5-3.5 5.5-5 9-5s6.5 1.5 9 5c-2.5 3.5-5.5 5-9 5s-6.5-1.5-9-5z" />
      <circle cx="12" cy="12" r="2.2" fill={c} stroke="none" />
    </g>
  ),
  board: (c) => (
    <g stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="9" width="10" height="8" rx="1" />
      <circle cx="10" cy="13" r="1.5" fill={c} stroke="none" />
      <line x1="7" y1="9" x2="7" y2="6.5" />
      <line x1="10" y1="9" x2="10" y2="6.5" />
      <line x1="13" y1="9" x2="13" y2="6.5" />
      <line x1="5" y1="12" x2="2.5" y2="12" />
      <line x1="5" y1="15" x2="2.5" y2="15" />
      <path d="M16.5 8.5c1.6-1.6 4-1.6 5.5 0" strokeWidth="1.4" />
      <path d="M17.8 10c.9-.9 2.2-.9 3 0" strokeWidth="1.4" />
    </g>
  ),
};

export default function PartIcon({ category, size = 40 }) {
  const color = CATEGORY_COLOR[category] || "var(--primary)";
  const glyph = GLYPHS[category] || GLYPHS.passive;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: `color-mix(in srgb, ${color} 16%, var(--surface-2))`,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
        {glyph(color)}
      </svg>
    </div>
  );
}