import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Contour Tide Component
 * An ocean of particles rolling in 3D contour waves.
 * Hardware-accelerated with Three.js BufferGeometry and GLSL Shaders.
 */
export default function ContourTide({
  particleCount = 120, // 120x120 = 14,400 points
  colorHigh = "#FFFFFF", // Crest / Ridge (Luminous Platinum White)
  colorMid = "#94A3B8",  // Mid-level (Titanium Silver Mist)
  colorLow = "#07080C",  // Trough / Deep (Obsidian Void)
  waveSpeed = 1.05,
  waveHeight = 9.2,
  opacity = 0.88,
  className = "",
  style,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Perspective Camera tilted to view the ocean waves
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, -95, 75);
    camera.lookAt(0, 25, 0);

    // 2. WebGL Renderer with Alpha
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.pointerEvents = "none";
    container.appendChild(renderer.domElement);

    // 3. Point Grid Geometry
    const cols = particleCount;
    const rows = particleCount;
    const numPoints = cols * rows;
    const positions = new Float32Array(numPoints * 3);
    const uvs = new Float32Array(numPoints * 2);

    const gridWidth = 240;
    const gridDepth = 240;

    let index = 0;
    for (let i = 0; i < cols; i++) {
      const x = (i / (cols - 1) - 0.5) * gridWidth;
      for (let j = 0; j < rows; j++) {
        const y = (j / (rows - 1) - 0.5) * gridDepth;
        positions[index * 3] = x;
        positions[index * 3 + 1] = y;
        positions[index * 3 + 2] = 0;

        uvs[index * 2] = i / cols;
        uvs[index * 2 + 1] = j / rows;
        index++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    // 4. Custom GLSL Shader Material for Contour Tide
    const hexToVec3 = (hex) => {
      const c = new THREE.Color(hex);
      return new THREE.Vector3(c.r, c.g, c.b);
    };

    const uniforms = {
      uTime: { value: 0 },
      uWaveSpeed: { value: waveSpeed },
      uWaveHeight: { value: waveHeight },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uColorHigh: { value: hexToVec3(colorHigh) },
      uColorMid: { value: hexToVec3(colorMid) },
      uColorLow: { value: hexToVec3(colorLow) },
      uOpacity: { value: opacity },
    };

    const vertexShader = `
      uniform float uTime;
      uniform float uWaveSpeed;
      uniform float uWaveHeight;
      uniform vec2 uMouse;
      uniform float uPixelRatio;
      varying float vElevation;
      varying vec2 vUv;
      varying float vDepth;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Multiscale organic oceanic wave superposition
        float wave1 = sin(pos.x * 0.052 + uTime * uWaveSpeed * 0.95) * 
                      cos(pos.y * 0.052 + uTime * uWaveSpeed * 0.72) * uWaveHeight;
        float wave2 = sin(pos.x * 0.026 - uTime * uWaveSpeed * 0.48 + pos.y * 0.034) * (uWaveHeight * 0.58);
        float wave3 = cos((pos.x + pos.y) * 0.038 + uTime * uWaveSpeed * 0.6) * (uWaveHeight * 0.32);
        
        // Interactive mouse swell ripple
        float distToMouse = length(pos.xy - uMouse * 88.0);
        float mouseRipple = exp(-distToMouse * 0.035) * sin(distToMouse * 0.18 - uTime * 3.2) * 5.0;

        pos.z = wave1 + wave2 + wave3 + mouseRipple;
        vElevation = pos.z;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vDepth = -mvPosition.z;

        float pointScale = (22.0 / -mvPosition.z) * (1.0 + (pos.z + uWaveHeight) * 0.045);
        gl_PointSize = clamp(pointScale * uPixelRatio, 1.8, 12.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform vec3 uColorHigh;
      uniform vec3 uColorMid;
      uniform vec3 uColorLow;
      uniform float uOpacity;
      varying float vElevation;
      varying vec2 vUv;
      varying float vDepth;

      void main() {
        // High-precision radial particle disk with soft bloom
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;
        float soft = smoothstep(0.5, 0.04, dist);
        float core = smoothstep(0.18, 0.0, dist) * 0.55;

        // 3-stop liquid platinum elevation contour gradient
        float t = clamp((vElevation + 10.0) / 22.0, 0.0, 1.0);
        vec3 color = mix(uColorLow, uColorMid, smoothstep(0.0, 0.46, t));
        color = mix(color, uColorHigh, smoothstep(0.46, 0.95, t));
        color += vec3(core); // Luminous metallic specular gleam

        // Atmospheric depth fog (fades horizon seamlessly into pure void black)
        float fog = smoothstep(180.0, 40.0, vDepth);

        // Edge vignette fade
        float edgeAlpha = smoothstep(0.0, 0.16, vUv.x) * smoothstep(1.0, 0.84, vUv.x) *
                          smoothstep(0.0, 0.16, vUv.y) * smoothstep(1.0, 0.84, vUv.y);

        gl_FragColor = vec4(color, (soft + core * 0.5) * uOpacity * edgeAlpha * fog);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 5. Pointer Tracking with Smooth Inertia
    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      targetMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // 6. Responsive Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // 7. Render Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      uniforms.uTime.value += delta;

      // Smooth mouse interpolation
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.06;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.06;
      uniforms.uMouse.value.set(currentMouse.x, currentMouse.y);

      // Subtle gentle camera sway
      camera.position.x = currentMouse.x * 12;
      camera.position.y = -95 + currentMouse.y * 6;
      camera.lookAt(0, 20, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [particleCount, colorHigh, colorMid, colorLow, waveSpeed, waveHeight, opacity]);

  return (
    <div
      ref={containerRef}
      className={`contour-tide-container ${className}`}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
