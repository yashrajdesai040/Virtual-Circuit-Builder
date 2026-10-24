import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Float } from "@react-three/drei";
import { MODEL_BY_TYPE } from "./PartModels";
import soundFX from "../../utils/soundEffects";
import { PlayIcon, PauseIcon, FloatIcon, GroundIcon } from "../icons/PremiumIcons";

export default function PartViewer({ modelType, partKey, eraTint = null }) {
  const Model = (partKey && MODEL_BY_TYPE[partKey]) || MODEL_BY_TYPE[modelType];
  const bgColor = eraTint || "#0e0e0e";
  const controlsRef = useRef();

  const [autoRotate, setAutoRotate] = useState(true);
  const [floating, setFloating] = useState(false);
  const [wireframe, setWireframe] = useState(false);

  function handleResetCamera() {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        camera={{ position: [1.65, 1.15, 1.85], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      >
        <color attach="background" args={[bgColor]} />

        {/* Studio Lighting System */}
        <ambientLight intensity={eraTint ? 0.85 : 0.65} />
        <directionalLight position={[3.5, 5, 2.5]} intensity={1.5} castShadow />
        <directionalLight
          position={[-3.5, 2, -2.5]}
          intensity={eraTint ? 0.9 : 0.6}
          color={eraTint || "#FFD400"}
        />
        <pointLight position={[0, -0.6, 0]} intensity={0.5} color="#cfe8ff" />
        <pointLight position={[0, 2.5, 0]} intensity={0.4} color="#ffffff" />

        {/* Procedural High-End Studio Softbox Environment (100% offline, zero network requests) */}
        <Environment resolution={256}>
          <group rotation={[-Math.PI / 3, 0, 1]}>
            {/* Main key softbox */}
            <Lightformer form="rect" intensity={3.8} position={[0, 6, -6]} scale={[12, 6, 1]} color="#ffffff" />
            {/* Cool fill softbox on opposite side */}
            <Lightformer form="rect" intensity={2} position={[-6, 2, -2]} scale={[8, 3, 1]} color="#d8e6ff" />
            {/* Accent rim ring */}
            <Lightformer form="ring" intensity={2.8} position={[6, -2, 4]} scale={[6, 6, 1]} color={eraTint || "#FFD400"} />
            {/* Floor bounce lightformer */}
            <Lightformer form="rect" intensity={1.2} position={[0, -5, 0]} scale={[10, 10, 1]} color="#242830" />
          </group>
        </Environment>

        <Suspense fallback={null}>
          {floating ? (
            <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
              <group position={[0, 0, 0]}>
                {Model ? <Model lit={true} on={true} wireframe={wireframe} /> : null}
              </group>
            </Float>
          ) : (
            <group position={[0, 0, 0]}>
              {Model ? <Model lit={true} on={true} wireframe={wireframe} /> : null}
            </group>
          )}

          {/* Precision Studio Turntable Pedestal (Horizontal floor disc, hidden in Floating mode) */}
          {!floating && (
            <group position={[0, -0.72, 0]}>
              {/* Outer beveled base ring - naturally Y-axis aligned (flat on ground, no vertical rotation) */}
              <mesh position={[0, -0.03, 0]}>
                <cylinderGeometry args={[1.5, 1.56, 0.06, 64]} />
                <meshStandardMaterial color="#141414" roughness={0.8} metalness={0.2} />
              </mesh>
              {/* Inner turntable disc */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
                <circleGeometry args={[1.48, 64]} />
                <meshStandardMaterial color="#1c1c1c" roughness={0.65} metalness={0.15} />
              </mesh>
              {/* Era / Brand Accent Perimeter Ring */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
                <ringGeometry args={[1.42, 1.46, 64]} />
                <meshBasicMaterial color={eraTint || "#6D712E"} transparent opacity={0.65} />
              </mesh>
              {/* Concentric alignment micro-groove */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
                <ringGeometry args={[0.75, 0.77, 48]} />
                <meshBasicMaterial color="#333333" transparent opacity={0.4} />
              </mesh>
            </group>
          )}

          {/* Soft Ground Contact Shadow */}
          <ContactShadows position={[0, -0.71, 0]} opacity={0.55} scale={3.8} blur={2.2} far={1.5} />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.06}
          minDistance={1.2}
          maxDistance={4.5}
          autoRotate={autoRotate}
          autoRotateSpeed={1.4}
        />
      </Canvas>

      {/* Modern Studio Control HUD (Overlaid at bottom of 3D Canvas) */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          right: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        {/* Left tool pills */}
        <div style={{ display: "flex", gap: 6, pointerEvents: "auto" }}>
          <button
            onClick={() => {
              soundFX.playSwitch();
              setAutoRotate((r) => !r);
            }}
            style={{
              padding: "4px 9px",
              borderRadius: "var(--radius-full)",
              background: autoRotate ? "rgba(109, 113, 46, 0.25)" : "rgba(20, 20, 20, 0.8)",
              border: `1px solid ${autoRotate ? "#6D712E" : "var(--color-line)"}`,
              color: autoRotate ? "var(--color-paper)" : "var(--text-dim)",
              fontSize: 10.5,
              fontFamily: "var(--font-display)",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.15s ease",
            }}
            title={autoRotate ? "Pause 360° Turntable" : "Start 360° Turntable"}
          >
            <span>{autoRotate ? <PauseIcon size={11} color="currentColor" strokeWidth={3} /> : <PlayIcon size={11} color="currentColor" />}</span>
            <span>{autoRotate ? "Orbiting" : "Paused"}</span>
          </button>

          <button
            onClick={() => {
              soundFX.playSwitch();
              setFloating((f) => !f);
            }}
            style={{
              padding: "4px 9px",
              borderRadius: "var(--radius-full)",
              background: floating ? "rgba(255, 255, 255, 0.12)" : "rgba(20, 20, 20, 0.8)",
              border: `1px solid ${floating ? "var(--color-accent)" : "var(--color-line)"}`,
              color: floating ? "var(--color-accent)" : "var(--text-dim)",
              fontSize: 10.5,
              fontFamily: "var(--font-display)",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.15s ease",
            }}
            title="Toggle zero-gravity floating inspection"
          >
            <span>{floating ? <FloatIcon size={11} color="currentColor" /> : <GroundIcon size={11} color="currentColor" />}</span>
            <span>{floating ? "Floating" : "Pedestal"}</span>
          </button>
        </div>

        {/* Right action button */}
        <button
          onClick={() => {
            soundFX.playBlip(750);
            handleResetCamera();
          }}
          style={{
            padding: "4px 10px",
            borderRadius: "var(--radius-full)",
            background: "rgba(20, 20, 20, 0.8)",
            border: "1px solid var(--color-line)",
            color: "var(--text-dim)",
            fontSize: 10.5,
            fontFamily: "var(--font-display)",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            pointerEvents: "auto",
            transition: "all 0.15s ease",
          }}
          title="Reset Camera Angle to Default"
        >
          <span>↺ Reset Angle</span>
        </button>
      </div>
    </div>
  );
}
