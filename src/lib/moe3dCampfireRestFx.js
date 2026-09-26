import * as THREE from "three";

/**
 * 焚き火の炎エフェクト + 暖かいポイントライト
 * @param {THREE.Group} campRoot buildMoe3dTrainingGuideRestCamp() の root
 */
export function attachMoe3dCampfireRestFx(campRoot) {
  const fireZ = campRoot.userData?.trainingGuideCamp?.fireZ ?? 0;
  const light = new THREE.PointLight(0xff8c42, 0, 14, 1.6);
  light.position.set(0, 0.55, fireZ);
  campRoot.add(light);

  const emberCount = 28;
  const positions = new Float32Array(emberCount * 3);
  const speeds = [];
  for (let i = 0; i < emberCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.35;
    positions[i * 3 + 1] = 0.25 + Math.random() * 0.35;
    positions[i * 3 + 2] = fireZ + (Math.random() - 0.5) * 0.3;
    speeds.push({
      x: (Math.random() - 0.5) * 0.12,
      y: 0.35 + Math.random() * 0.55,
      z: (Math.random() - 0.5) * 0.08,
      phase: Math.random() * Math.PI * 2,
    });
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xfdba74,
    size: 0.11,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const embers = new THREE.Points(geom, mat);
  campRoot.add(embers);

  const flameMeshes = [];
  campRoot.traverse((obj) => {
    if (obj.isMesh && obj.geometry?.type === "ConeGeometry") {
      flameMeshes.push(obj);
    }
  });

  let time = 0;

  return {
    /**
     * @param {number} dt
     * @param {number} blend 0..1
     */
    update(dt, blend) {
      time += dt;
      const b = Math.max(0, Math.min(1, blend));
      light.intensity = b * (1.6 + Math.sin(time * 5.2) * 0.22 + Math.sin(time * 11.3) * 0.12);

      mat.opacity = b * (0.55 + Math.sin(time * 7) * 0.12);
      const posAttr = geom.getAttribute("position");
      for (let i = 0; i < emberCount; i++) {
        const sp = speeds[i];
        let x = posAttr.getX(i) + sp.x * dt * b;
        let y = posAttr.getY(i) + sp.y * dt * b;
        let z = posAttr.getZ(i) + sp.z * dt * b;
        const baseY = 0.28 + Math.sin(time * 3 + sp.phase) * 0.04;
        if (y > baseY + 1.1 || b < 0.05) {
          x = (Math.random() - 0.5) * 0.28;
          y = baseY;
          z = fireZ + (Math.random() - 0.5) * 0.22;
        }
        posAttr.setXYZ(i, x, y, z);
      }
      posAttr.needsUpdate = true;

      for (let i = 0; i < flameMeshes.length; i++) {
        const mesh = flameMeshes[i];
        const s = 1 + Math.sin(time * 8 + i) * 0.08 * b;
        mesh.scale.set(s, 1 + Math.sin(time * 6 + i * 1.7) * 0.12 * b, s);
        if (mesh.material?.emissiveIntensity != null) {
          mesh.material.emissiveIntensity = 0.35 + b * 0.75 + Math.sin(time * 9 + i) * 0.15 * b;
        }
      }
    },
    dispose() {
      geom.dispose();
      mat.dispose();
      campRoot.remove(embers);
      campRoot.remove(light);
    },
  };
}
