import * as THREE from "three";

/**
 * フィールド看板用 Canvas テクスチャ（MOE 風 · 木枠＋地名）
 * @param {string} title
 * @param {string} [subtitle]
 */
export function createMoe3dKanbanTexture(title, subtitle = "") {
  const twoLine = Boolean(subtitle);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = twoLine ? 168 : 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  ctx.fillStyle = "#f3e8d4";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#6b4423";
  ctx.lineWidth = 10;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

  ctx.strokeStyle = "#a16207";
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

  const titleStr = String(title);
  const titleLen = titleStr.length;
  let titleSize = 52;
  if (titleLen > 9) titleSize = 44;
  if (titleLen > 12) titleSize = 36;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#1c1917";
  ctx.font = `bold ${titleSize}px "Hiragino Sans", "Yu Gothic UI", sans-serif`;
  ctx.fillText(
    titleStr,
    canvas.width / 2,
    twoLine ? canvas.height * 0.38 : canvas.height / 2
  );

  if (twoLine) {
    ctx.fillStyle = "#57534e";
    ctx.font = '24px "Hiragino Sans", "Yu Gothic UI", sans-serif';
    ctx.fillText(String(subtitle), canvas.width / 2, canvas.height * 0.72);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * 低ポリ看板（柱＋文字板）
 * @param {string} title
 * @param {string} [subtitle]
 * @param {{ scale?: number, boardW?: number }} [opts]
 */
export function buildMoe3dKanbanSign(title, subtitle = "", opts = {}) {
  const scale = opts.scale ?? 1;
  const boardW = opts.boardW ?? 2.35 * scale;
  const boardH = (subtitle ? 0.78 : 0.58) * scale;

  const root = new THREE.Group();
  root.name = "moe-kanban";

  const postMat = new THREE.MeshStandardMaterial({
    color: 0x5d4037,
    roughness: 0.88,
  });
  const post = new THREE.Mesh(
    new THREE.BoxGeometry(0.17 * scale, 2.15 * scale, 0.17 * scale),
    postMat
  );
  post.position.y = 1.08 * scale;
  post.castShadow = true;
  root.add(post);

  const tex = createMoe3dKanbanTexture(title, subtitle);
  const boardMat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.92,
    metalness: 0,
  });
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(boardW, boardH, 0.07 * scale),
    boardMat
  );
  board.position.y = 2.32 * scale;
  board.castShadow = true;
  root.add(board);

  root.userData.kanban = { title, subtitle };
  return root;
}
