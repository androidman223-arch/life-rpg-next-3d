import * as THREE from "three";

/**
 * 大きな岩と頭上の HP バー
 */
export function createMoeMiningRock() {
  const root = new THREE.Group();
  root.name = "mining-rock";
  const mat = new THREE.MeshStandardMaterial({
    color: 0x8d8680,
    flatShading: true,
    roughness: 0.94,
    metalness: 0.04,
  });
  const core = new THREE.Mesh(new THREE.DodecahedronGeometry(1.35, 0), mat);
  core.scale.set(1.55, 1.15, 1.35);
  core.position.y = 1.15;
  core.castShadow = true;
  const lumpL = new THREE.Mesh(new THREE.DodecahedronGeometry(0.72, 0), mat);
  lumpL.position.set(-1.15, 0.7, 0.35);
  lumpL.castShadow = true;
  const lumpR = new THREE.Mesh(new THREE.DodecahedronGeometry(0.62, 0), mat);
  lumpR.position.set(1.05, 0.55, -0.25);
  lumpR.castShadow = true;
  root.add(core, lumpL, lumpR);

  const barCanvas = document.createElement("canvas");
  barCanvas.width = 160;
  barCanvas.height = 28;
  const barTex = new THREE.CanvasTexture(barCanvas);
  const bar = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: barTex,
      transparent: true,
      depthTest: false,
      fog: false,
    })
  );
  bar.position.set(0, 3.15, 0);
  bar.scale.set(2.6, 0.46, 1);
  bar.renderOrder = 998;
  root.add(bar);

  const nameCanvas = document.createElement("canvas");
  nameCanvas.width = 160;
  nameCanvas.height = 36;
  const nameCtx = nameCanvas.getContext("2d");
  nameCtx.clearRect(0, 0, 160, 36);
  nameCtx.textAlign = "center";
  nameCtx.textBaseline = "middle";
  nameCtx.font = "bold 22px sans-serif";
  nameCtx.strokeStyle = "#000000";
  nameCtx.lineWidth = 4;
  nameCtx.strokeText("岩", 80, 18);
  nameCtx.fillStyle = "#f5f5f4";
  nameCtx.fillText("岩", 80, 18);
  const nameTex = new THREE.CanvasTexture(nameCanvas);
  const name = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: nameTex,
      transparent: true,
      depthTest: false,
      fog: false,
    })
  );
  name.position.set(0, 3.7, 0);
  name.scale.set(1.8, 0.42, 1);
  name.renderOrder = 997;
  root.add(name);

  const barCtx = barCanvas.getContext("2d");

  function paint(hp, hpMax) {
    const max = Math.max(1, Number(hpMax) || 1);
    const cur = Math.max(0, Math.min(max, Number(hp) || 0));
    const alive = cur > 0;
    root.visible = alive;
    bar.visible = alive;
    name.visible = alive;
    if (!alive) return;
    const pct = cur / max;
    barCtx.clearRect(0, 0, 160, 28);
    barCtx.fillStyle = "rgba(0,0,0,0.7)";
    barCtx.fillRect(8, 8, 144, 12);
    barCtx.fillStyle = pct <= 0.25 ? "#a8a29e" : "#e7e5e4";
    barCtx.fillRect(8, 8, 144 * pct, 12);
    barCtx.strokeStyle = "rgba(255,255,255,0.55)";
    barCtx.lineWidth = 1;
    barCtx.strokeRect(8, 8, 144, 12);
    barTex.needsUpdate = true;
  }

  function dispose() {
    const mats = new Set();
    root.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      const list = obj.material
        ? Array.isArray(obj.material)
          ? obj.material
          : [obj.material]
        : [];
      for (const m of list) mats.add(m);
    });
    for (const m of mats) {
      m.map?.dispose();
      m.dispose();
    }
  }

  return { root, paint, dispose };
}
