import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

/** Clamps extreme HDR pixels (tiny specular spikes) so bloom can't smear them across the frame. */
const ClampShader = {
  uniforms: { tDiffuse: { value: null }, uMax: { value: 3.0 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uMax;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      if (any(isnan(c)) || any(isinf(c))) c = vec4(0.0, 0.0, 0.0, 1.0);
      gl_FragColor = vec4(min(c.rgb, vec3(uMax)), c.a);
    }
  `
};
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { asset, fileExists, isMobile } from '../utils.js';

/** Renderer with the settings shared by every 3D scene on the site. */
export function createRenderer(canvas, { alpha = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, powerPreference: 'high-performance' });
  // Cap the pixel ratio so mid-range phones stay smooth.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  return renderer;
}

const envCache = new WeakMap();

/**
 * Procedural photo studio: a dark room lit by long softbox strips (top, sides, rim) and a
 * warm gold panel. Reflections of these strips are what make glossy plastic and car paint read.
 */
function createStudioScene() {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(30, 16, 30),
    new THREE.MeshBasicMaterial({ color: '#06060a', side: THREE.BackSide })
  );
  room.position.y = 5;
  scene.add(room);
  const panel = (w, h, intensity, color, pos, rot) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })
    );
    m.position.set(...pos);
    m.rotation.set(...rot);
    scene.add(m);
  };
  // Overhead strips.
  panel(14, 1.1, 5, '#ffffff', [0, 9, -2.5], [Math.PI / 2, 0, 0]);
  panel(14, 1.1, 5, '#ffffff', [0, 9, 2.5], [Math.PI / 2, 0, 0]);
  panel(6, 6, 1.2, '#ffffff', [0, 9.5, 0], [Math.PI / 2, 0, 0]);
  // Tall side strips → long vertical highlights.
  panel(1.2, 10, 6, '#ffffff', [-12, 4, 2], [0, Math.PI / 2, 0]);
  panel(1.2, 10, 6, '#ffffff', [12, 4, -2], [0, -Math.PI / 2, 0]);
  // Warm gold rim + soft front fill.
  panel(10, 4, 3.5, '#E6C27A', [0, 3, -14], [0, 0, 0]);
  panel(10, 3, 1.4, '#fff3e0', [0, 2.5, 14], [0, Math.PI, 0]);
  // Subtle floor bounce.
  panel(20, 20, 0.12, '#C9A34A', [0, -2.9, 0], [-Math.PI / 2, 0, 0]);
  return scene;
}

/**
 * Studio environment map. Uses /public/hdr/studio.hdr when present (HDRLoader is the
 * current name of three's RGBELoader), otherwise the procedural softbox studio above.
 */
export async function getEnvironment(renderer) {
  if (envCache.has(renderer)) return envCache.get(renderer);
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envMap;
  const hdrUrl = asset('hdr/studio.hdr');
  if (await fileExists(hdrUrl)) {
    try {
      const hdr = await new HDRLoader().loadAsync(hdrUrl);
      envMap = pmrem.fromEquirectangular(hdr).texture;
      hdr.dispose();
    } catch (err) {
      console.warn('[env] Could not load studio.hdr, using the procedural studio.', err);
    }
  }
  if (!envMap) envMap = pmrem.fromScene(createStudioScene(), 0.02).texture;
  pmrem.dispose();
  envCache.set(renderer, envMap);
  return envMap;
}

let gltfLoader;

/** Shared GLTF loader with Draco support (three bundles the decoder files with the build). */
export function getGLTFLoader(manager) {
  if (gltfLoader && !manager) return gltfLoader;
  const draco = new DRACOLoader();
  const loader = new GLTFLoader(manager);
  loader.setDRACOLoader(draco);
  if (!manager) gltfLoader = loader;
  return loader;
}

/** Load a .glb if it exists; resolves to null when the file is missing or broken. */
export async function loadOptionalGLB(path, onProgress) {
  const url = asset(path);
  if (!(await fileExists(url))) return null;
  try {
    const gltf = await getGLTFLoader().loadAsync(url, (e) => {
      if (onProgress && e.total) onProgress(e.loaded / e.total);
    });
    return gltf;
  } catch (err) {
    console.warn(`[models] Failed to load ${path}, using the procedural fallback.`, err);
    return null;
  }
}

/**
 * Render pipeline: soft bloom on desktop (gold highlights, headlights, oil glow);
 * plain rendering on phones to keep them smooth.
 */
export function createPipeline(renderer, scene, camera, { strength = 0.35, radius = 0.5, threshold = 0.85 } = {}) {
  if (isMobile()) {
    return { render: () => renderer.render(scene, camera), setSize() {} };
  }
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new ShaderPass(ClampShader));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), strength, radius, threshold);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  return {
    bloom,
    render: () => composer.render(),
    setSize: (w, h) => {
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(w, h);
    }
  };
}

/** Fit a renderer (+ optional pipeline) and camera to the canvas' CSS size. */
export function fitToCanvas(renderer, camera, pipeline) {
  const canvas = renderer.domElement;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return false;
  const size = renderer.getSize(new THREE.Vector2());
  if (size.x !== w || size.y !== h) {
    renderer.setSize(w, h, false);
    pipeline?.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  return true;
}
