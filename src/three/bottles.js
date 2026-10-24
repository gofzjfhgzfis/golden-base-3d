import * as THREE from 'three';
import { brands } from '../data/products.js';
import { loadOptionalGLB } from './core.js';

/**
 * Bottles: loads /public/models/bottles/<id>.glb when it exists, otherwise builds a
 * procedural bottle whose silhouette matches the real container (1 L bottle, jug, drum)
 * and paints a label texture with the product's brand, grade and colors.
 */

// Front silhouettes (x right, y up, bottom at y = 0) for each container type.
const SHAPES = {
  bottle: {
    outline: [[-0.46, 0], [0.46, 0], [0.46, 1.35], [-0.02, 1.72], [-0.46, 1.72]],
    radius: 0.12,
    depth: 0.42,
    neck: { x: -0.24, y: 1.72, r: 0.15, h: 0.09 },
    cap: { r: 0.175, h: 0.19 },
    label: { x0: -0.38, x1: 0.38, y0: 0.16, y1: 1.24 }
  },
  jug: {
    outline: [[-0.72, 0], [0.72, 0], [0.72, 1.5], [-0.1, 1.5], [-0.32, 1.34], [-0.72, 1.34]],
    hole: [[0.02, 1.1], [0.56, 1.1], [0.56, 1.36], [0.02, 1.36]],
    radius: 0.14,
    holeRadius: 0.1,
    depth: 0.56,
    neck: { x: -0.52, y: 1.34, r: 0.17, h: 0.09 },
    cap: { r: 0.195, h: 0.17 },
    label: { x0: -0.62, x1: 0.62, y0: 0.12, y1: 1.0 }
  },
  drum: {
    outline: [[-0.78, 0], [0.78, 0], [0.78, 2.0], [-0.78, 2.0]],
    hole: [[-0.42, 1.66], [0.36, 1.66], [0.36, 1.86], [-0.42, 1.86]],
    radius: 0.18,
    holeRadius: 0.08,
    depth: 1.0,
    neck: { x: 0.58, y: 2.0, r: 0.11, h: 0.06 },
    cap: { r: 0.13, h: 0.12 },
    label: { x0: -0.58, x1: 0.58, y0: 0.22, y1: 1.5 }
  }
};

const BEVEL = 0.07;

/** Polygon → THREE.Path with rounded corners. */
function roundedPath(points, r, path = new THREE.Shape()) {
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const prev = new THREE.Vector2(...points[(i - 1 + n) % n]);
    const cur = new THREE.Vector2(...points[i]);
    const next = new THREE.Vector2(...points[(i + 1) % n]);
    const toPrev = prev.clone().sub(cur);
    const toNext = next.clone().sub(cur);
    const rr = Math.min(r, toPrev.length() / 2, toNext.length() / 2);
    const a = cur.clone().add(toPrev.normalize().multiplyScalar(rr));
    const b = cur.clone().add(toNext.normalize().multiplyScalar(rr));
    if (i === 0) path.moveTo(a.x, a.y);
    else path.lineTo(a.x, a.y);
    path.quadraticCurveTo(cur.x, cur.y, b.x, b.y);
  }
  path.closePath();
  return path;
}

const geometryCache = {};

function bodyGeometry(type) {
  if (geometryCache[type]) return geometryCache[type];
  const s = SHAPES[type];
  const shape = roundedPath(s.outline, s.radius);
  if (s.hole) shape.holes.push(roundedPath([...s.hole].reverse(), s.holeRadius, new THREE.Path()));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: s.depth,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 5,
    curveSegments: 14
  });
  geo.translate(0, 0, -s.depth / 2);
  geo.computeVertexNormals();
  geometryCache[type] = geo;
  return geo;
}

/** Perceived brightness 0..1 of a hex color. */
function luminance(hex) {
  const c = new THREE.Color(hex);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

/** Silver / gold bottles get a metallic-plastic finish. */
function isMetallic(hex) {
  const c = new THREE.Color(hex);
  const hsl = {};
  c.getHSL(hsl);
  const grey = hsl.s < 0.12 && hsl.l > 0.45;
  const gold = hsl.h > 0.08 && hsl.h < 0.14 && hsl.s > 0.4 && hsl.s < 0.75 && hsl.l > 0.45 && hsl.l < 0.62;
  return grey || gold;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Fit text into maxWidth by shrinking the font size. */
function fitText(ctx, text, maxWidth, size, weight = 700, family = 'Oswald') {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px ${family}, "Arial Narrow", sans-serif`;
    s -= 2;
  } while (ctx.measureText(text).width > maxWidth && s > 10);
}

/** Paint the front label for a product. */
function labelTexture(product, w, h, back = false) {
  const W = 512;
  const H = Math.round((W * h) / w);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const brand = brands[product.brand];
  const accent = product.accent;
  const darkAccent = luminance(accent) < 0.18;

  // Base: deep charcoal with a soft vertical sheen.
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1b1c20');
  bg.addColorStop(1, '#08080a');
  ctx.fillStyle = bg;
  roundRect(ctx, 0, 0, W, H, 34);
  ctx.fill();
  ctx.save();
  roundRect(ctx, 0, 0, W, H, 34);
  ctx.clip();

  // Accent swooshes.
  ctx.fillStyle = darkAccent ? '#c9a34a' : accent;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.34);
  ctx.bezierCurveTo(W * 0.35, H * 0.22, W * 0.7, H * 0.42, W, H * 0.18);
  ctx.lineTo(W, H * 0.27);
  ctx.bezierCurveTo(W * 0.7, H * 0.5, W * 0.35, H * 0.3, 0, H * 0.44);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#C9A34A';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.47);
  ctx.bezierCurveTo(W * 0.4, H * 0.33, W * 0.7, H * 0.52, W, H * 0.3);
  ctx.lineTo(W, H * 0.33);
  ctx.bezierCurveTo(W * 0.7, H * 0.56, W * 0.4, H * 0.37, 0, H * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Brand name.
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  fitText(ctx, brand.name.toUpperCase(), W * 0.84, 96);
  ctx.fillText(brand.name.toUpperCase(), W / 2, H * 0.17);
  ctx.font = `500 22px Oswald, "Arial Narrow", sans-serif`;
  ctx.fillStyle = '#C9A34A';
  ctx.fillText('L U B R I C A N T S', W / 2, H * 0.17 + 34);

  if (back) {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `400 24px Oswald, sans-serif`;
    ['GOLDEN BASE', 'ERBIL · KURDISTAN', '0750 444 4258'].forEach((line, i) =>
      ctx.fillText(line, W / 2, H * 0.62 + i * 40)
    );
  } else {
    // Product line.
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    fitText(ctx, product.name.toUpperCase(), W * 0.86, 34, 500);
    ctx.fillText(product.name.toUpperCase(), W / 2, H * 0.58);

    // White grade panel.
    const py = H * 0.63;
    const ph = H * 0.29;
    ctx.fillStyle = '#f4f1ea';
    roundRect(ctx, W * 0.07, py, W * 0.86, ph, 18);
    ctx.fill();
    ctx.fillStyle = '#111';
    fitText(ctx, product.viscosity, W * 0.78, Math.round(ph * 0.52));
    ctx.fillText(product.viscosity, W / 2, py + ph * 0.6);
    ctx.font = `600 ${Math.round(ph * 0.16)}px Oswald, sans-serif`;
    ctx.fillStyle = darkAccent ? '#8a6a1f' : accent;
    const sub = [product.api && `API ${product.api}`, product.size].filter(Boolean).join('  ·  ');
    ctx.fillText(sub, W / 2, py + ph * 0.86);
  }

  // Thin gold frame.
  ctx.restore();
  ctx.strokeStyle = 'rgba(201,163,74,0.9)';
  ctx.lineWidth = 6;
  roundRect(ctx, 3, 3, W - 6, H - 6, 32);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Build a procedural bottle for a product. */
export function createProceduralBottle(product) {
  const type = SHAPES[product.container] ? product.container : 'bottle';
  const s = SHAPES[type];
  const group = new THREE.Group();
  group.name = `bottle_${product.id}`;

  const metallic = isMetallic(product.color);
  const plastic = new THREE.MeshPhysicalMaterial({
    color: product.color,
    roughness: metallic ? 0.3 : 0.5,
    metalness: metallic ? 0.6 : 0.0,
    clearcoat: 0.45,
    clearcoatRoughness: 0.28
  });

  const body = new THREE.Mesh(bodyGeometry(type), plastic);
  body.castShadow = true;
  group.add(body);

  // Neck + ribbed cap.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(s.neck.r, s.neck.r, s.neck.h + BEVEL, 32), plastic);
  neck.position.set(s.neck.x, s.neck.y + (s.neck.h + BEVEL) / 2, 0);
  group.add(neck);

  const capMat = new THREE.MeshPhysicalMaterial({ color: '#141414', roughness: 0.45, clearcoat: 0.4 });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(s.cap.r, s.cap.r * 1.02, s.cap.h, 36, 1), capMat);
  const capY = s.neck.y + s.neck.h + BEVEL + s.cap.h / 2;
  cap.position.set(s.neck.x, capY, 0);
  cap.name = 'cap';
  group.add(cap);
  for (let i = 0; i < 18; i++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.018, s.cap.h * 0.8, 0.02), capMat);
    const a = (i / 18) * Math.PI * 2;
    rib.position.set(s.neck.x + Math.cos(a) * s.cap.r, capY, Math.sin(a) * s.cap.r);
    rib.rotation.y = -a;
    group.add(rib);
  }

  // Labels front + back.
  const lw = s.label.x1 - s.label.x0;
  const lh = s.label.y1 - s.label.y0;
  const zFront = s.depth / 2 + BEVEL + 0.004;
  const labelMat = (back) =>
    new THREE.MeshPhysicalMaterial({
      map: labelTexture(product, lw, lh, back),
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.12
    });
  const labelGeo = new THREE.PlaneGeometry(lw, lh);
  const front = new THREE.Mesh(labelGeo, labelMat(false));
  front.position.set((s.label.x0 + s.label.x1) / 2, (s.label.y0 + s.label.y1) / 2, zFront);
  front.name = 'label';
  group.add(front);
  const backLabel = new THREE.Mesh(labelGeo, labelMat(true));
  backLabel.position.set(front.position.x, front.position.y, -zFront);
  backLabel.rotation.y = Math.PI;
  group.add(backLabel);

  // Center the body on x so Y-rotation spins around the middle.
  const height = capY + s.cap.h / 2;
  group.userData = {
    height,
    neckTop: new THREE.Vector3(s.neck.x, s.neck.y + s.neck.h + BEVEL, 0),
    cap,
    procedural: true
  };
  return group;
}

/** Normalize any bottle object so its height is `targetHeight` and its base is at y = 0. */
export function normalizeBottle(object, targetHeight) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const scale = targetHeight / size.y;
  object.scale.setScalar(scale);
  const center = box.getCenter(new THREE.Vector3());
  object.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  const wrapper = new THREE.Group();
  wrapper.add(object);
  wrapper.userData = {
    ...object.userData,
    scale,
    neckTopWorldLocal: object.userData.neckTop
      ? object.userData.neckTop.clone().multiplyScalar(scale).add(object.position)
      : new THREE.Vector3(0, targetHeight, 0)
  };
  return wrapper;
}

/**
 * Get a display-ready bottle for a product: its .glb model if present, else the procedural one.
 * The result is normalized to `targetHeight` with the base at y = 0.
 */
export async function getBottle(product, targetHeight = 2) {
  const gltf = await loadOptionalGLB(product.model);
  let object;
  if (gltf) {
    object = gltf.scene;
    object.traverse((o) => {
      if (o.isMesh) o.castShadow = true;
    });
    const box = new THREE.Box3().setFromObject(object);
    object.userData = { neckTop: new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y, 0) };
  } else {
    object = createProceduralBottle(product);
  }
  return normalizeBottle(object, targetHeight);
}
