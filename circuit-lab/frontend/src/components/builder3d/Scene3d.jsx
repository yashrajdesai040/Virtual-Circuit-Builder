import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import PlacedPart3D from "./PlacedPart3D";
import Wire3D from "./Wire3D";

const BOARD_X_OFFSET = 0.85;
const BOARD_PIN_PITCH = 0.16;

function CameraCapture({ cameraRef }) {
  const { camera } = useThree();
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera, cameraRef]);
  return null;
}

export default function Scene3D({
  nodes,
  edges,
  draggingId,
  selectedNodeId,
  onSelectNode,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTerminalClick,
  onToggle,
  onOpenCode,
  selectedTerminal,
  onRemove,
  onRemoveWire,
  cameraRef,
  poweredIds,
  readings,
}) {
  function terminalWorldPos(nodeId, terminal) {
    const n = nodes.find((x) => x.id === nodeId);
    if (!n) return [0, 0.12, 0];

    // Multi-pin board (ESP32 etc) - mirror PlacedPart3D's pin layout math
    // so wires land exactly on the pin dot instead of the old fixed a/b spot.
    if (Array.isArray(n.pins) && n.pins.length > 0) {
      const pin = n.pins.find((p) => p.terminal === terminal);
      if (pin) {
        const col = n.pins.filter((p) => p.side === pin.side);
        const count = col.length;
        const idxInCol = pin.order ?? col.findIndex((p) => p.terminal === pin.terminal);
        const z = n.z + (idxInCol - (count - 1) / 2) * BOARD_PIN_PITCH;
        const x = n.x + (pin.side === "left" ? -BOARD_X_OFFSET : BOARD_X_OFFSET);
        return [x, 0.1, z];
      }
    }

    // Simple two-terminal parts - PlacedPart3D only ever renders "a" (left)
    // and "b" (right), so branch on both explicitly instead of treating
    // "anything that isn't a" as "b". That previous fallback silently put
    // BOTH terminals at the same spot for any unexpected terminal name,
    // drawing a zero-length wire that looked like a broken connection.
    if (terminal === "a") return [n.x - 0.55, 0.12, n.z];
    if (terminal === "b") return [n.x + 0.55, 0.12, n.z];

    console.warn(`terminalWorldPos: unrecognized terminal "${terminal}" on node ${nodeId}`);
    return [n.x, 0.12, n.z];
  }

  function handleGroundMove(e) {
    if (!draggingId) return;
    onDragMove(draggingId, e.point.x, e.point.z);
  }
  function handleGroundUp() {
    if (draggingId) onDragEnd();
  }

  return (
    <Canvas camera={{ position: [3.4, 3.6, 5], fov: 46 }} dpr={[1, 2]} shadows="soft">
      <color attach="background" args={["#07080C"]} />
      <fog attach="fog" args={["#07080C", 14, 32]} />

      {/* Base fill: raised ambient + cool sky / warm bounce */}
      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#FFFFFF", "#0E1017", 0.55]} />

      {/* key light - brighter, crisper shadows */}
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.35}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
      />
      {/* Platinum rim/fill from the opposite side */}
      <directionalLight position={[-4, 3, -3]} intensity={0.3} color="#E5E4E2" />
      <pointLight position={[0, 3, 0]} intensity={0.16} color="#FFFFFF" />

      {/* Procedural High-End Studio Softbox Environment for Workbench (100% offline, zero network requests) */}
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="rect" intensity={3.5} position={[0, 8, -6]} scale={[14, 6, 1]} color="#ffffff" />
          <Lightformer form="rect" intensity={1.8} position={[-6, 4, -2]} scale={[10, 4, 1]} color="#d8e6ff" />
          <Lightformer form="ring" intensity={2.2} position={[6, -2, 4]} scale={[8, 8, 1]} color="#FFFFFF" />
          <Lightformer form="rect" intensity={1.2} position={[0, -6, 0]} scale={[12, 12, 1]} color="#242830" />
        </group>
      </Environment>

      {/* corner accent lights */}
      <spotLight
        position={[5.5, 3.4, 5.5]}
        target-position={[0, 0, 0]}
        angle={0.58}
        penumbra={0.85}
        intensity={0.4}
        distance={17}
        color="#ffffff"
      />
      <spotLight
        position={[-5.5, 3.4, 5.5]}
        target-position={[0, 0, 0]}
        angle={0.58}
        penumbra={0.85}
        intensity={0.4}
        distance={17}
        color="#ffffff"
      />
      <spotLight
        position={[5.5, 3.4, -5.5]}
        target-position={[0, 0, 0]}
        angle={0.58}
        penumbra={0.85}
        intensity={0.3}
        distance={17}
        color="#dceeff"
      />
      <spotLight
        position={[-5.5, 3.4, -5.5]}
        target-position={[0, 0, 0]}
        angle={0.58}
        penumbra={0.85}
        intensity={0.3}
        distance={17}
        color="#dceeff"
      />

      <CameraCapture cameraRef={cameraRef} />

      {/* Dark obsidian workbench mat beneath everything */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[16, 48]} />
        <meshStandardMaterial color="#0A0B10" roughness={0.9} metalness={0.08} />
      </mesh>

      {/* Inset breadboard PCB working surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#0E1017" roughness={0.7} metalness={0.15} />
      </mesh>

      <Grid
        args={[12, 12]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#1E2330"
        sectionSize={2.5}
        sectionThickness={1.1}
        sectionColor="#E5E4E2"
        fadeDistance={14}
        fadeStrength={1.5}
        position={[0, 0.001, 0]}
      />

      {/* invisible floor - captures drag movement and background deselect */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={handleGroundMove}
        onPointerUp={handleGroundUp}
        onPointerLeave={handleGroundUp}
        onClick={() => {
          onSelectNode?.(null);
          if (selectedTerminal) {
            onTerminalClick?.(null, null);
          }
        }}
      >
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {nodes.map((n) => (
        <PlacedPart3D
          key={n.id}
          node={n}
          isDragging={draggingId === n.id}
          isSelected={selectedNodeId === n.id}
          onSelect={onSelectNode}
          onDragStart={onDragStart}
          onRemove={onRemove}
          onTerminalClick={onTerminalClick}
          onToggle={onToggle}
          onOpenCode={onOpenCode}
          powered={poweredIds ? poweredIds.has(n.id) : false}
          reading={readings ? readings[n.id] : null}
          isTerminalSelected={(id, t) =>
            selectedTerminal && selectedTerminal.nodeId === id && selectedTerminal.terminal === t
          }
        />
      ))}

      {edges.map((e) => {
        const isWirePowered = Array.isArray(poweredIds) && (poweredIds.includes(e.sourceId) || poweredIds.includes(e.targetId));
        return (
          <Wire3D
            key={e.id}
            id={e.id}
            start={terminalWorldPos(e.sourceId, e.sourceTerminal)}
            end={terminalWorldPos(e.targetId, e.targetTerminal)}
            color={e.color || (isWirePowered ? "#FFFFFF" : "#94A3B8")}
            onRemove={onRemoveWire}
          />
        );
      })}

      <ContactShadows position={[0, 0.008, 0]} opacity={0.4} scale={12} blur={2.2} far={4} />

      <OrbitControls
        makeDefault
        enabled={!draggingId}
        minDistance={2.2}
        maxDistance={16}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}