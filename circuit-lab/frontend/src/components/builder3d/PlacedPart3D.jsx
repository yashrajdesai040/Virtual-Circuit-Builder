import { useState } from "react";
import { Html } from "@react-three/drei";
import { MODEL_BY_TYPE } from "../3d/PartModels";
import { CATEGORY_COLOR } from "../../constants/categoryColors";
import soundFX from "../../utils/soundEffects";

const SCALE = 0.34;
const TERMINAL_OFFSET = 0.55;

// Boards (ESP32 etc) have many pins laid out in two columns instead of the
// simple left/right pair every other part uses.
const BOARD_X_OFFSET = 0.85;
const BOARD_PIN_PITCH = 0.16;

const PIN_ROLE_COLOR = {
  power: "#ff4757",
  ground: "#4a4a4a",
  gpio: "#45d8c4",
};

// Parts where terminal order actually matters in real life. Terminal "a"
// (left) is treated as positive/anode, "b" (right) as negative/cathode -
// matches real red/black wire convention and gives a visual +/- marker.
const POLARIZED_KEYS = new Set([
  "battery_9v",
  "battery_aa",
  "solar_panel",
  "led",
  "capacitor_electrolytic",
  "coin_cell",
  "bench_power_supply",
  "usb_power",
  "rgb_led",
  "lithium_battery",
  "power_bank",
]);

const TOGGLE_KEYS = new Set(["switch", "dip_switch", "rocker_switch", "slide_switch", "limit_switch", "reed_switch"]);

export default function PlacedPart3D({
  node,
  isDragging,
  isSelected,
  onSelect,
  onDragStart,
  onRemove,
  onTerminalClick,
  onToggle,
  onOpenCode,
  isTerminalSelected,
  powered,
  reading,
}) {
  const [hovered, setHovered] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const Model = (node.key && MODEL_BY_TYPE[node.key]) || MODEL_BY_TYPE[node.modelType];
  const accent = CATEGORY_COLOR[node.category] || "#45d8c4";
  const lifted = hovered || isDragging;
  const isLed = node.key === "led";
  const isPolarized = POLARIZED_KEYS.has(node.key);
  const isToggleable = TOGGLE_KEYS.has(node.key);
  const isOn = node.on !== false; // default on
  const ringColor = isSelected ? "var(--primary)" : powered ? "var(--color-accent)" : accent;
  const ringOpacity = isSelected ? 0.9 : powered ? 0.75 : lifted ? 0.35 : isToggleable && !isOn ? 0.04 : 0.09;
  const labelColor = powered ? "var(--text)" : accent;

  // Multi-pin board (ESP32 etc) - pins were copied onto the node at drop
  // time from the catalog component's spec.pins. Everything else keeps the
  // original simple two-terminal a/b layout.
  const hasBoardPins = Array.isArray(node.pins) && node.pins.length > 0;
  const isCodeable = node.category === "board" && typeof onOpenCode === "function";

  return (
    <group position={[node.x, 0, node.z]}>
      {/* soft colored ring on the floor - grounds the part, brightens on hover/drag/power, dims when a switch is off */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[hasBoardPins ? 0.95 : 0.58, hasBoardPins ? 1.03 : 0.66, 32]} />
        <meshBasicMaterial color={ringColor} transparent opacity={ringOpacity} />
      </mesh>

      {/* Always-on, low-intensity fill light so every part reads clearly even
          unpowered - previously parts with no power state sat completely flat. */}
      <pointLight position={[0, 0.85, 0]} intensity={0.18} distance={1.4} color="#cfe8ff" />

      {/* a lit LED gets its own warm glow lighting the area around it */}
      {powered && isLed && <pointLight position={[0, 0.9, 0]} intensity={1.5} distance={2.4} color="#ff5555" />}
      {powered && !isLed && <pointLight position={[0, 0.7, 0]} intensity={0.45} distance={1.8} color="#FFFFFF" />}

      {/* invisible drag handle beneath the part - also toggles switches on
          click, and toggles the name label on double-click (same for every
          part, boards included - opening a board's code editor is done from
          the </> button inside the open label, not from the double-click itself) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelect?.(node.id);
          onDragStart(node.id);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(node.id);
          if (isToggleable) {
            soundFX.playSwitch();
            onToggle(node.id);
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setLabelOpen((o) => !o);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <circleGeometry args={[hasBoardPins ? 1.1 : 0.72, 24]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <group scale={SCALE} position={[0, lifted ? 0.46 : 0.35, 0]}>
        {Model && <Model lit={isLed ? powered : undefined} on={isToggleable ? isOn : undefined} />}
      </group>

      {/* terminals */}
      {hasBoardPins
        ? node.pins.map((pin) => {
            const selected = isTerminalSelected(node.id, pin.terminal);
            const col = pin.side === "left" ? node.pins.filter((p) => p.side === "left") : node.pins.filter((p) => p.side === "right");
            const count = col.length;
            const idxInCol = pin.order ?? col.findIndex((p) => p.terminal === pin.terminal);
            const zPos = (idxInCol - (count - 1) / 2) * BOARD_PIN_PITCH;
            const xPos = pin.side === "left" ? -BOARD_X_OFFSET : BOARD_X_OFFSET;
            const termColor = PIN_ROLE_COLOR[pin.role] || accent;
            const pos = [xPos, 0.1, zPos];
            const showLabel = selected;
            return (
              <group key={pin.terminal}>
                <mesh
                  position={pos}
                  onPointerDown={(e) => {
                    // Without this, the pointerdown bubbles to the drag-handle
                    // disc beneath the part (it's inside that disc's radius)
                    // and starts dragging the whole part instead of letting
                    // the click below register as a terminal pick.
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFX.playWireConnect();
                    onTerminalClick(node.id, pin.terminal);
                  }}
                  onPointerOver={(e) => e.stopPropagation()}
                >
                  <sphereGeometry args={[0.05, 12, 12]} />
                  <meshStandardMaterial
                    color={selected ? "#ffffff" : termColor}
                    emissive={termColor}
                    emissiveIntensity={selected ? 1.6 : 0.4}
                  />
                </mesh>
                {showLabel && (
                  <Html position={[pos[0] + (pin.side === "left" ? -0.16 : 0.16), pos[1], pos[2]]} center distanceFactor={12} occlude>
                    <span className="part3d-pin-label" style={{ color: termColor }}>
                      {pin.label}
                    </span>
                  </Html>
                )}
              </group>
            );
          })
        : ["a", "b"].map((t, i) => {
            const selected = isTerminalSelected(node.id, t);
            const isPositive = t === "a";
            const termColor = isPolarized ? (isPositive ? "#ff4757" : "#4a90e2") : accent;
            const pos = [i === 0 ? -TERMINAL_OFFSET : TERMINAL_OFFSET, 0.12, 0];
            return (
              <group key={t}>
                <mesh
                  position={pos}
                  onPointerDown={(e) => {
                    // Same fix as the board-pin terminals above: keep the
                    // drag handle from intercepting a terminal click.
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFX.playWireConnect();
                    onTerminalClick(node.id, t);
                  }}
                >
                  <sphereGeometry args={[0.078, 16, 16]} />
                  <meshStandardMaterial
                    color={selected ? "#ffffff" : termColor}
                    emissive={termColor}
                    emissiveIntensity={selected ? 1.6 : 0.5}
                  />
                </mesh>
                {isPolarized && (
                  <Html position={[pos[0], pos[1] + 0.22, pos[2]]} center distanceFactor={10} occlude>
                    <span className="part3d-polarity" style={{ color: termColor }}>
                      {isPositive ? "+" : "−"}
                    </span>
                  </Html>
                )}
              </group>
            );
          })}

      {/* Small persistent "open code" badge for boards - stays available even
          with the label closed, since double-click no longer opens code
          directly. Styled with an explicit color, not left to external CSS. */}
      {isCodeable && !labelOpen && (
        <Html position={[0, 1.15, 0]} center distanceFactor={8} occlude>
          <button
            className="part3d-code-badge"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCode(node.id);
            }}
            title={`Edit code for ${node.name}`}
            style={{ color: labelColor, borderColor: labelColor }}
          >
            {"</>"}
          </button>
        </Html>
      )}

      {/* Quick hover badge showing part name on hover */}
      {hovered && !labelOpen && (
        <Html position={[0, 0.95, 0]} center distanceFactor={9} occlude>
          <div className="part3d-hover-tag">
            <span>{node.name}</span>
          </div>
        </Html>
      )}

      {labelOpen && (
        <Html position={[0, 1.15, 0]} center distanceFactor={8} occlude>
          <div
            className="part3d-label"
            style={{ borderColor: powered ? "rgba(255, 255, 255, 0.4)" : accent }}
          >
            <span className="part3d-label-dot" style={{ background: powered ? "var(--primary)" : accent }} />
            <div className="part3d-label-text">
              <span className="part3d-label-name" style={{ color: labelColor }}>
                {node.name}
              </span>
              {reading && reading.state === "on" ? (
                <span className="part3d-label-value" style={{ color: "var(--text)" }}>
                  {reading.voltage.toFixed(2)}V · {reading.current_mA.toFixed(1)}mA
                </span>
              ) : (
                node.unit && (
                  <span className="part3d-label-value" style={{ color: "var(--text-faint, #6c7a85)" }}>
                    {node.default_value} {node.unit}
                  </span>
                )
              )}
            </div>
            {isCodeable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCode(node.id);
                }}
                title="Edit code"
                style={{ marginRight: 2, color: labelColor }}
              >
                {"</>"}
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(node.id);
              }}
              title="Remove"
            >
              ×
            </button>
          </div>
          {isToggleable && (
            <button
              className="part3d-toggle"
              style={{ background: isOn ? "#22C55E" : "#ff4757" }}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(node.id);
              }}
            >
              {isOn ? "ON" : "OFF"}
            </button>
          )}
        </Html>
      )}
    </group>
  );
}