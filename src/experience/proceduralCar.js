import * as THREE from 'three';

/**
 * Procedural, unbranded luxury sedan used when /public/models/car.glb is missing.
 * Every part is a separately named object so the same mapping logic (src/data/carParts.js)
 * works for it and for a real model. The nose points to +Z, wheels touch y = 0.
 */

const materials = () => ({
  paint: new THREE.MeshPhysicalMaterial({
    color: '#23262d',
    metalness: 0.75,
    roughness: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.03
  }),
  chrome: new THREE.MeshStandardMaterial({ color: '#f2f2f2', metalness: 1, roughness: 0.07 }),
  gold: new THREE.MeshStandardMaterial({ color: '#C9A34A', metalness: 1, roughness: 0.22 }),
  glass: new THREE.MeshPhysicalMaterial({
    color: '#8ea3b8',
    metalness: 0,
    roughness: 0.04,
    transmission: 0.92,
    thickness: 0.08,
    ior: 1.5,
    transparent: true,
    opacity: 0.85
  }),
  rubber: new THREE.MeshStandardMaterial({ color: '#121212', roughness: 0.92 }),
  trim: new THREE.MeshStandardMaterial({ color: '#0a0a0b', roughness: 0.55, metalness: 0.2 }),
  interior: new THREE.MeshStandardMaterial({ color: '#3b2a1c', roughness: 0.8 }),
  engine: new THREE.MeshStandardMaterial({ color: '#3a3d43', metalness: 0.85, roughness: 0.42 }),
  engineCover: new THREE.MeshPhysicalMaterial({ color: '#111114', roughness: 0.35, clearcoat: 0.8 }),
  disc: new THREE.MeshStandardMaterial({ color: '#6d6f73', metalness: 0.9, roughness: 0.35 }),
  headlight: new THREE.MeshStandardMaterial({
    color: '#dfe9f5',
    emissive: '#ffffff',
    emissiveIntensity: 0,
    metalness: 0.3,
    roughness: 0.08
  }),
  taillight: new THREE.MeshStandardMaterial({
    color: '#3d0006',
    emissive: '#ff1428',
    emissiveIntensity: 0,
    roughness: 0.2
  })
});

/** Extrude a side profile drawn in (z, y) across the car's width (x). */
function sideExtrude(points, width, bevel = 0.06, curve) {
  const shape = new THREE.Shape();
  points.forEach(([z, y], i) => (i ? shape.lineTo(z, y) : shape.moveTo(z, y)));
  if (curve) curve(shape);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: width - bevel * 2,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 24
  });
  // shape x → world z, extrusion → world x (centered).
  geo.rotateY(-Math.PI / 2);
  geo.translate((width - bevel * 2) / 2, 0, 0);
  geo.computeVertexNormals();
  return geo;
}

function mesh(geo, mat, name, pos = [0, 0, 0]) {
  const m = new THREE.Mesh(geo, mat);
  m.name = name;
  m.position.set(...pos);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function buildBody(m) {
  const g = new THREE.Group();
  g.name = 'body';

  // Lower body with both wheel arches cut out of the side profile.
  const lower = new THREE.Shape();
  lower.moveTo(-2.4, 0.42);
  lower.lineTo(-2.3, 0.27);
  lower.lineTo(-1.95, 0.25);
  lower.absarc(-1.45, 0.34, 0.5, Math.PI, 0, true);
  lower.lineTo(0.95, 0.25);
  lower.absarc(1.45, 0.34, 0.5, Math.PI, 0, true);
  lower.lineTo(2.3, 0.27);
  lower.lineTo(2.44, 0.45);
  lower.lineTo(2.42, 0.62);
  lower.lineTo(2.3, 0.72);
  lower.lineTo(0.95, 0.76);
  lower.lineTo(0.95, 0.93);
  lower.lineTo(-1.3, 0.96);
  lower.lineTo(-2.22, 0.9);
  lower.lineTo(-2.42, 0.74);
  lower.closePath();
  const lowerGeo = new THREE.ExtrudeGeometry(lower, {
    depth: 1.76,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.07,
    bevelSegments: 5,
    curveSegments: 28
  });
  lowerGeo.rotateY(-Math.PI / 2);
  lowerGeo.translate(0.88, 0, 0);
  lowerGeo.computeVertexNormals();
  g.add(mesh(lowerGeo, m.paint, 'body_lower'));

  // Front fenders form the sides of the open engine bay.
  const fender = [[0.92, 0.74], [2.36, 0.7], [2.4, 0.8], [2.26, 0.89], [0.92, 0.95]];
  [-1, 1].forEach((s) => {
    const f = mesh(sideExtrude(fender, 0.16, 0.03), m.paint, `body_fender_${s > 0 ? 'l' : 'r'}`);
    f.position.x = s * 0.86;
    g.add(f);
  });

  // Roof and pillars.
  g.add(mesh(sideExtrude([[0.24, 1.385], [-0.86, 1.405], [-0.86, 1.455], [0.24, 1.435]], 1.5, 0.03), m.paint, 'body_roof'));
  [-1, 1].forEach((s) => {
    // A-pillar follows the windshield, C-pillar the rear window.
    const a = mesh(new THREE.BoxGeometry(0.07, 0.07, 0.84), m.paint, 'body_pillar_a', [s * 0.77, 1.17, 0.595]);
    a.rotation.x = 0.57;
    g.add(a);
    const c = mesh(new THREE.BoxGeometry(0.07, 0.07, 0.64), m.paint, 'body_pillar_c', [s * 0.77, 1.19, -1.09]);
    c.rotation.x = -0.76;
    g.add(c);
    g.add(mesh(new THREE.BoxGeometry(0.07, 0.46, 0.08), m.trim, 'body_pillar_b', [s * 0.79, 1.17, -0.08]));
  });

  // Interior: seats + dashboard (seen through the glass).
  [[-0.4, 0.3], [0.4, 0.3], [-0.4, -0.75], [0.4, -0.75]].forEach(([x, z], i) => {
    g.add(mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), m.interior, `body_interior_seat${i}`, [x, 1.0, z]));
    g.add(mesh(new THREE.BoxGeometry(0.46, 0.34, 0.1), m.interior, `body_interior_back${i}`, [x, 1.17, z - 0.24]));
  });
  g.add(mesh(new THREE.BoxGeometry(1.5, 0.16, 0.3), m.trim, 'body_interior_dash', [0, 1.06, 0.82]));

  // Exhausts.
  [-1, 1].forEach((s) => {
    const e = mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.2, 20), m.chrome, `body_exhaust_${s > 0 ? 'l' : 'r'}`, [s * 0.55, 0.3, -2.44]);
    e.rotation.x = Math.PI / 2;
    g.add(e);
  });
  return g;
}

function buildHood(m) {
  // Pivot sits on the hinge (rear edge of the hood).
  const pivot = new THREE.Group();
  pivot.name = 'hood';
  pivot.position.set(0, 0.995, 0.95);
  const geo = sideExtrude([[0, 0], [1.38, -0.1], [1.42, -0.15], [1.36, -0.16], [0, -0.05]], 1.68, 0.03);
  pivot.add(mesh(geo, m.paint, 'hood_panel'));
  return pivot;
}

function buildTrunk(m) {
  const pivot = new THREE.Group();
  pivot.name = 'trunk';
  pivot.position.set(0, 0.99, -1.32);
  const geo = sideExtrude([[0, 0], [-0.9, -0.05], [-1.04, -0.2], [-0.92, -0.16], [0, -0.05]], 1.68, 0.03);
  pivot.add(mesh(geo, m.paint, 'trunk_panel'));
  return pivot;
}

function buildDoor(m, side, front) {
  const g = new THREE.Group();
  g.name = `door_${front ? 'f' : 'r'}${side > 0 ? 'l' : 'r'}`;
  const z0 = front ? -0.04 : -1.08;
  const z1 = front ? 0.92 : -0.1;
  const geo = sideExtrude([[z0, 0.36], [z1, 0.36], [z1, 0.95], [z0, 0.97]], 0.06, 0.015);
  const panel = mesh(geo, m.paint, `${g.name}_panel`);
  g.add(panel);
  g.add(mesh(new THREE.BoxGeometry(0.03, 0.035, 0.16), m.chrome, `${g.name}_handle`, [side * 0.035, 0.82, z0 + 0.25]));
  g.add(mesh(new THREE.BoxGeometry(0.02, 0.025, z1 - z0 - 0.06), m.chrome, `${g.name}_trim`, [side * 0.03, 0.955, (z0 + z1) / 2]));
  if (front) {
    const mirror = mesh(new THREE.BoxGeometry(0.2, 0.12, 0.08), m.paint, `${g.name}_mirror`, [side * 0.12, 1.02, 0.74]);
    g.add(mirror);
  }
  g.position.x = side * 0.955;
  return g;
}

function buildWheel(m, name, x, z) {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(x, 0.36, z);
  const side = Math.sign(x);
  const tire = mesh(new THREE.TorusGeometry(0.28, 0.09, 20, 48), m.rubber, `${name}_tire`);
  tire.rotation.y = Math.PI / 2;
  tire.scale.set(1, 1, 1.35);
  g.add(tire);
  const rim = mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.2, 40), m.chrome, `${name}_rim`);
  rim.rotation.z = Math.PI / 2;
  g.add(rim);
  const disc = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.21, 32), m.disc, `${name}_disc`);
  disc.rotation.z = Math.PI / 2;
  g.add(disc);
  for (let i = 0; i < 6; i++) {
    const spoke = mesh(new THREE.BoxGeometry(0.04, 0.2, 0.05), m.chrome, `${name}_spoke${i}`);
    const a = (i / 6) * Math.PI * 2;
    spoke.position.set(side * 0.105, Math.cos(a) * 0.11, Math.sin(a) * 0.11);
    spoke.rotation.x = -a;
    g.add(spoke);
  }
  const hub = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 24), m.gold, `${name}_hub`);
  hub.rotation.z = Math.PI / 2;
  hub.position.x = side * 0.115;
  g.add(hub);
  return g;
}

function buildEngine(m) {
  const g = new THREE.Group();
  g.name = 'engine';
  g.add(mesh(new THREE.BoxGeometry(0.95, 0.16, 0.8), m.engine, 'engine_block', [0, 0.84, 1.62]));
  g.add(mesh(new THREE.BoxGeometry(0.74, 0.05, 0.62), m.engineCover, 'engine_cover', [0, 0.945, 1.62]));
  g.add(mesh(new THREE.BoxGeometry(0.5, 0.012, 0.05), m.gold, 'engine_badge', [0, 0.973, 1.52]));
  for (let i = 0; i < 4; i++) {
    const c = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 16), m.engine, `engine_coil${i}`, [-0.24 + i * 0.16, 0.99, 1.74]);
    g.add(c);
  }
  g.add(mesh(new THREE.BoxGeometry(0.3, 0.12, 0.3), m.trim, 'engine_airbox', [-0.6, 0.86, 1.95]));
  const cap = mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.045, 24), m.gold, 'engine_oil_cap', [0.26, 0.99, 1.48]);
  g.add(cap);
  return g;
}

function buildFront(m) {
  const items = [];
  const bumper = mesh(sideExtrude([[2.22, 0.28], [2.5, 0.31], [2.52, 0.5], [2.3, 0.52]], 1.86, 0.05), m.paint, 'bumper_front');
  items.push(bumper);
  const grille = new THREE.Group();
  grille.name = 'grille';
  grille.add(mesh(new THREE.BoxGeometry(0.95, 0.17, 0.05), m.trim, 'grille_mesh', [0, 0.6, 2.45]));
  grille.add(mesh(new THREE.BoxGeometry(1.0, 0.02, 0.06), m.chrome, 'grille_frame_top', [0, 0.69, 2.45]));
  grille.add(mesh(new THREE.BoxGeometry(1.0, 0.02, 0.06), m.chrome, 'grille_frame_bottom', [0, 0.51, 2.45]));
  for (let i = 0; i < 7; i++) grille.add(mesh(new THREE.BoxGeometry(0.012, 0.15, 0.06), m.chrome, `grille_bar${i}`, [-0.42 + i * 0.14, 0.6, 2.455]));
  items.push(grille);
  [-1, 1].forEach((s) => {
    const h = mesh(new THREE.BoxGeometry(0.44, 0.075, 0.08), m.headlight.clone(), `headlight_${s > 0 ? 'l' : 'r'}`, [s * 0.64, 0.71, 2.36]);
    h.rotation.y = s * 0.28;
    items.push(h);
  });
  return items;
}

function buildRear(m) {
  const items = [];
  items.push(mesh(sideExtrude([[-2.5, 0.3], [-2.24, 0.28], [-2.3, 0.52], [-2.52, 0.5]], 1.86, 0.05), m.paint, 'bumper_rear'));
  const tl = m.taillight.clone();
  [-1, 1].forEach((s) => {
    const t = mesh(new THREE.BoxGeometry(0.5, 0.07, 0.06), tl, `taillight_${s > 0 ? 'l' : 'r'}`, [s * 0.6, 0.8, -2.43]);
    t.rotation.y = -s * 0.2;
    items.push(t);
  });
  items.push(mesh(new THREE.BoxGeometry(0.7, 0.025, 0.04), tl, 'taillight_bar', [0, 0.82, -2.46]));
  return items;
}

export function createProceduralCar() {
  const m = materials();
  const car = new THREE.Group();
  car.name = 'car';
  car.add(buildBody(m));
  car.add(buildHood(m));
  car.add(buildTrunk(m));
  car.add(buildEngine(m));
  [-1, 1].forEach((s) => {
    car.add(buildDoor(m, s, true));
    car.add(buildDoor(m, s, false));
  });
  car.add(buildWheel(m, 'wheel_fl', 0.83, 1.45));
  car.add(buildWheel(m, 'wheel_fr', -0.83, 1.45));
  car.add(buildWheel(m, 'wheel_rl', 0.83, -1.45));
  car.add(buildWheel(m, 'wheel_rr', -0.83, -1.45));
  buildFront(m).forEach((o) => car.add(o));
  buildRear(m).forEach((o) => car.add(o));
  const glass = mesh(sideExtrude([[0.94, 0.95], [0.25, 1.39], [-0.86, 1.41], [-1.32, 0.97]], 1.56, 0.05), m.glass, 'glass_cabin');
  glass.castShadow = false;
  car.add(glass);
  return car;
}
