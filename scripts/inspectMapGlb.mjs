import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const mapPath = path.join(root, "public/assets/map/3D_MoeMapField02.glb");
const buf = fs.readFileSync(mapPath);
const jsonChunk = extractGltfJson(buf);
const gltf = JSON.parse(jsonChunk);

console.log("=== 3D_MoeMapField02.glb ===");
console.log("meshes:", gltf.meshes?.length ?? 0);
console.log("materials:", gltf.materials?.length ?? 0);

for (const [i, m] of (gltf.materials ?? []).entries()) {
  const name = m.name ?? `material_${i}`;
  const pbr = m.pbrMetallicRoughness ?? {};
  const base = pbr.baseColorFactor ?? [1, 1, 1, 1];
  const tex = pbr.baseColorTexture?.index;
  const alpha = m.alphaMode ?? "OPAQUE";
  const dbl = m.doubleSided ?? false;
  console.log(
    `[mat ${i}] ${name} | base=[${base.map((v) => v.toFixed(2)).join(",")}] tex=${tex ?? "-"} alpha=${alpha} double=${dbl}`
  );
}

console.log("\n--- meshes ---");
for (const [i, mesh] of (gltf.meshes ?? []).entries()) {
  const name = mesh.name ?? `mesh_${i}`;
  for (const [pi, prim] of mesh.primitives.entries()) {
    const mat = gltf.materials?.[prim.material]?.name ?? prim.material;
    console.log(`[mesh ${i}] ${name} prim${pi} mat=${mat} mode=${prim.mode ?? 4}`);
  }
}

console.log("\n--- textures / images ---");
for (const [i, img] of (gltf.images ?? []).entries()) {
  console.log(`[img ${i}] ${img.name ?? "(no name)"} mime=${img.mimeType ?? "-"} uri=${img.uri ? img.uri.slice(0, 40) : "bufferView"}`);
}
for (const [i, t] of (gltf.textures ?? []).entries()) {
  console.log(`[tex ${i}] source=${t.source}`);
}

console.log("\n--- accessors with COLOR ---");
for (const [i, mesh] of (gltf.meshes ?? []).entries()) {
  for (const [pi, prim] of mesh.primitives.entries()) {
    if (prim.attributes?.COLOR_0 != null) {
      console.log(`mesh ${i} prim ${pi} has COLOR_0`);
    }
  }
}

function extractGltfJson(buffer) {
  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546c67) throw new Error("Not GLB");
  let offset = 12;
  while (offset < buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    const chunkData = buffer.subarray(offset + 8, offset + 8 + chunkLength);
    if (chunkType === 0x4e4f534a) return chunkData.toString("utf8");
    offset += 8 + chunkLength;
  }
  throw new Error("JSON chunk not found");
}
