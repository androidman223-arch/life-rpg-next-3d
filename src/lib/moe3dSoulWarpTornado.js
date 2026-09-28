import * as THREE from "three";

/** ワープ直前のグルグル竜巻 */
export function createMoeSoulWarpTornado(scene) {
  const g = new THREE.Group();
  g.name = "soul-warp-tornado";
  g.visible = false;
  /** @type {THREE.Mesh[]} */
  const rings = [];
  for (let i = 0; i < 5; i++) {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.5 + i * 0.42, 0.065, 8, 24),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x9ad7ff : 0xe8fbff,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
      })
    );
    mesh.rotation.x = Math.PI / 2;
    g.add(mesh);
    rings.push(mesh);
  }
  scene.add(g);
  let spin = 0;

  return {
    /**
     * @param {boolean} active
     * @param {number} x
     * @param {number} groundY
     * @param {number} z
     * @param {number} dt
     */
    update(active, x, groundY, z, dt) {
      g.visible = active;
      if (!active) return;
      spin += dt * 7.5;
      g.position.set(x, groundY, z);
      rings.forEach((mesh, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        mesh.rotation.z = spin * dir * (1.15 + i * 0.18);
        mesh.position.y = 0.25 + i * 0.52 + Math.sin(spin * 2 + i) * 0.07;
      });
    },
  };
}
