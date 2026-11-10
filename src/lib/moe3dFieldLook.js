/**
 * 3D フィールドの見た目（MOE 風・ローポリでもきれいに）
 *
 *  ① 地面テクスチャ … 色だけの面に、世界座標でテクスチャを張る（UV いらず・つなぎ目なし）
 *       上向きの面: 草 ／ 土・砂 ／ 石だたみ（灰色）／ 横向きの面: 岩 ／ 全体: 大きな色むら
 *       GLB でもともとテクスチャがある面は、うすくだけかける
 *  ② 空 … グラデーションの空 ＋ 遠くの山なみ（カメラについてくる＝ずっと遠くに見える）
 *  ④ 光とかげ … 太陽がプレイヤーについてきて、まわりにかげが出る
 *
 * 絵（ピクセル）は lib/moe/moe3dFieldLookTextures.js（純粋関数・テストあり）。
 * 材質に userData.moeNoLook = true を付けると、①をかけない。
 */

import * as THREE from "three";
import {
  moeLookDirtPixels,
  moeLookGrassPixels,
  moeLookMacroPixels,
  moeLookMountainPixels,
  moeLookPickSurface,
  moeLookRockPixels,
  moeLookStonePixels,
} from "@/lib/moe/moe3dFieldLookTextures";
import { MOE_FIELD_SKY_HORIZON_HEX } from "@/lib/moeFieldFog";

/** 光の強さ（キャンプ休憩の暗さは、この値に比率をかける） */
export const MOE_FIELD_LOOK_HEMI_INTENSITY = 0.8;
export const MOE_FIELD_LOOK_SUN_INTENSITY = 1.3;
const SUN_COLOR = 0xfff0d8;
const HEMI_SKY = 0xdcecff;
const HEMI_GROUND = 0x5d6b40;

const SKY_TOP = 0x3f86d8;
const SKY_BOTTOM = 0x8ea58c;
const NIGHT_SKY = 0x080c18;

/** 太陽のかげの範囲（プレイヤーのまわり ± この長さ） */
const SHADOW_HALF = 42;
const SHADOW_MAP = 2048;
const SUN_OFFSET = new THREE.Vector3(24, 42, 15);

function grayDataTexture(pixels, size) {
  const rgba = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const v = pixels[i];
    rgba[i * 4] = v;
    rgba[i * 4 + 1] = v;
    rgba[i * 4 + 2] = v;
    rgba[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(rgba, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

const LOOK_VERTEX_PARS = /* glsl */ `
varying vec3 vMoeWP;
varying vec3 vMoeWN;
`;

const LOOK_VERTEX = /* glsl */ `
#include <project_vertex>
{
  vec4 moeWp = vec4( transformed, 1.0 );
  vec3 moeN = objectNormal;
  #ifdef USE_BATCHING
    moeWp = batchingMatrix * moeWp;
    moeN = mat3( batchingMatrix ) * moeN;
  #endif
  #ifdef USE_INSTANCING
    moeWp = instanceMatrix * moeWp;
    moeN = mat3( instanceMatrix ) * moeN;
  #endif
  moeWp = modelMatrix * moeWp;
  vMoeWP = moeWp.xyz;
  vMoeWN = normalize( mat3( modelMatrix ) * moeN );
}
`;

const LOOK_FRAGMENT_PARS = /* glsl */ `
varying vec3 vMoeWP;
varying vec3 vMoeWN;
uniform sampler2D uMoeGrass;
uniform sampler2D uMoeStone;
uniform sampler2D uMoeDirt;
uniform sampler2D uMoeRock;
uniform sampler2D uMoeMacro;
`;

const LOOK_FRAGMENT = /* glsl */ `
#include <map_fragment>
{
  vec3 moeN = normalize( vMoeWN );
  vec3 moeA = abs( moeN );
  moeA /= ( moeA.x + moeA.y + moeA.z + 1e-4 );
  float moeUp = smoothstep( 0.5, 0.8, moeN.y );
  #ifdef MOE_TOP_GRASS
    float moeTop = texture2D( uMoeGrass, vMoeWP.xz * 0.26 ).r * 0.6
                 + texture2D( uMoeGrass, vMoeWP.xz * 0.073 + 0.37 ).r * 0.4;
  #elif defined( MOE_TOP_DIRT )
    float moeTop = texture2D( uMoeDirt, vMoeWP.xz * 0.21 ).r * 0.6
                 + texture2D( uMoeDirt, vMoeWP.xz * 0.061 + 0.53 ).r * 0.4;
  #else
    float moeTop = texture2D( uMoeStone, vMoeWP.xz * 0.17 ).r * 0.7
                 + texture2D( uMoeStone, vMoeWP.xz * 0.051 + 0.21 ).r * 0.3;
  #endif
  float moeSide = texture2D( uMoeRock, vMoeWP.zy * vec2( 0.11, 0.17 ) ).r * moeA.x
                + texture2D( uMoeRock, vMoeWP.xz * 0.11 ).r * moeA.y
                + texture2D( uMoeRock, vMoeWP.xy * vec2( 0.11, 0.17 ) ).r * moeA.z;
  float moeDetail = mix( moeSide, moeTop, moeUp );
  float moeMacro = texture2D( uMoeMacro, vMoeWP.xz * 0.014 ).r;
  float moeK = ( 0.55 + 0.9 * moeDetail ) * ( 0.84 + 0.32 * moeMacro );
  diffuseColor.rgb *= mix( 1.0, moeK, MOE_LOOK_STRENGTH );
  #ifdef MOE_TOP_GRASS
    vec3 moeTint = mix( vec3( 0.9, 1.0, 0.84 ), vec3( 1.07, 1.03, 0.88 ), moeMacro );
    diffuseColor.rgb *= mix( vec3( 1.0 ), moeTint, moeUp * MOE_LOOK_STRENGTH );
  #endif
}
`;

/** すべての材質で同じ関数（three.js がプログラムを使いまわせる） */
function moeLookOnBeforeCompile(shader) {
  const u = this.userData.moeLookUniforms;
  if (u) Object.assign(shader.uniforms, u);
  shader.vertexShader = LOOK_VERTEX_PARS + shader.vertexShader.replace(
    "#include <project_vertex>",
    LOOK_VERTEX
  );
  shader.fragmentShader = LOOK_FRAGMENT_PARS + shader.fragmentShader.replace(
    "#include <map_fragment>",
    LOOK_FRAGMENT
  );
}

function materialHasOwnCompileHook(m) {
  return Object.prototype.hasOwnProperty.call(m, "onBeforeCompile");
}

/**
 * 1つの材質に①をかける。かけたら true。
 */
function patchMaterial(m, uniforms) {
  if (!m || !m.userData) return false;
  if (m.userData.moeLook !== undefined) return m.userData.moeLook === true;
  m.userData.moeLook = false;
  if (m.userData.moeNoLook) return false;
  if (!(m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial)) {
    return false;
  }
  if (m.transparent || m.opacity < 1 || m.alphaTest > 0) return false;
  if (materialHasOwnCompileHook(m)) return false;
  const em = m.emissive;
  if (em && em.r + em.g + em.b > 0.04 && (m.emissiveIntensity ?? 1) > 0.05) return false;
  const c = m.color;
  const surface = c ? moeLookPickSurface(c.r, c.g, c.b) : "stone";
  if (surface === "skip") return false;
  const defines = { ...(m.defines || {}) };
  defines.MOE_LOOK = "";
  defines.MOE_LOOK_STRENGTH = m.map ? "0.45" : "1.0";
  if (surface === "grass") defines.MOE_TOP_GRASS = "";
  if (surface === "dirt") defines.MOE_TOP_DIRT = "";
  m.defines = defines;
  m.userData.moeLookUniforms = uniforms;
  m.onBeforeCompile = moeLookOnBeforeCompile;
  m.needsUpdate = true;
  m.userData.moeLook = true;
  return true;
}

function buildSkyDome(uniformsNight) {
  const geo = new THREE.SphereGeometry(1, 32, 16);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTop: { value: new THREE.Color(SKY_TOP) },
      uHorizon: { value: new THREE.Color(MOE_FIELD_SKY_HORIZON_HEX) },
      uBottom: { value: new THREE.Color(SKY_BOTTOM) },
      uNightCol: { value: new THREE.Color(NIGHT_SKY) },
      uNight: uniformsNight,
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize( position );
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop;
      uniform vec3 uHorizon;
      uniform vec3 uBottom;
      uniform vec3 uNightCol;
      uniform float uNight;
      varying vec3 vDir;
      void main() {
        float h = normalize( vDir ).y;
        vec3 col;
        if ( h >= 0.0 ) {
          col = mix( uHorizon, uTop, pow( clamp( h, 0.0, 1.0 ), 0.55 ) );
        } else {
          col = mix( uHorizon, uBottom, smoothstep( 0.0, 0.18, -h ) );
        }
        col = mix( col, uNightCol, uNight );
        gl_FragColor = vec4( col, 1.0 );
        #include <colorspace_fragment>
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    fog: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = "moe-sky-dome";
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  mesh.scale.setScalar(240);
  mesh.userData.moeNoLook = true;
  return mesh;
}

function buildMountainRing() {
  const W = 1024;
  const H = 128;
  const tex = new THREE.DataTexture(moeLookMountainPixels(W, H), W, H, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.repeat.set(3, 1);
  tex.needsUpdate = true;
  const radius = 215;
  const height = 64;
  const geo = new THREE.CylinderGeometry(radius, radius, height, 96, 1, true);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.BackSide,
    alphaTest: 0.5,
    depthWrite: false,
    depthTest: false,
    fog: false,
  });
  mat.userData.moeNoLook = true;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = "moe-mountain-ring";
  mesh.frustumCulled = false;
  mesh.renderOrder = -999;
  // 下 -4° くらい 〜 上 +12° くらい
  mesh.userData.moeYOffset = 15;
  return mesh;
}

/**
 * 3D フィールドに見た目のしかけを入れる。
 * @param {{ scene: THREE.Scene, renderer: THREE.WebGLRenderer, sun: THREE.DirectionalLight, hemi: THREE.HemisphereLight }} p
 */
export function createMoeFieldLook({ scene, renderer, sun, hemi }) {
  const grass = grayDataTexture(moeLookGrassPixels(256), 256);
  const stone = grayDataTexture(moeLookStonePixels(256), 256);
  const dirt = grayDataTexture(moeLookDirtPixels(256), 256);
  const rock = grayDataTexture(moeLookRockPixels(256), 256);
  const macro = grayDataTexture(moeLookMacroPixels(128), 128);
  const uniforms = {
    uMoeGrass: { value: grass },
    uMoeStone: { value: stone },
    uMoeDirt: { value: dirt },
    uMoeRock: { value: rock },
    uMoeMacro: { value: macro },
  };

  // ④ 光とかげ
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  hemi.color.setHex(HEMI_SKY);
  hemi.groundColor.setHex(HEMI_GROUND);
  hemi.intensity = MOE_FIELD_LOOK_HEMI_INTENSITY;
  sun.color.setHex(SUN_COLOR);
  sun.intensity = MOE_FIELD_LOOK_SUN_INTENSITY;
  sun.castShadow = true;
  sun.shadow.mapSize.set(SHADOW_MAP, SHADOW_MAP);
  const sc = sun.shadow.camera;
  sc.left = -SHADOW_HALF;
  sc.right = SHADOW_HALF;
  sc.top = SHADOW_HALF;
  sc.bottom = -SHADOW_HALF;
  sc.near = 1;
  sc.far = 160;
  sc.updateProjectionMatrix();
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  sun.shadow.radius = 3;
  if (!sun.target.parent) scene.add(sun.target);

  // ② 空と山
  const night = { value: 0 };
  const dome = buildSkyDome(night);
  const mountains = buildMountainRing();
  scene.add(dome);
  scene.add(mountains);

  const texel = (SHADOW_HALF * 2) / SHADOW_MAP;
  let lastScan = -1e9;

  return {
    /** 地面（など）に①をかける。何回よんでもよい（かけた材質はとばす） */
    applyToTerrain(root) {
      let n = 0;
      root?.traverse?.((obj) => {
        if (!obj.isMesh || obj.isSkinnedMesh) return;
        if (obj.userData?.moeNoLook) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        let any = false;
        for (const m of mats) {
          if (patchMaterial(m, uniforms)) {
            n++;
            any = true;
          }
        }
        // テクスチャをかけた地面は、かげを受ける
        if (any && !obj.receiveShadow) obj.receiveShadow = true;
      });
      return n;
    },
    /** 読みこみがあとから来るので、ときどき見なおす */
    scanTerrainEvery(root, nowMs, intervalMs = 1500) {
      if (nowMs - lastScan < intervalMs) return 0;
      lastScan = nowMs;
      return this.applyToTerrain(root);
    },
    /**
     * 毎フレーム: 空と山をカメラへ、太陽をプレイヤーへ
     * @param {THREE.Camera} camera
     * @param {THREE.Vector3} focus プレイヤーの位置
     * @param {number} nightBlend 0=昼 1=キャンプ休憩の夜
     */
    update(camera, focus, nightBlend = 0) {
      dome.position.copy(camera.position);
      mountains.position.set(
        camera.position.x,
        camera.position.y + mountains.userData.moeYOffset,
        camera.position.z
      );
      night.value = nightBlend;
      mountains.material.color.setScalar(1 - nightBlend * 0.85);
      // かげがチラチラしないよう、かげの1マスにそろえる
      const fx = Math.round(focus.x / texel) * texel;
      const fz = Math.round(focus.z / texel) * texel;
      sun.target.position.set(fx, focus.y, fz);
      sun.position.set(fx + SUN_OFFSET.x, focus.y + SUN_OFFSET.y, fz + SUN_OFFSET.z);
      sun.target.updateMatrixWorld();
    },
    dispose() {
      scene.remove(dome);
      scene.remove(mountains);
      dome.geometry.dispose();
      dome.material.dispose();
      mountains.geometry.dispose();
      mountains.material.map?.dispose();
      mountains.material.dispose();
      grass.dispose();
      stone.dispose();
      dirt.dispose();
      rock.dispose();
      macro.dispose();
    },
  };
}
