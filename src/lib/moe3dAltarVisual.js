import * as THREE from "three";

/**
 * MOE アルター（低ポリ · 転送装置）
 * @param {{ scale?: number, variant?: "hub" | "portal" }} [opts]
 */
export function buildMoe3dAltarVisual(opts = {}) {
  const scale = opts.scale ?? 1;
  const variant = opts.variant ?? "hub";
  const root = new THREE.Group();
  root.name = "moe-altar";

  const baseMat = new THREE.MeshStandardMaterial({
    color: variant === "hub" ? 0x64748b : 0x78716c,
    roughness: 0.55,
    metalness: 0.35,
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: variant === "hub" ? 0x38bdf8 : 0xa78bfa,
    emissive: variant === "hub" ? 0x0ea5e9 : 0x7c3aed,
    emissiveIntensity: 0.55,
    roughness: 0.35,
    metalness: 0.2,
  });
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: 0xbae6fd,
    emissiveIntensity: 0.25,
    roughness: 0.4,
    metalness: 0.5,
  });

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4 * scale, 2.7 * scale, 0.35 * scale, 16),
    baseMat
  );
  platform.position.y = 0.18 * scale;
  platform.receiveShadow = true;
  platform.castShadow = true;
  root.add(platform);

  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55 * scale, 0.75 * scale, 2.8 * scale, 10),
    baseMat
  );
  pillar.position.y = 1.65 * scale;
  pillar.castShadow = true;
  root.add(pillar);

  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.72 * scale, 0),
    glowMat
  );
  core.position.y = 3.15 * scale;
  core.castShadow = true;
  root.add(core);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.15 * scale, 0.08 * scale, 8, 24),
    ringMat
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.42 * scale;
  root.add(ring);

  root.userData.altarVisual = { variant };
  return root;
}
