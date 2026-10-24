// ============================================================================
// Photorealistic 3D Component Models for CircuitLab
// Modeled with Three.js primitives & PBR Materials (metalness, roughness,
// specular chamfers, laser markings, copper traces, and realistic proportions).
// Zero external asset downloads - instant loading and 120 FPS performance.
// ============================================================================

import * as THREE from "three";

// --- Reusable PBR Materials & Shaders ---
const MAT_LEAD = { color: "#dcdfe4", metalness: 0.94, roughness: 0.16 };
const MAT_GOLD = { color: "#e5b836", metalness: 0.92, roughness: 0.22 };
const MAT_COPPER = { color: "#d27d3b", metalness: 0.88, roughness: 0.26 };
const MAT_EPOXY_BLACK = { color: "#1c1e22", roughness: 0.38, metalness: 0.08 };
const MAT_EPOXY_GREY = { color: "#2d3238", roughness: 0.45, metalness: 0.05 };
const MAT_ALUMINUM = { color: "#d5d9e0", metalness: 0.88, roughness: 0.24 };
const MAT_STEEL_DARK = { color: "#484d54", metalness: 0.82, roughness: 0.32 };
const MAT_PCB_BLACK = { color: "#141517", roughness: 0.65 };
const MAT_PCB_BLUE = { color: "#18458b", roughness: 0.55 };
const MAT_PCB_GREEN = { color: "#164428", roughness: 0.58 };
const MAT_SILKSCREEN = { color: "#f2ede4", roughness: 0.5 };
const COLOR_PREMIUM_GREEN = "#6D712E";

// --- Realistic Wire Lead with Rounded Chamfered Tip ---
export function Lead({ position, rotation = [0, 0, Math.PI / 2], length = 0.9, radius = 0.026 }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <cylinderGeometry args={[radius, radius, length, 16]} />
        <meshStandardMaterial {...MAT_LEAD} />
      </mesh>
      {/* Tinned solder tip */}
      <mesh position={[0, length / 2, 0]}>
        <sphereGeometry args={[radius, 12, 12]} />
        <meshStandardMaterial {...MAT_LEAD} roughness={0.25} />
      </mesh>
    </group>
  );
}

// --- Stamped TO-220 / DIP Pin with Knee Shoulder ---
export function StampedPin({ position, length = 0.55, width = 0.045, thickness = 0.022, isGold = false }) {
  return (
    <group position={position}>
      {/* Upper wide shoulder */}
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[width * 1.6, 0.16, thickness]} />
        <meshStandardMaterial {...(isGold ? MAT_GOLD : MAT_LEAD)} />
      </mesh>
      {/* Narrow through-hole pin */}
      <mesh position={[0, -0.08 - length / 2, 0]}>
        <boxGeometry args={[width, length, thickness]} />
        <meshStandardMaterial {...(isGold ? MAT_GOLD : MAT_LEAD)} />
      </mesh>
    </group>
  );
}

// --- Header Pin (Square brass/gold post inside black shroud) ---
export function HeaderPin({ position, isGold = true }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.09, 0.08, 0.09]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.036, 0.22, 0.036]} />
        <meshStandardMaterial {...(isGold ? MAT_GOLD : MAT_LEAD)} />
      </mesh>
    </group>
  );
}

// ============================================================================
// PASSIVE COMPONENTS
// ============================================================================

export function ResistorModel() {
  // Precision 5-band metal film styling: light cyan body, brown/black/black/red/gold bands
  const bands = ["#6e3b1c", "#111111", "#111111", "#c0392b", "#d4af37"];
  return (
    <group>
      {/* Dumbbell central ceramic cylinder */}
      <mesh>
        <cylinderGeometry args={[0.24, 0.24, 0.95, 24]} />
        <meshStandardMaterial color="#4db2c9" roughness={0.35} />
      </mesh>
      {/* Bulbous swollen ends where leads crimp */}
      {[-0.45, 0.45].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.265, 20, 20]} />
            <meshStandardMaterial color="#4db2c9" roughness={0.35} />
          </mesh>
          <mesh position={[i === 0 ? -0.1 : 0.1, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.25, 0.18, 20]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial {...MAT_LEAD} />
          </mesh>
        </group>
      ))}
      {/* Glossy color code bands */}
      {bands.map((c, i) => (
        <mesh key={c + i} position={[-0.32 + i * 0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.244, 0.024, 12, 28]} />
          <meshStandardMaterial color={c} roughness={0.25} />
        </mesh>
      ))}
      <Lead position={[-1.02, 0, 0]} length={0.9} />
      <Lead position={[1.02, 0, 0]} length={0.9} />
    </group>
  );
}

export function CapacitorElectrolyticModel() {
  return (
    <group>
      {/* Aluminum can body with deep blue shrink sleeve */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 1.15, 32]} />
        <meshStandardMaterial color="#1b4d8a" roughness={0.35} metalness={0.12} />
      </mesh>
      {/* Brushed aluminum top cap */}
      <mesh position={[0, 0.63, 0]}>
        <cylinderGeometry args={[0.435, 0.435, 0.025, 32]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Stamped K-vent pressure relief score lines */}
      <mesh position={[0, 0.645, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.35, 4]} />
        <meshStandardMaterial color="#9ea3aa" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Negative polarity silver stripe with minus dashes */}
      <mesh position={[0, 0.05, 0.43]}>
        <boxGeometry args={[0.16, 1.12, 0.02]} />
        <meshStandardMaterial color="#dcdfe4" roughness={0.3} />
      </mesh>
      {[-0.32, 0, 0.32].map((y, i) => (
        <mesh key={i} position={[0, y + 0.05, 0.442]}>
          <boxGeometry args={[0.07, 0.022, 0.01]} />
          <meshStandardMaterial color="#111318" />
        </mesh>
      ))}
      {/* Rubber bung bottom seal */}
      <mesh position={[0, -0.53, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.04, 28]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Anode & Cathode leads (unequal lengths like real caps) */}
      <Lead position={[-0.16, -0.92, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.75} />
      <Lead position={[0.16, -1.02, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.95} />
    </group>
  );
}

export function CapacitorCeramicModel() {
  return (
    <group>
      {/* Burnt orange / ochre ceramic disc */}
      <mesh>
        <cylinderGeometry args={[0.45, 0.45, 0.12, 28]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#d4792a" roughness={0.62} />
      </mesh>
      {/* Chamfered edge rim */}
      <mesh>
        <torusGeometry args={[0.44, 0.055, 12, 28]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#bf6a20" roughness={0.6} />
      </mesh>
      {/* Stamped capacitance marking "104" (0.1µF) */}
      <mesh position={[0, 0.08, 0.065]}>
        <boxGeometry args={[0.24, 0.08, 0.01]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
      </mesh>
      {/* Solder meniscus at lead crimps */}
      {[-0.18, 0.18].map((x, i) => (
        <mesh key={i} position={[x, -0.42, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial {...MAT_LEAD} />
        </mesh>
      ))}
      <Lead position={[-0.18, -0.75, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.65} />
      <Lead position={[0.18, -0.75, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.65} />
    </group>
  );
}

export function InductorModel() {
  const wraps = 9;
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Dark ferrite core */}
      <mesh>
        <cylinderGeometry args={[0.22, 0.22, 1.25, 24]} />
        <meshStandardMaterial color="#22252a" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Core flared flanges */}
      {[-0.58, 0.58].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.08, 24]} />
          <meshStandardMaterial color="#1e2024" roughness={0.65} />
        </mesh>
      ))}
      {/* Glossy enameled copper coil winding */}
      {Array.from({ length: wraps }).map((_, i) => (
        <mesh key={i} position={[0, -0.46 + (i * 0.92) / (wraps - 1), 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26, 0.046, 12, 24]} />
          <meshStandardMaterial {...MAT_COPPER} />
        </mesh>
      ))}
      <Lead position={[0, -0.92, 0]} length={0.65} />
      <Lead position={[0, 0.92, 0]} length={0.65} />
    </group>
  );
}

export function PotentiometerModel() {
  return (
    <group>
      {/* Stamped round metal casing */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.42, 28]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Threaded mounting collar */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.24, 24]} />
        <meshStandardMaterial color="#c29b38" metalness={0.88} roughness={0.28} />
      </mesh>
      {/* Hex mounting nut */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 6]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Knurled metal / fluted shaft */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.42, 20]} />
        <meshStandardMaterial {...MAT_ALUMINUM} roughness={0.35} />
      </mesh>
      {/* Shaft screwdriver slot */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.035, 0.04, 0.24]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* 3 Solder lug terminals on bottom */}
      {[-0.24, 0, 0.24].map((x, i) => (
        <group key={i} position={[x, -0.36, 0.38]}>
          <mesh>
            <boxGeometry args={[0.1, 0.18, 0.03]} />
            <meshStandardMaterial {...MAT_LEAD} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function FuseModel() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Clear transparent glass cartridge */}
      <mesh>
        <cylinderGeometry args={[0.22, 0.22, 0.85, 24]} />
        <meshStandardMaterial
          color="#dce6f2"
          transparent
          opacity={0.42}
          roughness={0.06}
          metalness={0.05}
        />
      </mesh>
      {/* Visible thin fuse wire / filament inside */}
      <mesh>
        <cylinderGeometry args={[0.015, 0.015, 0.82, 8]} />
        <meshStandardMaterial color="#e0a845" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Nickel-plated brass end caps */}
      {[-0.52, 0.52].map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          <mesh>
            <cylinderGeometry args={[0.235, 0.235, 0.26, 24]} />
            <meshStandardMaterial {...MAT_ALUMINUM} />
          </mesh>
          <mesh position={[0, i === 0 ? -0.13 : 0.13, 0]}>
            <sphereGeometry args={[0.23, 16, 16]} />
            <meshStandardMaterial {...MAT_ALUMINUM} />
          </mesh>
        </group>
      ))}
      <Lead position={[0, -0.95, 0]} length={0.65} />
      <Lead position={[0, 0.95, 0]} length={0.65} />
    </group>
  );
}

export function WireModel() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Insulated PVC wire jacket in standard premium green */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 1.4, 20]} />
        <meshStandardMaterial color={COLOR_PREMIUM_GREEN} roughness={0.42} />
      </mesh>
      {/* Stripped stranded copper wire ends */}
      {[-0.85, 0.85].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 14]} />
          <meshStandardMaterial {...MAT_COPPER} />
        </mesh>
      ))}
    </group>
  );
}


// ============================================================================
// ACTIVE / SEMICONDUCTORS
// ============================================================================

export function LedModel({ lit = true } = {}) {
  const domeColor = lit ? "#ff4757" : "#802028";
  const emissiveColor = lit ? "#ff2a3a" : "#000000";
  const emissiveIntensity = lit ? 1.6 : 0;
  return (
    <group>
      {/* 5mm LED Polycarbonate dome with collar flange */}
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.42, 28, 28, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
        <meshStandardMaterial
          color={domeColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={0.85}
          roughness={0.12}
        />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.28, 28]} />
        <meshStandardMaterial
          color={domeColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity * 0.7}
          transparent
          opacity={0.85}
          roughness={0.12}
        />
      </mesh>
      {/* Bottom rim flange with flat cathode notch */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.06, 28]} />
        <meshStandardMaterial
          color={domeColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity * 0.5}
          transparent
          opacity={0.88}
          roughness={0.15}
        />
      </mesh>
      {/* Internal lead frame anvil & post inside the transparent dome */}
      <mesh position={[-0.07, 0.05, 0]}>
        <boxGeometry args={[0.12, 0.2, 0.04]} />
        <meshStandardMaterial {...MAT_LEAD} />
      </mesh>
      <mesh position={[0.07, 0.02, 0]}>
        <boxGeometry args={[0.04, 0.16, 0.04]} />
        <meshStandardMaterial {...MAT_LEAD} />
      </mesh>
      {/* Glowing semiconductor die chip when lit */}
      {lit && (
        <mesh position={[-0.05, 0.16, 0]}>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
        </mesh>
      )}
      {/* Cathode & Anode through-hole leads */}
      <Lead position={[-0.14, -0.85, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.85} />
      <Lead position={[0.14, -1.0, 0]} rotation={[Math.PI / 2, 0, 0]} length={1.15} />
    </group>
  );
}

export function RgbLedModel() {
  return (
    <group>
      {/* 5mm Diffused milky white dome */}
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.44, 28, 28, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
        <meshStandardMaterial color="#f0f3f6" transparent opacity={0.65} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.28, 28]} />
        <meshStandardMaterial color="#e8ecf0" transparent opacity={0.65} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.06, 28]} />
        <meshStandardMaterial color="#e0e5eb" transparent opacity={0.7} roughness={0.2} />
      </mesh>
      {/* 3 Separate micro-LED dies (Red, Green, Blue) glowing inside */}
      {[["#ff3838", -0.14], [COLOR_PREMIUM_GREEN, 0], ["#3888ff", 0.14]].map(([c, x], i) => (
        <mesh key={i} position={[x, 0.14, 0]}>
          <sphereGeometry args={[0.08, 14, 14]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.8} />
        </mesh>
      ))}
      {/* 4 Leads (Common cathode/anode + R, G, B) */}
      {[-0.24, -0.08, 0.08, 0.24].map((x, i) => (
        <Lead key={i} position={[x, -0.9 - (i === 1 ? 0.2 : 0), 0]} rotation={[Math.PI / 2, 0, 0]} length={0.9 + (i === 1 ? 0.3 : 0)} />
      ))}
    </group>
  );
}

export function DiodeModel() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* DO-41 Molded black cylindrical epoxy package */}
      <mesh>
        <cylinderGeometry args={[0.24, 0.24, 1.1, 24]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* High-contrast silver cathode polarity band */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.244, 0.244, 0.12, 24]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Laser marking "1N4007" on body */}
      <mesh position={[0, -0.12, 0.242]}>
        <boxGeometry args={[0.1, 0.35, 0.01]} />
        <meshStandardMaterial color="#888c94" roughness={0.6} />
      </mesh>
      <Lead position={[0, -0.95, 0]} length={0.75} />
      <Lead position={[0, 0.95, 0]} length={0.75} />
    </group>
  );
}

export function TransistorModel() {
  // TO-92 Package (2N2222 / 2N3904) with authentic D-shape profile
  return (
    <group>
      {/* Curved back body */}
      <mesh position={[0, 0.18, 0.08]}>
        <cylinderGeometry args={[0.42, 0.42, 0.85, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Flat front face */}
      <mesh position={[0, 0.18, 0.07]}>
        <boxGeometry args={[0.84, 0.85, 0.03]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Top beveled chamfer */}
      <mesh position={[0, 0.6, 0.08]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.42, 0.04, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Laser etched text on flat front */}
      <mesh position={[0, 0.25, 0.09]}>
        <boxGeometry args={[0.42, 0.12, 0.01]} />
        <meshStandardMaterial color="#9ea3aa" roughness={0.7} />
      </mesh>
      {/* 3 Staggered tinned wire leads (Emitter, Base, Collector) */}
      {[-0.26, 0, 0.26].map((x, i) => (
        <Lead key={i} position={[x, -0.65, 0.06]} rotation={[Math.PI / 2, 0, 0]} length={0.8} />
      ))}
    </group>
  );
}

export function MosfetModel() {
  // TO-220 Package with stamped nickel heatsink tab and mounting hole
  return (
    <group>
      {/* Molded black epoxy package lower body */}
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[0.92, 0.88, 0.28]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Upper chamfered body relief */}
      <mesh position={[0, 0.54, 0.02]}>
        <boxGeometry args={[0.88, 0.08, 0.24]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Stamped nickel-plated aluminum heatsink back tab */}
      <mesh position={[0, 0.82, -0.08]}>
        <boxGeometry args={[0.92, 0.54, 0.08]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* 3.2mm Heatsink mounting hole */}
      <mesh position={[0, 0.86, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.1, 16]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
      {/* Laser marking "IRF540N" */}
      <mesh position={[0, 0.22, 0.142]}>
        <boxGeometry args={[0.45, 0.14, 0.01]} />
        <meshStandardMaterial color="#888c94" roughness={0.7} />
      </mesh>
      {/* 3 Stamped rectangular leads (Gate, Drain, Source) */}
      {[-0.28, 0, 0.28].map((x, i) => (
        <StampedPin key={i} position={[x, -0.3, 0]} length={0.7} />
      ))}
    </group>
  );
}

export function IcDipModel() {
  // DIP-8 / Dual In-line Package with pin-1 notch and laser marking
  const pinsPerSide = 4;
  return (
    <group>
      {/* Molded black epoxy DIP body with chamfered top edges */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.65, 0.32, 0.72]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Pin 1 semicircular index notch on edge */}
      <mesh position={[-0.825, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#111318" roughness={0.8} />
      </mesh>
      {/* Pin 1 circular dimple dot */}
      <mesh position={[-0.6, 0.215, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.045, 14]} />
        <meshStandardMaterial color="#111318" roughness={0.8} />
      </mesh>
      {/* Laser etched text marking "NE555P" */}
      <mesh position={[0.05, 0.215, 0]}>
        <boxGeometry args={[0.7, 0.01, 0.22]} />
        <meshStandardMaterial color="#8a8e96" roughness={0.7} />
      </mesh>
      {/* Stamped through-hole pins with gull-wing bends */}
      {[-0.37, 0.37].map((z, side) =>
        Array.from({ length: pinsPerSide }).map((_, i) => (
          <group key={`${side}-${i}`} position={[-0.55 + i * 0.38, -0.05, z]}>
            {/* Shoulder exiting package horizontally */}
            <mesh position={[0, 0, side === 0 ? -0.06 : 0.06]}>
              <boxGeometry args={[0.08, 0.04, 0.12]} />
              <meshStandardMaterial {...MAT_LEAD} />
            </mesh>
            {/* Leg stepping vertically down */}
            <mesh position={[0, -0.22, side === 0 ? -0.11 : 0.11]}>
              <boxGeometry args={[0.05, 0.38, 0.03]} />
              <meshStandardMaterial {...MAT_LEAD} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

export function BridgeRectifierModel() {
  // DIP Bridge Rectifier (e.g. W04M / MB6S) with polarity symbols
  return (
    <group>
      {/* Molded square epoxy package with beveled corner indicating + pin */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.95, 0.44, 0.95]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Chamfered corner near Pin 1 (+) */}
      <mesh position={[-0.44, 0.12, -0.44]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.18, 0.45, 0.18]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Laser printed polarity symbols on top (+, ~, ~, -) */}
      <mesh position={[-0.24, 0.345, -0.24]}>
        <boxGeometry args={[0.1, 0.01, 0.1]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.6} />
      </mesh>
      <mesh position={[0.24, 0.345, 0.24]}>
        <boxGeometry args={[0.1, 0.01, 0.02]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.6} />
      </mesh>
      {/* 4 Sturdy through-hole leads */}
      {[[-0.34, -0.34], [0.34, -0.34], [-0.34, 0.34], [0.34, 0.34]].map(([x, z], i) => (
        <Lead key={i} position={[x, -0.42, z]} rotation={[Math.PI / 2, 0, 0]} length={0.65} radius={0.03} />
      ))}
    </group>
  );
}

// ============================================================================
// MICROCONTROLLER BOARDS (ESP32, ARDUINO)
// ============================================================================

export function DevBoardModel() {
  const pinCount = 15;
  return (
    <group position={[0, 0.08, 0]}>
      {/* Dark matte black solder-mask FR4 PCB substrate */}
      <mesh>
        <boxGeometry args={[1.9, 0.06, 1.05]} />
        <meshStandardMaterial {...MAT_PCB_BLACK} />
      </mesh>
      {/* Gold plated corner mounting holes */}
      {[[-0.86, -0.44], [0.86, -0.44], [-0.86, 0.44], [0.86, 0.44]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.032, z]}>
          <ringGeometry args={[0.035, 0.065, 16]} rotation={[-Math.PI / 2, 0, 0]} />
          <meshStandardMaterial {...MAT_GOLD} />
        </mesh>
      ))}
      {/* ESP-WROOM-32 Metal RF shield can */}
      <mesh position={[0.15, 0.1, 0]}>
        <boxGeometry args={[0.75, 0.14, 0.65]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Laser etched ESP32 logo on shield */}
      <mesh position={[0.15, 0.172, 0]}>
        <boxGeometry args={[0.5, 0.005, 0.38]} />
        <meshStandardMaterial color="#6a707a" roughness={0.5} />
      </mesh>
      {/* Meandered PCB Antenna on corner in gold */}
      <mesh position={[0.66, 0.032, 0]}>
        <boxGeometry args={[0.22, 0.005, 0.58]} />
        <meshStandardMaterial {...MAT_GOLD} roughness={0.3} />
      </mesh>
      {/* Micro-USB / USB-C receptacle shell */}
      <mesh position={[-0.92, 0.08, 0]}>
        <boxGeometry args={[0.22, 0.15, 0.32]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Tactile EN / BOOT buttons */}
      {[-0.24, 0.24].map((z, i) => (
        <group key={i} position={[-0.72, 0.08, z]}>
          <mesh>
            <boxGeometry args={[0.12, 0.08, 0.1]} />
            <meshStandardMaterial {...MAT_EPOXY_BLACK} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.04, 12]} />
            <meshStandardMaterial {...MAT_ALUMINUM} />
          </mesh>
        </group>
      ))}
      {/* Status LEDs (Red Power LED, Standard Premium Green GPIO2 LED) */}
      <mesh position={[-0.5, 0.05, -0.2]}>
        <boxGeometry args={[0.05, 0.03, 0.03]} />
        <meshStandardMaterial color="#ff4757" emissive="#ff4757" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[-0.5, 0.05, 0.2]}>
        <boxGeometry args={[0.05, 0.03, 0.03]} />
        <meshStandardMaterial color={COLOR_PREMIUM_GREEN} emissive={COLOR_PREMIUM_GREEN} emissiveIntensity={1.2} />
      </mesh>
      {/* Dual rows of 0.1" pin headers with gold contact pins */}
      {Array.from({ length: pinCount }).map((_, i) => (
        <group key={`pin-${i}`}>
          <HeaderPin position={[-0.75 + i * 0.11, 0, 0.46]} isGold={true} />
          <HeaderPin position={[-0.75 + i * 0.11, 0, -0.46]} isGold={true} />
        </group>
      ))}
    </group>
  );
}

// ============================================================================
// POWER SOURCES
// ============================================================================

export function Battery9vModel() {
  return (
    <group>
      {/* Rectangular steel housing with rounded vertical corners */}
      <mesh>
        <boxGeometry args={[0.75, 1.35, 0.52]} />
        <meshStandardMaterial {...MAT_STEEL_DARK} />
      </mesh>
      {/* Black and Gold industrial label sleeve */}
      <mesh position={[0, -0.05, 0.262]}>
        <boxGeometry args={[0.72, 1.05, 0.01]} />
        <meshStandardMaterial color="#111318" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.32, 0.264]}>
        <boxGeometry args={[0.68, 0.22, 0.01]} />
        <meshStandardMaterial color="#e5b836" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Top phenolic insulator terminal plate */}
      <mesh position={[0, 0.69, 0]}>
        <boxGeometry args={[0.72, 0.04, 0.48]} />
        <meshStandardMaterial color="#22252a" roughness={0.7} />
      </mesh>
      {/* Positive terminal (+ circular male stud) */}
      <mesh position={[-0.18, 0.77, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.14, 16]} />
        <meshStandardMaterial {...MAT_LEAD} />
      </mesh>
      {/* Negative terminal (- hexagonal female snap crown) */}
      <mesh position={[0.18, 0.77, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.14, 6]} />
        <meshStandardMaterial {...MAT_LEAD} />
      </mesh>
    </group>
  );
}

export function BatteryAaModel() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Steel cylindrical cell with black/copper livery */}
      <mesh>
        <cylinderGeometry args={[0.32, 0.32, 1.25, 28]} />
        <meshStandardMaterial color="#111318" roughness={0.35} />
      </mesh>
      {/* Metallic copper positive collar */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.322, 0.322, 0.4, 28]} />
        <meshStandardMaterial {...MAT_COPPER} />
      </mesh>
      {/* Raised positive button pip (+) */}
      <mesh position={[0, 0.67, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.1, 20]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Flat steel negative terminal base (-) */}
      <mesh position={[0, -0.63, 0]}>
        <cylinderGeometry args={[0.31, 0.31, 0.02, 28]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
    </group>
  );
}

export function CoinCellModel() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* CR2032 Nickel-plated stainless steel coin button */}
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 0.13, 32]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Negative stepped bottom button */}
      <mesh position={[0, -0.068, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.015, 32]} />
        <meshStandardMaterial {...MAT_STEEL_DARK} />
      </mesh>
      {/* Laser etched "CR2032 3V +" */}
      <mesh position={[0, 0.068, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.38, 24]} />
        <meshStandardMaterial color="#9ea3aa" roughness={0.6} />
      </mesh>
      <Lead position={[0, -0.45, 0]} length={0.5} />
      <Lead position={[0, 0.45, 0]} length={0.5} />
    </group>
  );
}

export function SolarPanelModel() {
  return (
    <group>
      {/* Anodized aluminum frame */}
      <mesh>
        <boxGeometry args={[1.5, 0.07, 1.15]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Deep blue monocrystalline silicon wafer */}
      <mesh position={[0, 0.038, 0]}>
        <boxGeometry args={[1.42, 0.01, 1.07]} />
        <meshStandardMaterial color="#0c1b3a" roughness={0.2} metalness={0.4} />
      </mesh>
      {/* Fine silver solar grid busbars */}
      {[-0.38, 0, 0.38].map((x, i) => (
        <mesh key={i} position={[x, 0.045, 0]}>
          <boxGeometry args={[0.015, 0.005, 1.05]} />
          <meshStandardMaterial {...MAT_LEAD} />
        </mesh>
      ))}
      <Lead position={[-0.25, -0.22, 0.6]} rotation={[Math.PI / 2, 0, 0]} length={0.45} />
      <Lead position={[0.25, -0.22, 0.6]} rotation={[Math.PI / 2, 0, 0]} length={0.45} />
    </group>
  );
}

export function BenchPsuModel() {
  return (
    <group>
      {/* Laboratory metal chassis */}
      <mesh>
        <boxGeometry args={[1.7, 1.05, 1]} />
        <meshStandardMaterial {...MAT_STEEL_DARK} />
      </mesh>
      {/* Front panel fascia */}
      <mesh position={[0, 0, 0.51]}>
        <boxGeometry args={[1.62, 0.98, 0.02]} />
        <meshStandardMaterial color="#20242a" roughness={0.4} />
      </mesh>
      {/* Voltage 7-segment digital display in Standard Premium Green */}
      <mesh position={[-0.42, 0.22, 0.525]}>
        <boxGeometry args={[0.55, 0.24, 0.015]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
      <mesh position={[-0.42, 0.22, 0.535]}>
        <boxGeometry args={[0.45, 0.16, 0.005]} />
        <meshStandardMaterial color={COLOR_PREMIUM_GREEN} emissive={COLOR_PREMIUM_GREEN} emissiveIntensity={1.4} />
      </mesh>
      {/* Current 7-segment digital display in Gold */}
      <mesh position={[0.42, 0.22, 0.525]}>
        <boxGeometry args={[0.55, 0.24, 0.015]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
      <mesh position={[0.42, 0.22, 0.535]}>
        <boxGeometry args={[0.45, 0.16, 0.005]} />
        <meshStandardMaterial color="#FFD400" emissive="#FFD400" emissiveIntensity={1.3} />
      </mesh>
      {/* Coarse / Fine adjustment knobs */}
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x, -0.08, 0.53]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 20]} />
          <meshStandardMaterial {...MAT_ALUMINUM} />
        </mesh>
      ))}
      {/* Banana binding posts (Red +, Black -, Green GND) */}
      {[[-0.36, "#e63946"], [0, "#111111"], [0.36, COLOR_PREMIUM_GREEN]].map(([x, c], i) => (
        <mesh key={i} position={[x, -0.32, 0.53]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.1, 16]} />
          <meshStandardMaterial color={c} roughness={0.3} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}


export function UsbPowerModel() {
  return (
    <group>
      {/* Metallic USB-A male plug shell */}
      <mesh>
        <boxGeometry args={[0.95, 0.36, 0.52]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Plastic tongue inside plug */}
      <mesh position={[0, 0.04, 0.04]}>
        <boxGeometry args={[0.72, 0.1, 0.38]} />
        <meshStandardMaterial color="#14171c" roughness={0.4} />
      </mesh>
      {/* 4 Gold spring contact fingers */}
      {[-0.24, -0.08, 0.08, 0.24].map((x, i) => (
        <mesh key={i} position={[x, 0.1, 0.08]}>
          <boxGeometry args={[0.04, 0.015, 0.22]} />
          <meshStandardMaterial {...MAT_GOLD} />
        </mesh>
      ))}
      <Lead position={[-0.2, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.45} />
      <Lead position={[0.2, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.45} />
    </group>
  );
}

// ============================================================================
// CONTROL / SWITCHES
// ============================================================================

export function SwitchModel({ on = true } = {}) {
  // SPST Heavy Duty Toggle Switch with Chrome Bat Lever
  const leverAngle = on ? -0.45 : 0.45;
  return (
    <group>
      {/* Bakelite lower case */}
      <mesh position={[0, -0.18, 0]}>
        <boxGeometry args={[0.85, 0.42, 0.6]} />
        <meshStandardMaterial color="#1a1c20" roughness={0.6} />
      </mesh>
      {/* Threaded chrome bushing collar */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.22, 24]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Chrome locking hex nut */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.08, 6]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Gleaming chrome bat toggle lever */}
      <group position={[0, 0.22, 0]} rotation={[0, 0, leverAngle]}>
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 0.55, 20]} />
          <meshStandardMaterial {...MAT_ALUMINUM} />
        </mesh>
        <mesh position={[0, 0.56, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial {...MAT_ALUMINUM} />
        </mesh>
      </group>
      {/* Solder lugs on bottom */}
      {[-0.26, 0.26].map((x, i) => (
        <Lead key={i} position={[x, -0.48, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.4} />
      ))}
    </group>
  );
}

export function PushButtonModel() {
  // 6x6mm Tactile momentary push button
  return (
    <group>
      {/* Thermoplastic square base */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[0.82, 0.26, 0.82]} />
        <meshStandardMaterial color="#181a1f" roughness={0.65} />
      </mesh>
      {/* Stamped stainless steel retainer top bracket */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.84, 0.03, 0.84]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Corner rivets */}
      {[[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.1, z]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial {...MAT_ALUMINUM} />
        </mesh>
      ))}
      {/* Round round actuator button (Standard Premium Green) */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.18, 24]} />
        <meshStandardMaterial color={COLOR_PREMIUM_GREEN} roughness={0.4} />
      </mesh>
      {/* 4 Gull-wing through-hole legs */}
      {[[-0.38, -0.3], [0.38, -0.3], [-0.38, 0.3], [0.38, 0.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.22, z]}>
          <boxGeometry args={[0.06, 0.2, 0.04]} />
          <meshStandardMaterial {...MAT_LEAD} />
        </mesh>
      ))}
    </group>
  );
}


export function RockerSwitchModel({ on = true } = {}) {
  const angle = on ? -0.26 : 0.26;
  return (
    <group>
      {/* Bezel frame housing */}
      <mesh>
        <boxGeometry args={[0.95, 0.52, 0.65]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Curved rocker paddle */}
      <group position={[0, 0.24, 0]} rotation={[0, 0, angle]}>
        <mesh>
          <boxGeometry args={[0.66, 0.16, 0.44]} />
          <meshStandardMaterial color={on ? COLOR_PREMIUM_GREEN : "#282c34"} roughness={0.35} />
        </mesh>
        {/* I / O markings */}
        <mesh position={[-0.2, 0.09, 0]}>
          <boxGeometry args={[0.08, 0.01, 0.02]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        <mesh position={[0.2, 0.09, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.01, 12]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
      </group>
      <Lead position={[-0.24, -0.42, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.4} />
      <Lead position={[0.24, -0.42, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.4} />
    </group>
  );
}

export function SlideSwitchModel({ on = true } = {}) {
  const knobX = on ? 0.24 : -0.24;
  return (
    <group>
      {/* Metal shield bracket */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[1.05, 0.24, 0.45]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Sliding actuator handle */}
      <mesh position={[knobX, 0.14, 0]}>
        <boxGeometry args={[0.24, 0.22, 0.22]} />
        <meshStandardMaterial color="#1a1c22" roughness={0.5} />
      </mesh>
      {/* 3 Stamped through-hole pins */}
      {[-0.32, 0, 0.32].map((x, i) => (
        <Lead key={i} position={[x, -0.32, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.35} />
      ))}
    </group>
  );
}

export function DipSwitchModel({ on = true } = {}) {
  const n = 4;
  const tilt = on ? -0.32 : 0.32;
  return (
    <group>
      {/* Red/Blue molded piano DIP housing */}
      <mesh>
        <boxGeometry args={[1.3, 0.28, 0.65]} />
        <meshStandardMaterial color="#bd2b2b" roughness={0.45} />
      </mesh>
      {/* 4 White slide toggles */}
      {Array.from({ length: n }).map((_, i) => (
        <mesh key={i} position={[-0.45 + i * 0.3, 0.16, 0]} rotation={[0, 0, tilt]}>
          <boxGeometry args={[0.13, 0.16, 0.26]} />
          <meshStandardMaterial color="#f2f5f8" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}


export function RelayModel() {
  // Sealed 5V DC Sugar Cube Relay (Songle style)
  return (
    <group>
      {/* Glossy blue PBT plastic cube */}
      <mesh>
        <boxGeometry args={[1.25, 0.95, 0.95]} />
        <meshStandardMaterial color="#1b4d8a" roughness={0.3} />
      </mesh>
      {/* Laser printed wiring diagram & rating plate */}
      <mesh position={[0, 0.485, 0]}>
        <boxGeometry args={[0.95, 0.01, 0.7]} />
        <meshStandardMaterial color="#e5ecf5" roughness={0.6} />
      </mesh>
      {/* 5 Pins on bottom (Coil 1, Coil 2, COM, NO, NC) */}
      {[-0.42, -0.14, 0.14, 0.42].map((x, i) => (
        <Lead key={i} position={[x, -0.58, 0.35]} rotation={[Math.PI / 2, 0, 0]} length={0.35} />
      ))}
      <Lead position={[0, -0.58, -0.35]} rotation={[Math.PI / 2, 0, 0]} length={0.35} />
    </group>
  );
}

// ============================================================================
// OUTPUTS / MOTORS / AUDIO
// ============================================================================

export function BuzzerModel() {
  // Piezo / Electromagnetic 12mm sounder
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 0.44, 32]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Top sound emission aperture hole */}
      <mesh position={[0, 0.225, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 20]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Brass resonator disc visible inside */}
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.01, 20]} />
        <meshStandardMaterial {...MAT_GOLD} />
      </mesh>
      <Lead position={[-0.2, -0.52, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.6} />
      <Lead position={[0.2, -0.52, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.6} />
    </group>
  );
}

export function DcMotorModel() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Steel cylindrical motor casing with flat sides */}
      <mesh>
        <cylinderGeometry args={[0.45, 0.45, 1.1, 32]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Front bearing boss */}
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.1, 20]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* 2mm Hardened steel drive shaft with flat spot */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.45, 16]} />
        <meshStandardMaterial {...MAT_LEAD} />
      </mesh>
      {/* Plastic rear end-bell with copper solder tabs */}
      <mesh position={[0, -0.56, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.06, 28]} />
        <meshStandardMaterial color="#181a1f" roughness={0.7} />
      </mesh>
      {[-0.18, 0.18].map((x, i) => (
        <mesh key={i} position={[x, -0.66, 0]}>
          <boxGeometry args={[0.06, 0.14, 0.02]} />
          <meshStandardMaterial {...MAT_COPPER} />
        </mesh>
      ))}
    </group>
  );
}


export function SpeakerModel() {
  return (
    <group>
      {/* Stamped steel basket chassis rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.065, 14, 32]} />
        <meshStandardMaterial {...MAT_STEEL_DARK} />
      </mesh>
      {/* Paper/polypropylene acoustic cone */}
      <mesh position={[0, -0.06, 0]}>
        <coneGeometry args={[0.48, 0.38, 32, 1, true]} />
        <meshStandardMaterial color="#24272c" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Center spherical dust cap */}
      <mesh position={[0, -0.16, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#181a1d" roughness={0.5} />
      </mesh>
      {/* Ferrite magnet motor assembly */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.24, 28]} />
        <meshStandardMaterial color="#1f2228" roughness={0.65} metalness={0.2} />
      </mesh>
      <Lead position={[-0.14, -0.58, 0]} length={0.35} />
      <Lead position={[0.14, -0.58, 0]} length={0.35} />
    </group>
  );
}

export function ServoMotorModel() {
  // SG90 Micro Servo 9g
  return (
    <group>
      {/* Translucent blue nylon case */}
      <mesh>
        <boxGeometry args={[0.85, 0.95, 0.52]} />
        <meshStandardMaterial color="#2270c9" transparent opacity={0.85} roughness={0.25} />
      </mesh>
      {/* Mounting lugs with screw holes */}
      {[-0.52, 0.52].map((x, i) => (
        <mesh key={i} position={[x, 0.1, 0]}>
          <boxGeometry args={[0.22, 0.08, 0.52]} />
          <meshStandardMaterial color="#2270c9" roughness={0.3} />
        </mesh>
      ))}
      {/* Top gear tower & output spline */}
      <mesh position={[0.18, 0.58, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.22, 24]} />
        <meshStandardMaterial color="#2270c9" roughness={0.3} />
      </mesh>
      {/* White nylon servo horn arm with linkage holes */}
      <group position={[0.18, 0.72, 0]} rotation={[0, 0, 0.2]}>
        <mesh>
          <cylinderGeometry args={[0.14, 0.14, 0.06, 20]} />
          <meshStandardMaterial color="#f0f3f6" roughness={0.4} />
        </mesh>
        <mesh position={[0.22, 0, 0]}>
          <boxGeometry args={[0.42, 0.05, 0.12]} />
          <meshStandardMaterial color="#f0f3f6" roughness={0.4} />
        </mesh>
      </group>
      {/* 3-Wire ribbon cable on side */}
      <mesh position={[-0.44, -0.35, 0]}>
        <boxGeometry args={[0.06, 0.16, 0.18]} />
        <meshStandardMaterial color="#e58e26" />
      </mesh>
    </group>
  );
}

export function StepperMotorModel() {
  // NEMA 17 Hybrid Stepper Motor
  return (
    <group>
      {/* Square aluminum front & back end-caps */}
      {[-0.36, 0.36].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[0.95, 0.14, 0.95]} />
          <meshStandardMaterial {...MAT_ALUMINUM} />
        </mesh>
      ))}
      {/* Stacked silicon steel stator laminations in center */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.92, 0.62, 0.92]} />
        <meshStandardMaterial {...MAT_STEEL_DARK} />
      </mesh>
      {/* Stator circular cutouts */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.63, 32]} />
        <meshStandardMaterial {...MAT_STEEL_DARK} />
      </mesh>
      {/* 5mm D-shaft extending out front */}
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.45, 20]} />
        <meshStandardMaterial {...MAT_LEAD} />
      </mesh>
      {/* 4 Corner tie bolts */}
      {[[-0.38, -0.38], [0.38, -0.38], [-0.38, 0.38], [0.38, 0.38]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.44, z]}>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
          <meshStandardMaterial {...MAT_ALUMINUM} />
        </mesh>
      ))}
    </group>
  );
}


export function FanModel() {
  return (
    <group>
      {/* Black PBT square frame with 4 corner mounting screw holes */}
      <mesh>
        <boxGeometry args={[1.05, 1.05, 0.25]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Center circular air tunnel cutout */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.26, 32]} />
        <meshStandardMaterial color="#141517" />
      </mesh>
      {/* Center motor hub */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.16, 24]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#1a1c22" roughness={0.4} />
      </mesh>
      {/* 7 Aerodynamic curved blades */}
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i / 7) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, 0, angle]}>
            <mesh position={[0.32, 0, 0]} rotation={[0.35, 0, 0]}>
              <boxGeometry args={[0.26, 0.12, 0.02]} />
              <meshStandardMaterial color="#2d3238" roughness={0.35} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ============================================================================
// SENSORS
// ============================================================================

export function UltrasonicSensorModel() {
  // HC-SR04 Ultrasonic Distance Sensor
  return (
    <group>
      {/* Blue FR4 breakout PCB */}
      <mesh>
        <boxGeometry args={[1.45, 0.65, 0.06]} />
        <meshStandardMaterial {...MAT_PCB_BLUE} />
      </mesh>
      {/* Two aluminum ultrasonic transducer barrels ("T" Transmitter, "R" Receiver) */}
      {[-0.42, 0.42].map((x, i) => (
        <group key={i} position={[x, 0, 0.2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.36, 28]} />
            <meshStandardMaterial {...MAT_ALUMINUM} />
          </mesh>
          {/* Fine wire acoustic mesh grille */}
          <mesh position={[0, 0, 0.185]} rotation={[0, 0, 0]}>
            <circleGeometry args={[0.22, 24]} />
            <meshStandardMaterial color="#2b313a" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* "T" / "R" laser identification */}
          <mesh position={[0, 0.2, 0.16]}>
            <boxGeometry args={[0.08, 0.08, 0.01]} />
            <meshStandardMaterial {...MAT_SILKSCREEN} />
          </mesh>
        </group>
      ))}
      {/* Quartz crystal oscillator on board */}
      <mesh position={[0, 0.14, 0.06]}>
        <boxGeometry args={[0.22, 0.1, 0.06]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* 4-Pin header on bottom (VCC, Trig, Echo, GND) */}
      {[-0.24, -0.08, 0.08, 0.24].map((x, i) => (
        <HeaderPin key={i} position={[x, -0.38, 0]} isGold={true} />
      ))}
    </group>
  );
}

export function PirSensorModel() {
  // HC-SR501 PIR Motion Sensor with Segmented Fresnel Dome
  return (
    <group>
      {/* Green PCB base */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[1.1, 0.06, 0.9]} />
        <meshStandardMaterial {...MAT_PCB_GREEN} />
      </mesh>
      {/* Dual orange trimpots */}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x, -0.1, -0.32]}>
          <boxGeometry args={[0.16, 0.1, 0.16]} />
          <meshStandardMaterial color="#e0701a" roughness={0.4} />
        </mesh>
      ))}
      {/* Sensor metal can */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.15, 24]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* White translucent multi-faceted Fresnel lens dome */}
      <mesh position={[0, 0.16, 0]}>
        <sphereGeometry args={[0.46, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.82} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function LdrModel() {
  // Light Dependent Resistor (Photoresistor)
  return (
    <group>
      {/* Ceramic disc substrate */}
      <mesh>
        <cylinderGeometry args={[0.42, 0.42, 0.12, 28]} />
        <meshStandardMaterial color="#e8c070" roughness={0.6} />
      </mesh>
      {/* Transparent epoxy coating */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.41, 0.41, 0.03, 28]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.6} roughness={0.1} />
      </mesh>
      {/* Cadmium sulfide serpentine photo-conductive track in dark red */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 0.065, -0.25 + i * 0.1]}>
          <boxGeometry args={[0.45, 0.01, 0.03]} />
          <meshStandardMaterial color="#8a2020" roughness={0.5} />
        </mesh>
      ))}
      <Lead position={[-0.16, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.6} />
      <Lead position={[0.16, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.6} />
    </group>
  );
}

export function ThermistorModel() {
  return (
    <group>
      {/* NTC Thermistor blue bead / disc */}
      <mesh>
        <sphereGeometry args={[0.34, 24, 24]} />
        <meshStandardMaterial color="#1b4d8a" roughness={0.4} />
      </mesh>
      {/* Stamped resistance marking */}
      <mesh position={[0, 0, 0.3]}>
        <boxGeometry args={[0.18, 0.08, 0.01]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.6} />
      </mesh>
      <Lead position={[-0.12, -0.45, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.65} />
      <Lead position={[0.12, -0.45, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.65} />
    </group>
  );
}

export function HumiditySensorModel() {
  // DHT11 Temperature & Humidity Sensor in Perforated Blue Case
  return (
    <group>
      {/* Sky-blue ABS plastic housing with front vent grilles */}
      <mesh>
        <boxGeometry args={[0.88, 1.1, 0.42]} />
        <meshStandardMaterial color="#2d7dd2" roughness={0.35} />
      </mesh>
      {/* Ventilation slots */}
      {[-0.2, 0, 0.2].map((y, i) => (
        <mesh key={i} position={[0, y, 0.215]}>
          <boxGeometry args={[0.62, 0.08, 0.02]} />
          <meshStandardMaterial color="#1a1c22" />
        </mesh>
      ))}
      {/* 4-Pin header on bottom */}
      {[-0.24, -0.08, 0.08, 0.24].map((x, i) => (
        <Lead key={i} position={[x, -0.72, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.45} />
      ))}
    </group>
  );
}

export function GasSensorModel() {
  // MQ-2 / MQ-135 Gas Sensor with Stainless Steel Wire Mesh
  return (
    <group>
      {/* Bakelite base */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[0.9, 0.12, 0.9]} />
        <meshStandardMaterial {...MAT_PCB_BLUE} />
      </mesh>
      {/* Fine stainless steel wire mesh filter dome */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.44, 28]} />
        <meshStandardMaterial {...MAT_ALUMINUM} roughness={0.3} metalness={0.75} />
      </mesh>
      {/* Top ring bezel */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.39, 0.39, 0.04, 28]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
    </group>
  );
}

export function TouchSensorModel() {
  return (
    <group>
      {/* Circular capacitive touch sensor breakout */}
      <mesh>
        <cylinderGeometry args={[0.46, 0.46, 0.06, 32]} />
        <meshStandardMaterial {...MAT_PCB_BLUE} />
      </mesh>
      {/* Concentric gold capacitive touch pad */}
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.34, 32]} />
        <meshStandardMaterial {...MAT_GOLD} />
      </mesh>
      <HeaderPin position={[0, -0.25, 0]} isGold={true} />
    </group>
  );
}

export function IrSensorModel() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.1, 0.2, 0.55]} />
        <meshStandardMaterial {...MAT_PCB_BLUE} />
      </mesh>
      {/* IR Emitter LED (Clear/Blue) & Photodiode (Dark/Black) */}
      <mesh position={[-0.28, 0.16, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.18, 16]} />
        <meshStandardMaterial color="#4d2270" roughness={0.2} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0.28, 0.16, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.18, 16]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
    </group>
  );
}

export function To92SensorModel() {
  return <TransistorModel />;
}

// ============================================================================
// DISPLAYS
// ============================================================================

export function SevenSegmentModel() {
  // 1-Digit 7-Segment Red LED Display with Decimal Point
  const segments = [
    [0, 0.34, 0.58, 0.08],     // a (top)
    [0.26, 0.18, 0.08, 0.46],  // b (top right)
    [0.26, -0.18, 0.08, 0.46], // c (bottom right)
    [0, -0.34, 0.58, 0.08],    // d (bottom)
    [-0.26, -0.18, 0.08, 0.46],// e (bottom left)
    [-0.26, 0.18, 0.08, 0.46], // f (top left)
    [0, 0, 0.58, 0.08],        // g (center)
  ];
  return (
    <group>
      {/* Grey/black epoxy module body */}
      <mesh>
        <boxGeometry args={[1.05, 1.35, 0.24]} />
        <meshStandardMaterial color="#1a1c22" roughness={0.65} />
      </mesh>
      {/* Glowing red LED segments */}
      {segments.map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.125]}>
          <boxGeometry args={[w, h, 0.015]} />
          <meshStandardMaterial color="#ff3838" emissive="#ff1111" emissiveIntensity={1.4} />
        </mesh>
      ))}
      {/* Decimal point (DP) */}
      <mesh position={[0.42, -0.34, 0.125]}>
        <cylinderGeometry args={[0.045, 0.045, 0.015, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#ff3838" emissive="#ff1111" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

export function LcdDisplayModel() {
  // 16x2 Character HD44780 LCD Module
  return (
    <group>
      {/* PCB substrate */}
      <mesh>
        <boxGeometry args={[1.9, 0.95, 0.08]} />
        <meshStandardMaterial {...MAT_PCB_GREEN} />
      </mesh>
      {/* Stamped metal bezel frame */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[1.65, 0.75, 0.06]} />
        <meshStandardMaterial {...MAT_STEEL_DARK} />
      </mesh>
      {/* Backlit LCD screen showing 5x8 character blocks */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[1.48, 0.58, 0.01]} />
        <meshStandardMaterial
          color={COLOR_PREMIUM_GREEN}
          emissive={COLOR_PREMIUM_GREEN}
          emissiveIntensity={0.6}
          roughness={0.25}
        />
      </mesh>
      {/* 16-Pin interface header along top */}
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={i} position={[-0.75 + i * 0.1, 0.42, 0.05]}>
          <circleGeometry args={[0.025, 12]} />
          <meshStandardMaterial {...MAT_GOLD} />
        </mesh>
      ))}
    </group>
  );
}


export function OledDisplayModel() {
  // 0.96" I2C 128x64 OLED Display (SSD1306)
  return (
    <group>
      {/* Blue breakout PCB */}
      <mesh>
        <boxGeometry args={[1.15, 0.82, 0.06]} />
        <meshStandardMaterial {...MAT_PCB_BLUE} />
      </mesh>
      {/* Glass OLED Panel with glossy surface */}
      <mesh position={[0, 0.05, 0.05]}>
        <boxGeometry args={[0.98, 0.56, 0.02]} />
        <meshStandardMaterial color="#080c12" roughness={0.1} metalness={0.1} />
      </mesh>
      {/* Active display area with glowing cyan telemetry readout */}
      <mesh position={[0, 0.05, 0.065]}>
        <boxGeometry args={[0.84, 0.44, 0.005]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.2} />
      </mesh>
      {/* 4-Pin I2C header along top (GND, VCC, SCL, SDA) */}
      {[-0.24, -0.08, 0.08, 0.24].map((x, i) => (
        <HeaderPin key={i} position={[x, 0.34, 0]} isGold={true} />
      ))}
    </group>
  );
}

export function LedMatrixModel() {
  const n = 5;
  return (
    <group>
      {/* Black plastic 5x5 dot matrix module */}
      <mesh>
        <boxGeometry args={[1.15, 1.15, 0.18]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* 25 Diffused red LED pixel dots */}
      {Array.from({ length: n }).map((_, r) =>
        Array.from({ length: n }).map((_, c) => (
          <mesh key={`${r}-${c}`} position={[-0.4 + c * 0.2, -0.4 + r * 0.2, 0.1]}>
            <sphereGeometry args={[0.065, 14, 14]} />
            <meshStandardMaterial color="#ff3838" emissive="#ff1111" emissiveIntensity={0.8} />
          </mesh>
        ))
      )}
    </group>
  );
}

// ============================================================================
// PROTOTYPING / MISC HARDWARE
// ============================================================================

export function CrystalOscillatorModel() {
  // HC-49S Low Profile Quartz Crystal
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Oval/elliptical stamped tin metal can */}
      <mesh>
        <boxGeometry args={[0.8, 0.38, 0.25]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Top curved dome caps */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.38, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial {...MAT_ALUMINUM} />
        </mesh>
      ))}
      <Lead position={[0, -0.45, 0]} length={0.5} />
      <Lead position={[0, 0.45, 0]} length={0.5} />
    </group>
  );
}

export function BreadboardModel() {
  return (
    <group>
      {/* Off-white ABS plastic body with chamfers */}
      <mesh>
        <boxGeometry args={[2.2, 0.18, 1.3]} />
        <meshStandardMaterial color="#e8e4da" roughness={0.65} />
      </mesh>
      {/* Center IC divider trough */}
      <mesh position={[0, 0.095, 0]}>
        <boxGeometry args={[2.1, 0.02, 0.08]} />
        <meshStandardMaterial color="#d4cec2" roughness={0.8} />
      </mesh>
      {/* Red (+) & Blue (-) power bus lines */}
      <mesh position={[0, 0.095, 0.56]}>
        <boxGeometry args={[2, 0.01, 0.03]} />
        <meshStandardMaterial color="#e63946" />
      </mesh>
      <mesh position={[0, 0.095, 0.49]}>
        <boxGeometry args={[2, 0.01, 0.03]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
      <mesh position={[0, 0.095, -0.56]}>
        <boxGeometry args={[2, 0.01, 0.03]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
      <mesh position={[0, 0.095, -0.49]}>
        <boxGeometry args={[2, 0.01, 0.03]} />
        <meshStandardMaterial color="#e63946" />
      </mesh>
      {/* Grid of contact tie-point holes */}
      {Array.from({ length: 12 }).map((_, c) =>
        [-0.32, -0.16, 0.16, 0.32].map((z, r) => (
          <mesh key={`${c}-${r}`} position={[-0.95 + c * 0.17, 0.095, z]}>
            <boxGeometry args={[0.045, 0.015, 0.045]} />
            <meshStandardMaterial color="#2d3238" />
          </mesh>
        ))
      )}
    </group>
  );
}

export function TerminalBlockModel() {
  // 2-Position Rising Clamp Screw Terminal Block (Standard Premium Green)
  return (
    <group>
      {/* Flame-retardant polyamide housing in Standard Premium Green */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.05, 0.55, 0.6]} />
        <meshStandardMaterial color={COLOR_PREMIUM_GREEN} roughness={0.48} />
      </mesh>
      {/* Wire entry apertures on front face */}
      {[-0.26, 0.26].map((x, i) => (
        <mesh key={i} position={[x, 0.04, 0.305]}>
          <boxGeometry args={[0.22, 0.22, 0.02]} />
          <meshStandardMaterial color="#111318" />
        </mesh>
      ))}
      {/* Top zinc-plated slotted clamping screws */}
      {[-0.26, 0.26].map((x, i) => (
        <group key={i} position={[x, 0.36, 0]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
            <meshStandardMaterial {...MAT_ALUMINUM} />
          </mesh>
          <mesh position={[0, 0.042, 0]}>
            <boxGeometry args={[0.025, 0.01, 0.18]} />
            <meshStandardMaterial color="#111318" />
          </mesh>
        </group>
      ))}
      <Lead position={[-0.26, -0.38, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.4} />
      <Lead position={[0.26, -0.38, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.4} />
    </group>
  );
}

// ============================================================================
// NEW AUTHENTIC COMPONENT MODELS (NO WRONG MODELS)
// ============================================================================

export function HeatSinkModel() {
  // Extruded Aluminum Finned Heatsink with mounting channel
  const finCount = 7;
  return (
    <group position={[0, 0.25, 0]}>
      {/* Heavy base plate */}
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[1.25, 0.1, 1.15]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* 7 Vertical extruded cooling fins */}
      {Array.from({ length: finCount }).map((_, i) => (
        <mesh key={i} position={[-0.52 + (i * 1.04) / (finCount - 1), 0.16, 0]}>
          <boxGeometry args={[0.05, 0.68, 1.15]} />
          <meshStandardMaterial {...MAT_ALUMINUM} />
        </mesh>
      ))}
      {/* Central TO-220 mounting pad with tapped screw hole */}
      <mesh position={[0, -0.16, 0]}>
        <boxGeometry args={[0.35, 0.04, 0.35]} />
        <meshStandardMaterial {...MAT_ALUMINUM} roughness={0.15} />
      </mesh>
      <mesh position={[0, -0.13, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.05, 16]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
    </group>
  );
}

export function SoilMoistureSensorModel() {
  // Two gold-plated soil probe prongs with top sensor amplifier board
  return (
    <group position={[0, 0.35, 0]}>
      {/* Top amplifier/potentiometer breakout PCB */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.92, 0.42, 0.06]} />
        <meshStandardMaterial {...MAT_PCB_BLUE} />
      </mesh>
      {/* LM393 dual comparator chip */}
      <mesh position={[-0.12, 0.55, 0.05]}>
        <boxGeometry args={[0.26, 0.18, 0.04]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Sensitivity blue trimmer potentiometer */}
      <mesh position={[0.22, 0.55, 0.07]}>
        <boxGeometry args={[0.18, 0.18, 0.08]} />
        <meshStandardMaterial color="#1d65a6" roughness={0.4} />
      </mesh>
      {/* 4-Pin output header at top */}
      {[-0.24, -0.08, 0.08, 0.24].map((x, i) => (
        <HeaderPin key={i} position={[x, 0.76, 0]} isGold={true} />
      ))}
      {/* Dual fork prongs inserting into soil with gold contact traces */}
      {[-0.24, 0.24].map((x, i) => (
        <group key={i} position={[x, -0.25, 0]}>
          <mesh>
            <boxGeometry args={[0.2, 1.15, 0.04]} />
            <meshStandardMaterial {...MAT_PCB_BLACK} />
          </mesh>
          {/* Gold plated sensor strip */}
          <mesh position={[0, -0.05, 0.022]}>
            <boxGeometry args={[0.14, 0.95, 0.005]} />
            <meshStandardMaterial {...MAT_GOLD} />
          </mesh>
          {/* Pointed insertion tip */}
          <mesh position={[0, -0.65, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.1, 0.18, 3]} />
            <meshStandardMaterial {...MAT_PCB_BLACK} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function WaterLevelSensorModel() {
  // Narrow immersion PCB with parallel gold sensor traces
  return (
    <group position={[0, 0.35, 0]}>
      {/* Tall narrow immersion PCB */}
      <mesh>
        <boxGeometry args={[0.55, 1.55, 0.05]} />
        <meshStandardMaterial {...MAT_PCB_BLACK} />
      </mesh>
      {/* Top connector section */}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.58, 0.25, 0.06]} />
        <meshStandardMaterial {...MAT_PCB_BLACK} />
      </mesh>
      {/* 3-Pin header (S, +, -) */}
      {[-0.14, 0, 0.14].map((x, i) => (
        <HeaderPin key={i} position={[x, 0.78, 0]} isGold={true} />
      ))}
      {/* 10 Parallel exposed gold sensor traces running down the board */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-0.18 + i * 0.052, -0.1, 0.027]}>
          <boxGeometry args={[0.02, 1.05, 0.005]} />
          <meshStandardMaterial {...MAT_GOLD} />
        </mesh>
      ))}
    </group>
  );
}


export function FlameSensorModel() {
  // Flame Detection Sensor Module with Black Optical IR Bulb
  return (
    <group position={[0, 0.12, 0]}>
      {/* Blue breakout PCB */}
      <mesh>
        <boxGeometry args={[0.88, 0.45, 0.06]} />
        <meshStandardMaterial {...MAT_PCB_BLUE} />
      </mesh>
      {/* Black flame phototransistor receiver bulb extending forward */}
      <group position={[0, 0.35, 0]}>
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial color="#141118" roughness={0.2} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.16, 20]} />
          <meshStandardMaterial color="#141118" roughness={0.2} transparent opacity={0.9} />
        </mesh>
        <Lead position={[-0.08, -0.22, 0]} length={0.25} />
        <Lead position={[0.08, -0.22, 0]} length={0.25} />
      </group>
      {/* LM393 chip & sensitivity potentiometer */}
      <mesh position={[-0.18, -0.05, 0.05]}>
        <boxGeometry args={[0.25, 0.18, 0.04]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      <mesh position={[0.18, -0.05, 0.06]}>
        <boxGeometry args={[0.18, 0.18, 0.07]} />
        <meshStandardMaterial color="#1d65a6" />
      </mesh>
      {/* 4-Pin header on bottom */}
      {[-0.24, -0.08, 0.08, 0.24].map((x, i) => (
        <HeaderPin key={i} position={[x, -0.24, 0]} isGold={true} />
      ))}
    </group>
  );
}

export function LaserDiodeModel() {
  // Industrial Brass Collimated Laser Diode Module
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Solid turned brass barrel */}
      <mesh>
        <cylinderGeometry args={[0.28, 0.28, 0.95, 28]} />
        <meshStandardMaterial {...MAT_GOLD} roughness={0.28} />
      </mesh>
      {/* Knurled focus adjustment collar */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.295, 0.295, 0.2, 28]} />
        <meshStandardMaterial {...MAT_GOLD} roughness={0.45} />
      </mesh>
      {/* Front collimating glass optical lens */}
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 20]} />
        <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1.8} transparent opacity={0.8} />
      </mesh>
      {/* Intense ruby laser emitter core */}
      <mesh position={[0, 0.49, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ff0000" emissiveIntensity={3} />
      </mesh>
      {/* Red & Black insulated silicone power leads exiting rear */}
      <Lead position={[-0.08, -0.75, 0]} length={0.55} radius={0.03} />
      <Lead position={[0.08, -0.75, 0]} length={0.55} radius={0.03} />
    </group>
  );
}

export function IrLedModel() {
  // 5mm Infrared Emitter LED in deep transparent violet/black
  return (
    <group>
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.42, 28, 28, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
        <meshStandardMaterial color="#1e102d" emissive="#3d1466" emissiveIntensity={0.6} transparent opacity={0.88} roughness={0.15} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.28, 28]} />
        <meshStandardMaterial color="#1e102d" transparent opacity={0.88} roughness={0.15} />
      </mesh>
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.06, 28]} />
        <meshStandardMaterial color="#1e102d" transparent opacity={0.9} roughness={0.15} />
      </mesh>
      {/* Internal lead frame */}
      <mesh position={[-0.07, 0.05, 0]}>
        <boxGeometry args={[0.12, 0.2, 0.04]} />
        <meshStandardMaterial {...MAT_LEAD} />
      </mesh>
      <Lead position={[-0.14, -0.85, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.85} />
      <Lead position={[0.14, -1.0, 0]} rotation={[Math.PI / 2, 0, 0]} length={1.15} />
    </group>
  );
}

export function PhotodiodeModel() {
  // 5mm Clear Optical Photodiode with Large Silicon Sensor Chip
  return (
    <group>
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.42, 28, 28, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
        <meshStandardMaterial color="#e8eff5" transparent opacity={0.55} roughness={0.08} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.28, 28]} />
        <meshStandardMaterial color="#e8eff5" transparent opacity={0.55} roughness={0.08} />
      </mesh>
      {/* Large square silicon photo-sensor chip inside */}
      <mesh position={[0, 0.12, 0]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.22, 0.22, 0.03]} />
        <meshStandardMaterial color="#141822" roughness={0.2} metalness={0.7} />
      </mesh>
      <Lead position={[-0.14, -0.85, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.85} />
      <Lead position={[0.14, -1.0, 0]} rotation={[Math.PI / 2, 0, 0]} length={1.15} />
    </group>
  );
}

export function SolenoidModel() {
  // Push/Pull Linear Electromagnetic Solenoid Actuator
  return (
    <group>
      {/* Open C-frame steel housing */}
      <mesh>
        <boxGeometry args={[1.25, 0.72, 0.72]} />
        <meshStandardMaterial {...MAT_STEEL_DARK} />
      </mesh>
      {/* Visible heavy enameled copper wire coil winding */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.85, 28]} />
        <meshStandardMaterial {...MAT_COPPER} />
      </mesh>
      {/* Chrome sliding steel plunger piston shaft */}
      <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 1.1, 20]} />
        <meshStandardMaterial {...MAT_LEAD} />
      </mesh>
      {/* Return spring coils */}
      <mesh position={[0.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.13, 0.02, 10, 20]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      <Lead position={[-0.35, -0.48, 0]} length={0.35} />
      <Lead position={[0.35, -0.48, 0]} length={0.35} />
    </group>
  );
}

export function VibrationMotorModel() {
  // Coreless micro-motor with eccentric brass counterweight
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Cylindrical metal motor can */}
      <mesh>
        <cylinderGeometry args={[0.22, 0.22, 0.65, 24]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Output steel motor shaft */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.35, 12]} />
        <meshStandardMaterial {...MAT_LEAD} />
      </mesh>
      {/* Eccentric brass half-moon rotating counterweight */}
      <mesh position={[0.08, 0.48, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.22, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial {...MAT_GOLD} />
      </mesh>
      {/* Blue and red silicone lead wires */}
      <Lead position={[-0.08, -0.5, 0]} length={0.35} />
      <Lead position={[0.08, -0.5, 0]} length={0.35} />
    </group>
  );
}

export function NixieTubeModel() {
  // Vintage IN-12 / IN-14 Cold Cathode Neon Glow Discharge Tube
  return (
    <group>
      {/* Glass vacuum envelope with rounded dome top */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 1.05, 32]} />
        <meshStandardMaterial color="#eaf2f8" transparent opacity={0.38} roughness={0.06} />
      </mesh>
      <mesh position={[0, 0.64, 0]}>
        <sphereGeometry args={[0.44, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#eaf2f8" transparent opacity={0.38} roughness={0.06} />
      </mesh>
      {/* Fine wire mesh anode honeycombed cage inside */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.85, 24, 1, true]} />
        <meshStandardMaterial color="#6a7280" metalness={0.8} roughness={0.4} wireframe={true} />
      </mesh>
      {/* Glowing neon orange numeral "8" cathode filament */}
      <group position={[0, 0.2, 0]}>
        <mesh position={[0, 0.16, 0]}>
          <torusGeometry args={[0.13, 0.024, 12, 24]} />
          <meshStandardMaterial color="#ff7b25" emissive="#ff5500" emissiveIntensity={2.4} />
        </mesh>
        <mesh position={[0, -0.16, 0]}>
          <torusGeometry args={[0.15, 0.026, 12, 24]} />
          <meshStandardMaterial color="#ff7b25" emissive="#ff5500" emissiveIntensity={2.4} />
        </mesh>
        {/* Soft neon gas glow envelope */}
        <pointLight position={[0, 0, 0]} intensity={0.9} distance={1.2} color="#ff6600" />
      </group>
      {/* Dark ceramic base with 11 wire connector pins */}
      <mesh position={[0, -0.44, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.12, 28]} />
        <meshStandardMaterial color="#1a1c22" roughness={0.7} />
      </mesh>
      {[-0.26, -0.13, 0, 0.13, 0.26].map((x, i) => (
        <Lead key={i} position={[x, -0.65, 0]} length={0.32} />
      ))}
    </group>
  );
}

export function Lithium18650Model() {
  // Authentic 18650 Cylindrical Rechargeable Li-ion Cell
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* 18mm x 65mm turquoise / mint-green PVC heat-shrink jacket */}
      <mesh>
        <cylinderGeometry args={[0.38, 0.38, 1.45, 32]} />
        <meshStandardMaterial color="#1fa48a" roughness={0.35} />
      </mesh>
      {/* Top positive terminal with 4 radial gas pressure vents */}
      <mesh position={[0, 0.74, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.06, 24]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      <mesh position={[0, 0.715, 0]}>
        <ringGeometry args={[0.16, 0.34, 24]} rotation={[-Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#e0f2ee" roughness={0.5} />
      </mesh>
      {/* Flat nickel-plated steel negative terminal base */}
      <mesh position={[0, -0.73, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.02, 32]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Silkscreen labeling */}
      <mesh position={[0, 0, 0.385]}>
        <boxGeometry args={[0.18, 0.9, 0.005]} />
        <meshStandardMaterial color="#111318" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function PowerBankModel() {
  // Slim Portable USB Power Bank in Space Grey Anodized Aluminum
  return (
    <group>
      {/* Rounded rectangular aluminum chassis */}
      <mesh>
        <boxGeometry args={[1.45, 0.82, 0.36]} />
        <meshStandardMaterial {...MAT_STEEL_DARK} roughness={0.38} metalness={0.65} />
      </mesh>
      {/* Front port faceplate */}
      <mesh position={[0, 0, 0.182]}>
        <boxGeometry args={[1.38, 0.75, 0.01]} />
        <meshStandardMaterial color="#181a1f" roughness={0.5} />
      </mesh>
      {/* Dual USB-A output ports */}
      {[-0.38, 0.38].map((x, i) => (
        <group key={i} position={[x, 0, 0.185]}>
          <mesh>
            <boxGeometry args={[0.32, 0.16, 0.02]} />
            <meshStandardMaterial {...MAT_ALUMINUM} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.26, 0.1, 0.02]} />
            <meshStandardMaterial color="#111318" />
          </mesh>
        </group>
      ))}
      {/* Center USB-C input/output port */}
      <mesh position={[0, 0, 0.185]}>
        <boxGeometry args={[0.22, 0.1, 0.02]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* 4 LED power level indicator dots */}
      {[-0.15, -0.05, 0.05, 0.15].map((x, i) => (
        <mesh key={i} position={[x, 0.26, 0.188]}>
          <circleGeometry args={[0.02, 12]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.4} />
        </mesh>
      ))}
    </group>
  );
}


export function AccelerometerModel() {
  // MPU-6050 6-Axis MotionTracking Breakout Board
  return (
    <group position={[0, 0.06, 0]}>
      {/* Deep blue FR4 breakout PCB with gold mounting holes */}
      <mesh>
        <boxGeometry args={[1.1, 0.78, 0.06]} />
        <meshStandardMaterial {...MAT_PCB_BLUE} />
      </mesh>
      {/* Gold plated corner mounting hole */}
      <mesh position={[0.42, 0.26, 0.032]}>
        <ringGeometry args={[0.035, 0.07, 16]} rotation={[-Math.PI / 2, 0, 0]} />
        <meshStandardMaterial {...MAT_GOLD} />
      </mesh>
      {/* QFN-24 MEMS Motion Sensor IC in center */}
      <mesh position={[-0.05, 0.04, 0.045]}>
        <boxGeometry args={[0.32, 0.32, 0.05]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Pin 1 dot on sensor chip */}
      <mesh position={[-0.16, 0.15, 0.072]}>
        <circleGeometry args={[0.02, 10]} rotation={[-Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* LDO regulator & SMD decoupling caps */}
      <mesh position={[0.28, -0.15, 0.04]}>
        <boxGeometry args={[0.16, 0.1, 0.04]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* 8-Pin interface header along bottom (VCC, GND, SCL, SDA, XDA, XCL, AD0, INT) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <HeaderPin key={i} position={[-0.42 + i * 0.12, -0.32, 0]} isGold={true} />
      ))}
    </group>
  );
}

export function ArduinoUnoModel() {
  // Authentic Arduino Uno R3 Blue Board with DIP-28 socketed ATmega328P
  return (
    <group position={[0, 0.08, 0]}>
      {/* Classic Italian blue solder-mask PCB */}
      <mesh>
        <boxGeometry args={[2.1, 0.06, 1.55]} />
        <meshStandardMaterial color="#008184" roughness={0.55} />
      </mesh>
      {/* Large silver USB Type-B square receptacle */}
      <mesh position={[-0.92, 0.16, 0.42]}>
        <boxGeometry args={[0.42, 0.35, 0.4]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Black DC barrel jack for 9V/12V wall power */}
      <mesh position={[-0.92, 0.16, -0.48]}>
        <boxGeometry args={[0.48, 0.35, 0.36]} />
        <meshStandardMaterial color="#111318" roughness={0.7} />
      </mesh>
      {/* ATmega328P DIP-28 microcontroller chip mounted in socket */}
      <group position={[0.22, 0.1, -0.15]}>
        <mesh>
          <boxGeometry args={[1.2, 0.16, 0.38]} />
          <meshStandardMaterial {...MAT_EPOXY_BLACK} />
        </mesh>
        <mesh position={[0, 0.085, 0]}>
          <boxGeometry args={[0.8, 0.005, 0.18]} />
          <meshStandardMaterial color="#889098" roughness={0.6} />
        </mesh>
      </group>
      {/* 16MHz Quartz Crystal in silver HC-49 can */}
      <mesh position={[-0.22, 0.08, 0.05]}>
        <boxGeometry args={[0.3, 0.12, 0.14]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Tactile Reset Button in corner */}
      <mesh position={[-0.85, 0.08, 0.65]}>
        <boxGeometry args={[0.16, 0.1, 0.16]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Female pin header strips (Digital 0-13, Analog A0-A5, Power) */}
      <mesh position={[0.1, 0.12, 0.68]}>
        <boxGeometry args={[1.55, 0.24, 0.1]} />
        <meshStandardMaterial color="#1a1c22" />
      </mesh>
      <mesh position={[0.1, 0.12, -0.68]}>
        <boxGeometry args={[1.55, 0.24, 0.1]} />
        <meshStandardMaterial color="#1a1c22" />
      </mesh>
    </group>
  );
}

export function PiPicoModel() {
  // Raspberry Pi Pico RP2040 Microcontroller Board
  return (
    <group position={[0, 0.06, 0]}>
      {/* Signature green PCB with 40 castellated edge pads */}
      <mesh>
        <boxGeometry args={[1.75, 0.06, 0.72]} />
        <meshStandardMaterial {...MAT_PCB_GREEN} />
      </mesh>
      {/* RP2040 Dual-core Microcontroller chip in center */}
      <mesh position={[-0.1, 0.06, 0]}>
        <boxGeometry args={[0.3, 0.05, 0.3]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Micro-USB port on top edge */}
      <mesh position={[-0.88, 0.08, 0]}>
        <boxGeometry args={[0.22, 0.14, 0.28]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* White tactile BOOTSEL button */}
      <mesh position={[0.35, 0.08, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.06, 14]} />
        <meshStandardMaterial color="#f0f3f6" roughness={0.3} />
      </mesh>
      {/* Green on-board status LED */}
      <mesh position={[-0.55, 0.05, 0.18]}>
        <boxGeometry args={[0.04, 0.02, 0.04]} />
        <meshStandardMaterial color={COLOR_PREMIUM_GREEN} emissive={COLOR_PREMIUM_GREEN} emissiveIntensity={1.3} />
      </mesh>
    </group>
  );
}

export function VoltageRegulatorModel() {
  // TO-220 Package with laser marked "LM7805"
  return (
    <group>
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[0.92, 0.88, 0.28]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Stamped nickel heatsink tab with hole */}
      <mesh position={[0, 0.82, -0.08]}>
        <boxGeometry args={[0.92, 0.54, 0.08]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      <mesh position={[0, 0.86, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.1, 16]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
      {/* Laser marking "LM7805" */}
      <mesh position={[0, 0.22, 0.142]}>
        <boxGeometry args={[0.48, 0.14, 0.01]} />
        <meshStandardMaterial color="#a0a8b4" roughness={0.6} />
      </mesh>
      {/* 3 Stamped stepped leads (IN, GND, OUT) */}
      {[-0.28, 0, 0.28].map((x, i) => (
        <StampedPin key={i} position={[x, -0.3, 0]} length={0.7} />
      ))}
    </group>
  );
}

export function IcSocketModel() {
  // DIP IC Socket with dual-leaf contact holes
  const pins = 4;
  return (
    <group>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[1.65, 0.2, 0.75]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      {/* Center trough */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[1.45, 0.1, 0.25]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Pin 1 notch */}
      <mesh position={[-0.82, 0.12, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 16, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Solder pins below */}
      {[-0.28, 0.28].map((z, side) =>
        Array.from({ length: pins }).map((_, i) => (
          <mesh key={`${side}-${i}`} position={[-0.55 + i * 0.38, -0.16, z]}>
            <boxGeometry args={[0.04, 0.28, 0.03]} />
            <meshStandardMaterial {...MAT_LEAD} />
          </mesh>
        ))
      )}
    </group>
  );
}

export function LimitSwitchModel() {
  // Micro Limit Switch with Stainless Steel Roller Lever Arm
  return (
    <group>
      {/* Rectangular black case */}
      <mesh>
        <boxGeometry args={[1, 0.55, 0.45]} />
        <meshStandardMaterial color="#1c1e24" roughness={0.6} />
      </mesh>
      {/* Red actuator plunger */}
      <mesh position={[-0.28, 0.3, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 14]} />
        <meshStandardMaterial color="#ff3838" />
      </mesh>
      {/* Stainless steel roller lever arm */}
      <group position={[0.35, 0.24, 0]} rotation={[0, 0, 0.22]}>
        <mesh position={[-0.45, 0, 0]}>
          <boxGeometry args={[0.95, 0.03, 0.12]} />
          <meshStandardMaterial {...MAT_ALUMINUM} />
        </mesh>
        {/* Miniature roller wheel on end */}
        <mesh position={[-0.92, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
          <meshStandardMaterial color="#2d3238" roughness={0.4} />
        </mesh>
      </group>
      {/* 3 Spade lug terminals (COM, NO, NC) */}
      {[-0.32, 0, 0.32].map((x, i) => (
        <Lead key={i} position={[x, -0.45, 0]} length={0.4} />
      ))}
    </group>
  );
}

export function ReedSwitchModel() {
  // Hermetically Sealed Glass Magnetic Reed Switch
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Clear cylindrical glass tube capsule */}
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 0.95, 24]} />
        <meshStandardMaterial color="#d8e6f5" transparent opacity={0.42} roughness={0.06} />
      </mesh>
      {/* Two overlapping ferromagnetic nickel-iron contact reeds inside */}
      <mesh position={[0, -0.15, 0.02]}>
        <boxGeometry args={[0.05, 0.45, 0.015]} />
        <meshStandardMaterial {...MAT_LEAD} />
      </mesh>
      <mesh position={[0, 0.15, -0.02]}>
        <boxGeometry args={[0.05, 0.45, 0.015]} />
        <meshStandardMaterial {...MAT_LEAD} />
      </mesh>
      <Lead position={[0, -0.92, 0]} length={0.6} />
      <Lead position={[0, 0.92, 0]} length={0.6} />
    </group>
  );
}

export function LedStripModel() {
  // 3-LED Segment of 12V 5050 SMD RGB LED Strip
  return (
    <group>
      {/* Flexible white PCB ribbon tape */}
      <mesh>
        <boxGeometry args={[1.7, 0.03, 0.42]} />
        <meshStandardMaterial color="#f4f6f8" roughness={0.45} />
      </mesh>
      {/* 3 SMD 5050 RGB LED packages */}
      {[-0.52, 0, 0.52].map((x, i) => (
        <group key={i} position={[x, 0.03, 0]}>
          <mesh>
            <boxGeometry args={[0.26, 0.05, 0.26]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.026, 0]}>
            <circleGeometry args={[0.1, 16]} rotation={[-Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={COLOR_PREMIUM_GREEN} emissive={COLOR_PREMIUM_GREEN} emissiveIntensity={1.8} />
          </mesh>
        </group>
      ))}
      {/* SMD Resistors */}
      {[-0.26, 0.26].map((x, i) => (
        <mesh key={i} position={[x, 0.025, 0]}>
          <boxGeometry args={[0.1, 0.03, 0.06]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
      ))}
      {/* Copper solder contact cut pads on both ends (+12V, R, G, B) */}
      {[-0.8, 0.8].map((x, side) =>
        [-0.14, -0.05, 0.05, 0.14].map((z, pad) => (
          <mesh key={`${side}-${pad}`} position={[x, 0.018, z]}>
            <boxGeometry args={[0.07, 0.005, 0.05]} />
            <meshStandardMaterial {...MAT_COPPER} />
          </mesh>
        ))
      )}
    </group>
  );
}

export function PolyesterCapacitorModel() {
  // Green/Red "Green Cap" MKT Polyester Film Capacitor
  return (
    <group>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.75, 0.65, 0.32]} />
        <meshStandardMaterial color="#1f8b4c" roughness={0.35} />
      </mesh>
      {/* Stamped code "2A104J" */}
      <mesh position={[0, 0.12, 0.162]}>
        <boxGeometry args={[0.42, 0.12, 0.005]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.6} />
      </mesh>
      <Lead position={[-0.22, -0.48, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.65} />
      <Lead position={[0.22, -0.48, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.65} />
    </group>
  );
}

export function VaristorModel() {
  // Metal Oxide Varistor (MOV) Disc in Blue Epoxy
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.48, 0.48, 0.16, 28]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#1d65a6" roughness={0.6} />
      </mesh>
      {/* Marking text "14D471K" */}
      <mesh position={[0, 0.08, 0.085]}>
        <boxGeometry args={[0.34, 0.1, 0.01]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
      <Lead position={[-0.2, -0.65, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.7} />
      <Lead position={[0.2, -0.65, 0]} rotation={[Math.PI / 2, 0, 0]} length={0.7} />
    </group>
  );
}

export function RgbBarModel() {
  // 8-Segment Linear RGB LED Bargraph
  const count = 8;
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.5, 0.35, 0.45]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[-0.6 + i * 0.17, 0.178, 0]}>
          <boxGeometry args={[0.12, 0.015, 0.34]} />
          <meshStandardMaterial
            color={i < 4 ? COLOR_PREMIUM_GREEN : i < 6 ? "#FFD400" : "#ff3838"}
            emissive={i < 4 ? COLOR_PREMIUM_GREEN : i < 6 ? "#FFD400" : "#ff3838"}
            emissiveIntensity={1.3}
          />
        </mesh>
      ))}
    </group>
  );
}

export function ArduinoNanoModel() {
  const pinCount = 15;
  return (
    <group position={[0, 0.08, 0]}>
      {/* Blue FR4 PCB substrate */}
      <mesh>
        <boxGeometry args={[1.7, 0.05, 0.65]} />
        <meshStandardMaterial {...MAT_PCB_BLUE} />
      </mesh>
      {/* Mini-USB metal connector */}
      <mesh position={[-0.75, 0.08, 0]}>
        <boxGeometry args={[0.26, 0.14, 0.28]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      <mesh position={[-0.88, 0.08, 0]}>
        <boxGeometry args={[0.02, 0.08, 0.18]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
      {/* ATmega328P TQFP-32 surface-mount chip at 45 degree angle */}
      <mesh position={[-0.05, 0.045, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.28, 0.04, 0.28]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* ATmega328P Pin 1 dot */}
      <mesh position={[-0.15, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.02, 12]} />
        <meshStandardMaterial color="#9ea3aa" />
      </mesh>
      {/* 16MHz Crystal Resonator (silver can) */}
      <mesh position={[-0.42, 0.045, 0]}>
        <boxGeometry args={[0.18, 0.04, 0.1]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Reset Tactile Button */}
      <mesh position={[0.25, 0.045, 0]}>
        <boxGeometry args={[0.16, 0.04, 0.16]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      <mesh position={[0.25, 0.075, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.03, 16]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
      {/* 4 Miniature SMD LEDs (PWR, RX, TX, L) */}
      {[
        [-0.32, 0.2, "#2ecc71"],
        [-0.18, 0.2, "#f39c12"],
        [-0.04, 0.2, "#f39c12"],
        [0.1, 0.2, COLOR_PREMIUM_GREEN],
      ].map(([x, z, col], i) => (
        <mesh key={i} position={[x, 0.035, z]}>
          <boxGeometry args={[0.05, 0.02, 0.03]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.4} />
        </mesh>
      ))}
      {/* 2x3 ICSP Header Pins at right edge */}
      {[-0.06, 0.06].map((z, row) =>
        [-0.06, 0, 0.06].map((x, col) => (
          <HeaderPin key={`${row}-${col}`} position={[0.62 + x, 0.03, z]} isGold={true} />
        ))
      )}
      {/* Header Pins along both long edges (15 pins per edge) */}
      {[-0.26, 0.26].map((z, side) =>
        Array.from({ length: pinCount }).map((_, i) => (
          <mesh key={`${side}-${i}`} position={[-0.65 + i * 0.092, -0.15, z]}>
            <boxGeometry args={[0.03, 0.35, 0.03]} />
            <meshStandardMaterial {...MAT_GOLD} />
          </mesh>
        ))
      )}
      {/* Silkscreen text */}
      <mesh position={[0.28, 0.032, 0.18]}>
        <boxGeometry args={[0.25, 0.005, 0.08]} />
        <meshStandardMaterial {...MAT_SILKSCREEN} />
      </mesh>
    </group>
  );
}

export function ArduinoMegaModel() {
  return (
    <group position={[0, 0.08, 0]}>
      {/* Blue FR4 PCB substrate - elongated classic Mega form factor */}
      <mesh>
        <boxGeometry args={[2.7, 0.06, 1.45]} />
        <meshStandardMaterial {...MAT_PCB_BLUE} />
      </mesh>
      {/* Gold plated corner mounting holes */}
      {[[-1.25, -0.62], [1.25, -0.62], [-1.25, 0.62], [1.25, 0.62]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.032, z]}>
          <ringGeometry args={[0.05, 0.09, 16]} rotation={[-Math.PI / 2, 0, 0]} />
          <meshStandardMaterial {...MAT_GOLD} />
        </mesh>
      ))}
      {/* ATmega2560 large square TQFP-100 microcontroller */}
      <mesh position={[0.1, 0.055, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.48, 0.05, 0.48]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Laser marking on ATmega2560 */}
      <mesh position={[0.1, 0.082, 0]}>
        <boxGeometry args={[0.34, 0.005, 0.22]} />
        <meshStandardMaterial color="#888c94" roughness={0.6} />
      </mesh>
      {/* USB-B Port (Large silver metal connector) */}
      <mesh position={[-1.08, 0.2, 0.38]}>
        <boxGeometry args={[0.45, 0.34, 0.38]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      <mesh position={[-1.31, 0.2, 0.38]}>
        <boxGeometry args={[0.02, 0.18, 0.22]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
      {/* DC Barrel Jack */}
      <mesh position={[-1.08, 0.21, -0.42]}>
        <boxGeometry args={[0.48, 0.36, 0.36]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      <mesh position={[-1.33, 0.21, -0.42]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 20]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
      <mesh position={[-1.33, 0.21, -0.42]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.04, 16]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* HC-49 Crystal Resonator */}
      <mesh position={[-0.45, 0.07, 0.38]}>
        <boxGeometry args={[0.3, 0.08, 0.12]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      {/* Reset Push Button */}
      <mesh position={[-1.15, 0.08, 0]}>
        <boxGeometry args={[0.16, 0.1, 0.16]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      <mesh position={[-1.15, 0.14, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.04, 16]} />
        <meshStandardMaterial color="#ff3838" />
      </mesh>
      {/* Dual 18x2 Digital Female Header Bank on right edge (Pins 22-53) */}
      <mesh position={[1.18, 0.16, 0]}>
        <boxGeometry args={[0.22, 0.26, 1.15]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      {/* Top Female Header Strips */}
      <mesh position={[0.05, 0.16, 0.62]}>
        <boxGeometry args={[1.5, 0.26, 0.11]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      {/* Bottom Female Header Strips */}
      <mesh position={[0.05, 0.16, -0.62]}>
        <boxGeometry args={[1.5, 0.26, 0.11]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      {/* Status LEDs */}
      {[
        [-0.7, 0.04, 0.12, COLOR_PREMIUM_GREEN],
        [-0.55, 0.04, 0.12, "#f39c12"],
        [-0.4, 0.04, 0.12, "#f39c12"],
      ].map(([x, y, z, col], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.05, 0.02, 0.03]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.5} />
        </mesh>
      ))}
      {/* Silkscreen Logo */}
      <mesh position={[0.65, 0.032, 0]}>
        <boxGeometry args={[0.45, 0.005, 0.25]} />
        <meshStandardMaterial {...MAT_SILKSCREEN} />
      </mesh>
    </group>
  );
}

export function TeensyModel() {
  return (
    <group position={[0, 0.08, 0]}>
      {/* Matte black PCB substrate */}
      <mesh>
        <boxGeometry args={[1.35, 0.05, 0.62]} />
        <meshStandardMaterial {...MAT_PCB_BLACK} />
      </mesh>
      {/* Micro-USB port on left edge */}
      <mesh position={[-0.6, 0.07, 0]}>
        <boxGeometry args={[0.22, 0.13, 0.26]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      <mesh position={[-0.72, 0.07, 0]}>
        <boxGeometry args={[0.02, 0.07, 0.16]} />
        <meshStandardMaterial color="#111318" />
      </mesh>
      {/* NXP i.MX RT1062 ARM Cortex-M7 square processor */}
      <mesh position={[-0.05, 0.05, 0]}>
        <boxGeometry args={[0.38, 0.05, 0.38]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      <mesh position={[-0.05, 0.076, 0]}>
        <boxGeometry args={[0.26, 0.005, 0.26]} />
        <meshStandardMaterial color="#888c94" roughness={0.5} />
      </mesh>
      {/* Program tactile button */}
      <mesh position={[0.35, 0.05, 0]}>
        <boxGeometry args={[0.12, 0.05, 0.12]} />
        <meshStandardMaterial {...MAT_ALUMINUM} />
      </mesh>
      <mesh position={[0.35, 0.08, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Orange SMD LED */}
      <mesh position={[0.18, 0.035, 0.18]}>
        <boxGeometry args={[0.04, 0.02, 0.03]} />
        <meshStandardMaterial color="#f39c12" emissive="#f39c12" emissiveIntensity={1.6} />
      </mesh>
      {/* Gold plated perimeter contact pads (14 on each edge) */}
      {[-0.26, 0.26].map((z, side) =>
        Array.from({ length: 14 }).map((_, i) => (
          <mesh key={`${side}-${i}`} position={[-0.52 + i * 0.08, 0.03, z]}>
            <ringGeometry args={[0.02, 0.032, 14]} rotation={[-Math.PI / 2, 0, 0]} />
            <meshStandardMaterial {...MAT_GOLD} />
          </mesh>
        ))
      )}
      {/* Silkscreen text "Teensy 4.0" */}
      <mesh position={[-0.05, 0.03, 0.23]}>
        <boxGeometry args={[0.3, 0.005, 0.05]} />
        <meshStandardMaterial {...MAT_SILKSCREEN} />
      </mesh>
    </group>
  );
}

export function FerriteBeadModel() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Dark charcoal cylindrical ferrite core */}
      <mesh>
        <cylinderGeometry args={[0.17, 0.17, 0.54, 24]} />
        <meshStandardMaterial color="#2b2d32" roughness={0.42} metalness={0.65} />
      </mesh>
      {/* Rounded chamfers on end rings */}
      {[-0.27, 0.27].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.155, 0.016, 12, 24]} />
          <meshStandardMaterial color="#2b2d32" roughness={0.42} metalness={0.65} />
        </mesh>
      ))}
      {/* Straight through-lead tinned wire */}
      <Lead position={[0, 0, 0]} length={1.9} radius={0.025} />
    </group>
  );
}

export function TrimmerPotentiometerModel() {
  return (
    <group>
      {/* Bourns 3296 cobalt blue cermet rectangular box */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.76, 0.76, 0.38]} />
        <meshStandardMaterial color="#0057b7" roughness={0.4} />
      </mesh>
      {/* Top brass slotted adjustment screw */}
      <group position={[-0.18, 0.57, 0]}>
        <mesh>
          <cylinderGeometry args={[0.13, 0.13, 0.03, 20]} />
          <meshStandardMaterial {...MAT_GOLD} roughness={0.25} />
        </mesh>
        {/* Screwdriver slot */}
        <mesh position={[0, 0.016, 0]}>
          <boxGeometry args={[0.22, 0.008, 0.04]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      </group>
      {/* White silkscreen rotation arrow & "3296" label */}
      <mesh position={[0.08, 0.22, 0.192]}>
        <boxGeometry args={[0.42, 0.14, 0.005]} />
        <meshStandardMaterial {...MAT_SILKSCREEN} />
      </mesh>
      {/* 3 Staggered through-hole pins */}
      {[-0.22, 0, 0.22].map((x, i) => (
        <Lead key={i} position={[x, -0.42, (i % 2 === 0 ? -0.06 : 0.06)]} rotation={[Math.PI / 2, 0, 0]} length={0.65} />
      ))}
    </group>
  );
}

export function ZenerDiodeModel() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* DO-35 Translucent amber/orange glass envelope */}
      <mesh>
        <cylinderGeometry args={[0.16, 0.16, 0.62, 20]} />
        <meshPhysicalMaterial
          color="#d35400"
          roughness={0.08}
          transmission={0.82}
          thickness={0.25}
          ior={1.52}
          transparent
          opacity={0.88}
        />
      </mesh>
      {/* Internal copper slug & semiconductor die visible inside glass */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.35, 16]} />
        <meshStandardMaterial {...MAT_COPPER} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.06, 0.04, 0.06]} />
        <meshStandardMaterial {...MAT_GOLD} />
      </mesh>
      {/* Black cathode polarity ring on glass */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.165, 0.165, 0.1, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
      {/* Axial wire leads */}
      <Lead position={[0, -0.72, 0]} length={0.7} />
      <Lead position={[0, 0.72, 0]} length={0.7} />
    </group>
  );
}

export function SchottkyDiodeModel() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Heavy DO-201 molded black epoxy package */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 1.22, 24]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Brilliant silver cathode polarity band */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.305, 0.305, 0.15, 24]} />
        <meshStandardMaterial {...MAT_ALUMINUM} roughness={0.18} />
      </mesh>
      {/* Laser marking "1N5819" */}
      <mesh position={[0, -0.15, 0.302]}>
        <boxGeometry args={[0.12, 0.4, 0.01]} />
        <meshStandardMaterial color="#888c94" roughness={0.6} />
      </mesh>
      {/* Heavy gauge tinned copper axial leads */}
      <Lead position={[0, -1.02, 0]} length={0.8} radius={0.034} />
      <Lead position={[0, 1.02, 0]} length={0.8} radius={0.034} />
    </group>
  );
}

export function JumperWireModel() {
  return (
    <group>
      {/* Dupont connector black shrouds on each end */}
      {[-0.65, 0.65].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.14, 0.45, 0.14]} />
            <meshStandardMaterial color="#1c1d21" roughness={0.5} />
          </mesh>
          {/* Latch window */}
          <mesh position={[0, 0.12, 0.071]}>
            <boxGeometry args={[0.07, 0.12, 0.01]} />
            <meshStandardMaterial color="#0e0f12" />
          </mesh>
          {/* Square male pin tip */}
          <mesh position={[0, -0.22, 0]}>
            <boxGeometry args={[0.038, 0.28, 0.038]} />
            <meshStandardMaterial {...MAT_GOLD} />
          </mesh>
        </group>
      ))}
      {/* Flexible insulated arch wire */}
      <mesh position={[0, 0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.65, 0.04, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.35} />
      </mesh>
    </group>
  );
}

export function Atmega328Model() {
  const pinsPerSide = 14;
  return (
    <group>
      {/* Molded black epoxy DIP-28 body */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[2.55, 0.34, 0.82]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Pin 1 semicircular index notch on edge */}
      <mesh position={[-1.275, 0.09, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#111318" roughness={0.8} />
      </mesh>
      {/* Pin 1 circular dimple dot */}
      <mesh position={[-1.05, 0.235, -0.26]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.05, 14]} />
        <meshStandardMaterial color="#111318" roughness={0.8} />
      </mesh>
      {/* Laser etched text marking "ATMEGA328P-PU" */}
      <mesh position={[0.05, 0.235, 0]}>
        <boxGeometry args={[1.5, 0.01, 0.28]} />
        <meshStandardMaterial color="#8a8e96" roughness={0.7} />
      </mesh>
      {/* 28 Stamped through-hole pins */}
      {[-0.42, 0.42].map((z, side) =>
        Array.from({ length: pinsPerSide }).map((_, i) => (
          <group key={`${side}-${i}`} position={[-1.0 + i * 0.155, -0.05, z]}>
            <mesh position={[0, 0, side === 0 ? -0.06 : 0.06]}>
              <boxGeometry args={[0.07, 0.04, 0.12]} />
              <meshStandardMaterial {...MAT_LEAD} />
            </mesh>
            <mesh position={[0, -0.22, side === 0 ? -0.11 : 0.11]}>
              <boxGeometry args={[0.045, 0.38, 0.028]} />
              <meshStandardMaterial {...MAT_LEAD} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

export function LogicIcModel({ marking = "74HC08" }) {
  const pinsPerSide = 7;
  return (
    <group>
      {/* Molded black epoxy DIP-14 body */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.45, 0.32, 0.72]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Pin 1 semicircular notch */}
      <mesh position={[-0.725, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#111318" roughness={0.8} />
      </mesh>
      {/* Pin 1 dot */}
      <mesh position={[-0.52, 0.215, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.045, 14]} />
        <meshStandardMaterial color="#111318" roughness={0.8} />
      </mesh>
      {/* Laser etched text marking */}
      <mesh position={[0.05, 0.215, 0]}>
        <boxGeometry args={[0.65, 0.01, 0.22]} />
        <meshStandardMaterial color="#8a8e96" roughness={0.7} />
      </mesh>
      {/* 14 Stamped through-hole pins */}
      {[-0.37, 0.37].map((z, side) =>
        Array.from({ length: pinsPerSide }).map((_, i) => (
          <group key={`${side}-${i}`} position={[-0.52 + i * 0.175, -0.05, z]}>
            <mesh position={[0, 0, side === 0 ? -0.06 : 0.06]}>
              <boxGeometry args={[0.08, 0.04, 0.12]} />
              <meshStandardMaterial {...MAT_LEAD} />
            </mesh>
            <mesh position={[0, -0.22, side === 0 ? -0.11 : 0.11]}>
              <boxGeometry args={[0.05, 0.38, 0.03]} />
              <meshStandardMaterial {...MAT_LEAD} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

export function OpAmpModel() {
  return (
    <group>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.65, 0.32, 0.72]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      <mesh position={[-0.825, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#111318" roughness={0.8} />
      </mesh>
      <mesh position={[-0.6, 0.215, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.045, 14]} />
        <meshStandardMaterial color="#111318" roughness={0.8} />
      </mesh>
      {/* Laser etched text marking "LM358P" */}
      <mesh position={[0.05, 0.215, 0]}>
        <boxGeometry args={[0.7, 0.01, 0.22]} />
        <meshStandardMaterial color="#8a8e96" roughness={0.7} />
      </mesh>
      {[-0.37, 0.37].map((z, side) =>
        Array.from({ length: 4 }).map((_, i) => (
          <group key={`${side}-${i}`} position={[-0.55 + i * 0.38, -0.05, z]}>
            <mesh position={[0, 0, side === 0 ? -0.06 : 0.06]}>
              <boxGeometry args={[0.08, 0.04, 0.12]} />
              <meshStandardMaterial {...MAT_LEAD} />
            </mesh>
            <mesh position={[0, -0.22, side === 0 ? -0.11 : 0.11]}>
              <boxGeometry args={[0.05, 0.38, 0.03]} />
              <meshStandardMaterial {...MAT_LEAD} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

export function AdcIcModel() {
  const pinsPerSide = 8;
  return (
    <group>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.75, 0.32, 0.72]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      <mesh position={[-0.875, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#111318" roughness={0.8} />
      </mesh>
      <mesh position={[-0.65, 0.215, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.045, 14]} />
        <meshStandardMaterial color="#111318" roughness={0.8} />
      </mesh>
      {/* Laser etched text marking "MCP3008-I/P" */}
      <mesh position={[0.05, 0.215, 0]}>
        <boxGeometry args={[0.9, 0.01, 0.22]} />
        <meshStandardMaterial color="#8a8e96" roughness={0.7} />
      </mesh>
      {[-0.37, 0.37].map((z, side) =>
        Array.from({ length: pinsPerSide }).map((_, i) => (
          <group key={`${side}-${i}`} position={[-0.68 + i * 0.195, -0.05, z]}>
            <mesh position={[0, 0, side === 0 ? -0.06 : 0.06]}>
              <boxGeometry args={[0.08, 0.04, 0.12]} />
              <meshStandardMaterial {...MAT_LEAD} />
            </mesh>
            <mesh position={[0, -0.22, side === 0 ? -0.11 : 0.11]}>
              <boxGeometry args={[0.05, 0.38, 0.03]} />
              <meshStandardMaterial {...MAT_LEAD} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

export function EepromIcModel() {
  return (
    <group>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.65, 0.32, 0.72]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      <mesh position={[-0.825, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#111318" roughness={0.8} />
      </mesh>
      <mesh position={[-0.6, 0.215, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.045, 14]} />
        <meshStandardMaterial color="#111318" roughness={0.8} />
      </mesh>
      {/* Laser etched text marking "24LC256" */}
      <mesh position={[0.05, 0.215, 0]}>
        <boxGeometry args={[0.7, 0.01, 0.22]} />
        <meshStandardMaterial color="#8a8e96" roughness={0.7} />
      </mesh>
      {[-0.37, 0.37].map((z, side) =>
        Array.from({ length: 4 }).map((_, i) => (
          <group key={`${side}-${i}`} position={[-0.55 + i * 0.38, -0.05, z]}>
            <mesh position={[0, 0, side === 0 ? -0.06 : 0.06]}>
              <boxGeometry args={[0.08, 0.04, 0.12]} />
              <meshStandardMaterial {...MAT_LEAD} />
            </mesh>
            <mesh position={[0, -0.22, side === 0 ? -0.11 : 0.11]}>
              <boxGeometry args={[0.05, 0.38, 0.03]} />
              <meshStandardMaterial {...MAT_LEAD} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

export function TransistorPnpModel() {
  return (
    <group>
      <mesh position={[0, 0.18, 0.08]}>
        <cylinderGeometry args={[0.42, 0.42, 0.85, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      <mesh position={[0, 0.18, 0.07]}>
        <boxGeometry args={[0.84, 0.85, 0.03]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      <mesh position={[0, 0.6, 0.08]}>
        <cylinderGeometry args={[0.38, 0.42, 0.04, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial {...MAT_EPOXY_BLACK} />
      </mesh>
      {/* Laser etched text "2N3906 PNP" on flat front */}
      <mesh position={[0, 0.25, 0.09]}>
        <boxGeometry args={[0.42, 0.12, 0.01]} />
        <meshStandardMaterial color="#9ea3aa" roughness={0.7} />
      </mesh>
      {[-0.26, 0, 0.26].map((x, i) => (
        <Lead key={i} position={[x, -0.65, 0.06]} rotation={[Math.PI / 2, 0, 0]} length={0.8} />
      ))}
    </group>
  );
}



// ============================================================================
// MODEL REGISTRY (WITH EXACT ALIASES - NO WRONG MODEL)
// ============================================================================

export const MODEL_BY_TYPE = {
  // Passives
  resistor: ResistorModel,
  resistor_variable: TrimmerPotentiometerModel,
  trimmer_potentiometer: TrimmerPotentiometerModel,
  potentiometer: PotentiometerModel,
  capacitor_electrolytic: CapacitorElectrolyticModel,
  capacitor_ceramic: CapacitorCeramicModel,
  polyester_capacitor: PolyesterCapacitorModel,
  varistor: VaristorModel,
  inductor: InductorModel,
  ferrite_bead: FerriteBeadModel,
  fuse: FuseModel,
  wire: WireModel,
  jumper_wire: JumperWireModel,
  heat_sink: HeatSinkModel,
  terminal_block: TerminalBlockModel,
  breadboard: BreadboardModel,
  crystal_oscillator: CrystalOscillatorModel,

  // Actives / Semiconductors
  led: LedModel,
  rgb_led: RgbLedModel,
  ir_led: IrLedModel,
  laser_diode: LaserDiodeModel,
  diode: DiodeModel,
  zener_diode: ZenerDiodeModel,
  schottky_diode: SchottkyDiodeModel,
  bridge_rectifier: BridgeRectifierModel,
  transistor: TransistorModel,
  transistor_npn: TransistorModel,
  transistor_pnp: TransistorPnpModel,
  mosfet: MosfetModel,
  voltage_regulator: VoltageRegulatorModel,

  // Integrated Circuits
  ic_dip: IcDipModel,
  ic_socket: IcSocketModel,
  ic_555: IcDipModel,
  ic_opamp: OpAmpModel,
  microcontroller_atmega328: Atmega328Model,
  eeprom_ic: EepromIcModel,
  adc_ic: AdcIcModel,
  logic_and: LogicIcModel,
  logic_or: LogicIcModel,
  logic_xor: LogicIcModel,
  logic_nand: LogicIcModel,
  logic_nor: LogicIcModel,
  logic_not: LogicIcModel,
  flip_flop: LogicIcModel,

  // Power Sources
  battery_9v: Battery9vModel,
  battery_aa: BatteryAaModel,
  lithium_battery: Lithium18650Model,
  coin_cell: CoinCellModel,
  power_bank: PowerBankModel,
  solar_panel: SolarPanelModel,
  bench_psu: BenchPsuModel,
  bench_power_supply: BenchPsuModel,
  usb_power: UsbPowerModel,

  // Controls & Switches
  switch: SwitchModel,
  push_button: PushButtonModel,
  relay: RelayModel,
  dip_switch: DipSwitchModel,
  rocker_switch: RockerSwitchModel,
  slide_switch: SlideSwitchModel,
  limit_switch: LimitSwitchModel,
  reed_switch: ReedSwitchModel,

  // Sensors
  ldr: LdrModel,
  thermistor: ThermistorModel,
  photodiode: PhotodiodeModel,
  to92_sensor: To92SensorModel,
  temperature_sensor: To92SensorModel,
  hall_effect_sensor: To92SensorModel,
  ultrasonic_sensor: UltrasonicSensorModel,
  ir_sensor: IrSensorModel,
  pir_sensor: PirSensorModel,
  pir_motion_sensor: PirSensorModel,
  gas_sensor: GasSensorModel,
  humidity_sensor: HumiditySensorModel,
  touch_sensor: TouchSensorModel,
  soil_moisture_sensor: SoilMoistureSensorModel,
  flame_sensor: FlameSensorModel,
  water_level_sensor: WaterLevelSensorModel,
  accelerometer: AccelerometerModel,

  // Displays
  seven_segment: SevenSegmentModel,
  seven_segment_display: SevenSegmentModel,
  lcd_display: LcdDisplayModel,
  oled_display: OledDisplayModel,
  led_matrix: LedMatrixModel,
  rgb_led_display: RgbBarModel,
  nixie_tube: NixieTubeModel,

  // Outputs / Actuators
  buzzer: BuzzerModel,
  dc_motor: DcMotorModel,
  solenoid: SolenoidModel,
  vibration_motor: VibrationMotorModel,
  speaker: SpeakerModel,
  servo_motor: ServoMotorModel,
  stepper_motor: StepperMotorModel,
  fan: FanModel,
  led_strip: LedStripModel,

  // Boards
  dev_board: DevBoardModel,
  esp32: DevBoardModel,
  arduino_uno: ArduinoUnoModel,
  raspberry_pi_pico: PiPicoModel,
  pi_pico: PiPicoModel,
  arduino_nano: ArduinoNanoModel,
  arduino_mega: ArduinoMegaModel,
  teensy: TeensyModel,
};
