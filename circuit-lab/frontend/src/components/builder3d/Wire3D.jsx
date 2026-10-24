import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import soundFX from "../../utils/soundEffects";

export default function Wire3D({ id, start, end, color = "#94A3B8", onRemove }) {
  const lineRef = useRef();
  const [hovered, setHovered] = useState(false);

  const { mid, curve, points } = useMemo(() => {
    const m = [
      (start[0] + end[0]) / 2,
      Math.max(start[1], end[1]) + 0.35,
      (start[2] + end[2]) / 2,
    ];
    const c = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...m),
      new THREE.Vector3(...end)
    );
    const p = c.getPoints(24);
    return { mid: m, curve: c, points: p };
  }, [start[0], start[1], start[2], end[0], end[1], end[2]]);

  // animate the dash pattern sliding along the wire - reads as current flowing
  useFrame((_, delta) => {
    if (lineRef.current?.material) {
      lineRef.current.material.dashOffset -= delta * 1.4;
    }
  });

  const wireColor = hovered ? "#ff4757" : color;

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (onRemove && id) {
          soundFX.playWireCut();
          onRemove(id);
        }
      }}
    >
      <Line
        ref={lineRef}
        points={points}
        color={wireColor}
        lineWidth={hovered ? 3.8 : 2.2}
        dashed
        dashSize={0.12}
        gapSize={0.08}
      />

      {/* Invisible wider tube around the wire to make raycasting and clicking reliable */}
      <mesh>
        <tubeGeometry args={[curve, 16, 0.08, 6, false]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Platinum rhodium terminal ferrules at wire connection ends */}
      <mesh position={start}>
        <sphereGeometry args={[0.042, 12, 12]} />
        <meshStandardMaterial color="#E5E4E2" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[0.042, 12, 12]} />
        <meshStandardMaterial color="#E5E4E2" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Hover disconnect cut indicator at midpoint */}
      {hovered && (
        <mesh position={mid}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial color="#ff4757" emissive="#ff4757" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  );
}
