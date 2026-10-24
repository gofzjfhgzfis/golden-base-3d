import * as THREE from 'three';
import { brands } from '../data/products.js';
import { loadOptionalGLB } from './core.js';

/**
 * Bottles: loads /public/models/bottles/<id>.glb when it exists, otherwise builds a
 * procedural bottle whose silhouette matches the real container (1 L bottle, jug, drum)
 * with a soft rounded body, knurled cap, fine plastic texture and a printed label
 * (brand, grade, colors) that has real gold-foil details.
 */

// Front silhouettes (x right, y up, bottom at y = 0) for each container type.
const SHAPES = {
  bottle: {
    outline: [[-0.42, 0], [0.42, 0], [0.42, 1.3], [-0.02, 1.66], [-0.42, 1.66]],
    radius: 0.16,
    depth: 0.3,
    neck: { x: -0.24, y: 1.66, r: 0.15, h: 0.12 },
    cap: { r: 0.18, h: 0.2 },
    label: { x0: -0.36, x1: 0.36, y0: 0.14, y1: 1.2 }
  },
  jug: {
    outline: [[-0.68, 0], [0.68, 0], [0.68, 1.46], [-0.08, 1.46], [-0.3, 1.3], [-0.68, 1.3]],
    hole: [[0.04, 1.06], [0.52, 1.06], [0.52, 1.3], [0.04, 1.3]],
    radius: 0.2,
    holeRadius: 0.11,
    depth: 0.42,
    neck: { x: -0.49, y: 1.3, r: 0.17, h: 0.12 },
    cap: { r: 0.2, h: 0.18 },
    label: { x0: -0.58, x1: 0.58, y0: 0.12, y1: 0.98 }
  },
  drum: {
    outline: [[-0.74, 0], [0.74, 0], [0.74, 1.96], [-0.74, 1.96]],
    hole: [[-0.4, 1.62], [0.34, 1.62], [0.34, 1.82], [-0.4, 1.82]],
    radius: 0.22,
    holeRadius: 0.09,
    depth: 0.86,
    neck: { x: 0.54, y: 1.96, r: 0.11, h: 0.08 },
    cap: { r: 0.13, h: 0.12 },
    label: { x0: -0.56, x1: 0.56, y0: 0.22, y1: 1.46 }
  }
};

// A generous bevel gives the soft, blow-moulded look of real HDPE bottles.
const BEVEL = 0.13;

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
    bevelSize: BEVEL * 0.8,
    bevelSegments: 10,
    curveSegments: 20
  });
  geo.translate(0, 0, -s.depth / 2);
  geo.computeVertexNormals();
  geometryCache[type] = geo;
  return geo;
}

/** Neck with a lip ring (lathe). */
function neckGeometry(r, h) {
  const pts = [
    [r * 0.82, 0],
    [r, 0.02],
    [r, h * 0.55],
    [r * 1.12, h * 0.62],
    [r * 1.12, h * 0.8],
    [r, h * 0.86],
    [r, h],
    [r * 0.8, h]
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 48);
}

/** Cap with rounded top and knurled grip (vertical ridges pushed out of the side). */
function capGeometry(r, h) {
  const pts = [];
  pts.push(new THREE.Vector2(r * 0.98, 0));
  for (let i = 0; i <= 10; i++) pts.push(new THREE.Vector2(r, 0.01 + (h * 0.78 * i) / 10));
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - h * 0.18 + Math.cos(a) * h * 0.18, h * 0.8 + Math.sin(a) * h * 0.18));
  }
  pts.push(new THREE.Vector2(0, h * 0.98));
  const geo = new THREE.LatheGeometry(pts, 120);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    if (v.y > 0.02 && v.y < h * 0.76) {
      const ang = Math.atan2(v.z, v.x);
      const k = 1 + 0.035 * Math.max(0, Math.sin(ang * 40));
      pos.setXYZ(i, v.x * k, v.y, v.z * k);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

let plasticBump;
/** Fine noise used as a bump map → the slightly grainy surface of moulded plastic. */
function plasticBumpTexture() {
  if (plasticBump) return plasticBump;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const img = g.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 118 + Math.random() * 20;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  plasticBump = new THREE.CanvasTexture(c);
  plasticBump.wrapS = plasticBump.wrapT = THREE.RepeatWrapping;
  plasticBump.repeat.set(3, 3);
  return plasticBump;
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

/**
 * Paint a label. `foil` = true draws only the gold-foil parts in white on black;
 * that canvas becomes the metalness map so the gold really shines.
 */
function paintLabel(product, w, h, back, foil) {
  const W = 768;
  const H = Math.round((W * h) / w);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const brand = brands[product.brand];
  const accent = product.accent;
  const darkAccent = luminance(accent) < 0.18;
  const GOLD = foil ? '#ffffff' : '#C9A34A';
  const R = 48;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  if (!foil) {
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#1d1e23');
    bg.addColorStop(0.55, '#111114');
    bg.addColorStop(1, '#070709');
    ctx.fillStyle = bg;
    roundRect(ctx, 0, 0, W, H, R);
    ctx.fill();
  }
  ctx.save();
  roundRect(ctx, 0, 0, W, H, R);
  ctx.clip();

  // Accent swoosh (ink) + gold foil swoosh.
  if (!foil) {
    const sw = ctx.createLinearGradient(0, 0, W, 0);
    const base = darkAccent ? '#c9a34a' : accent;
    sw.addColorStop(0, base);
    sw.addColorStop(1, new THREE.Color(base).multiplyScalar(0.7).getStyle());
    ctx.fillStyle = sw;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.34);
    ctx.bezierCurveTo(W * 0.35, H * 0.22, W * 0.7, H * 0.42, W, H * 0.18);
    ctx.lineTo(W, H * 0.27);
    ctx.bezierCurveTo(W * 0.7, H * 0.5, W * 0.35, H * 0.3, 0, H * 0.44);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.465);
  ctx.bezierCurveTo(W * 0.4, H * 0.33, W * 0.7, H * 0.52, W, H * 0.3);
  ctx.lineTo(W, H * 0.318);
  ctx.bezierCurveTo(W * 0.7, H * 0.545, W * 0.4, H * 0.355, 0, H * 0.485);
  ctx.closePath();
  ctx.fill();

  // Brand name (white ink) + "LUBRICANTS" (gold foil).
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  if (!foil) {
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 12;
    fitText(ctx, brand.name.toUpperCase(), W * 0.84, 150);
    ctx.fillText(brand.name.toUpperCase(), W / 2, H * 0.17);
    ctx.shadowBlur = 0;
  }
  ctx.font = `500 32px Oswald, "Arial Narrow", sans-serif`;
  ctx.fillStyle = GOLD;
  ctx.fillText('L U B R I C A N T S', W / 2, H * 0.17 + 50);

  if (back) {
    if (!foil) {
      ctx.fillStyle = 'rgba(255,255,255,0.78)';
      ctx.font = `400 36px Oswald, sans-serif`;
      ['GOLDEN BASE', 'ERBIL · KURDISTAN', '0750 444 4258'].forEach((line, i) => ctx.fillText(line, W / 2, H * 0.64 + i * 58));
    }
  } else {
    if (!foil) {
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      fitText(ctx, product.name.toUpperCase(), W * 0.86, 50, 500);
      ctx.fillText(product.name.toUpperCase(), W / 2, H * 0.585);
    }
    // Grade panel: cream card with a gold-foil border.
    const py = H * 0.625;
    const ph = H * 0.3;
    if (!foil) {
      const card = ctx.createLinearGradient(0, py, 0, py + ph);
      card.addColorStop(0, '#fbf8f1');
      card.addColorStop(1, '#ebe4d4');
      ctx.fillStyle = card;
      roundRect(ctx, W * 0.07, py, W * 0.86, ph, 26);
      ctx.fill();
      ctx.fillStyle = '#121212';
      fitText(ctx, product.viscosity, W * 0.78, Math.round(ph * 0.54));
      ctx.fillText(product.viscosity, W / 2, py + ph * 0.6);
      ctx.font = `600 ${Math.round(ph * 0.15)}px Oswald, sans-serif`;
      ctx.fillStyle = darkAccent ? '#8a6a1f' : new THREE.Color(accent).multiplyScalar(0.8).getStyle();
      const sub = [product.api && `API ${product.api}`, product.size].filter(Boolean).join('  ·  ');
      ctx.fillText(sub, W / 2, py + ph * 0.86);
    }
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 5;
    roundRect(ctx, W * 0.07, py, W * 0.86, ph, 26);
    ctx.stroke();
  }

  ctx.restore();
  // Gold frame.
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 9;
  roundRect(ctx, 5, 5, W - 10, H - 10, R - 4);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = foil ? THREE.NoColorSpace : THREE.SRGBColorSpace;
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
    roughness: metallic ? 0.34 : 0.42,
    metalness: metallic ? 0.55 : 0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.18,
    bumpMap: plasticBumpTexture(),
    bumpScale: 0.35
  });

  const body = new THREE.Mesh(bodyGeometry(type), plastic);
  body.castShadow = true;
  group.add(body);

  // Neck (with lip ring) + knurled cap.
  const neckBase = s.neck.y + BEVEL * 0.6;
  const neck = new THREE.Mesh(neckGeometry(s.neck.r, s.neck.h + BEVEL * 0.4), plastic);
  neck.position.set(s.neck.x, neckBase - BEVEL * 0.4, 0);
  group.add(neck);

  const capMat = new THREE.MeshPhysicalMaterial({ color: '#121212', roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4 });
  const cap = new THREE.Mesh(capGeometry(s.cap.r, s.cap.h), capMat);
  const capBottom = neckBase + s.neck.h * 0.85;
  cap.position.set(s.neck.x, capBottom, 0);
  cap.name = 'cap';
  group.add(cap);

  // Labels front + back, with gold foil (metalness map).
  const lw = s.label.x1 - s.label.x0;
  const lh = s.label.y1 - s.label.y0;
  const zFront = s.depth / 2 + BEVEL + 0.004;
  const labelMat = (back) => {
    const foil = paintLabel(product, lw, lh, back, true);
    return new THREE.MeshPhysicalMaterial({
      map: paintLabel(product, lw, lh, back, false),
      metalnessMap: foil,
      metalness: 1,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.08
    });
  };
  const labelGeo = new THREE.PlaneGeometry(lw, lh);
  const front = new THREE.Mesh(labelGeo, labelMat(false));
  front.position.set((s.label.x0 + s.label.x1) / 2, (s.label.y0 + s.label.y1) / 2, zFront);
  front.name = 'label';
  group.add(front);
  const backLabel = new THREE.Mesh(labelGeo, labelMat(true));
  backLabel.position.set(front.position.x, front.position.y, -zFront);
  backLabel.rotation.y = Math.PI;
  group.add(backLabel);

  group.userData = {
    height: capBottom + s.cap.h,
    neckTop: new THREE.Vector3(s.neck.x, capBottom, 0),
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
