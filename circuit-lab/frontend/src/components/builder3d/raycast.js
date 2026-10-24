import * as THREE from "three";

const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ndc = new THREE.Vector2();
const point = new THREE.Vector3();

// Converts a screen-space drop point (clientX/Y) into a world-space
// {x, z} coordinate on the ground plane, using the live camera from the
// R3F scene. Used because native HTML5 drag/drop only gives us 2D screen
// coordinates, but parts need to land on the 3D floor.
export function screenToGround(clientX, clientY, rect, camera) {
  ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  raycaster.ray.intersectPlane(groundPlane, point);
  return { x: point.x, z: point.z };
}