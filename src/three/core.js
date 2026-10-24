import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
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
 * Studio environment map. Uses /public/hdr/studio.hdr when present (HDRLoader is the
 * current name of three's RGBELoader), otherwise a procedural studio room.
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
  if (!envMap) envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
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

/** Fit a renderer + camera to the canvas' CSS size. */
export function fitToCanvas(renderer, camera) {
  const canvas = renderer.domElement;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return false;
  const size = renderer.getSize(new THREE.Vector2());
  if (size.x !== w || size.y !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  return true;
}
