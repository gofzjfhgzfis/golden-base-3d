import * as THREE from 'three';
import { gsap } from 'gsap';
import { carPartsConfig as cfg } from '../data/carParts.js';

/**
 * Turns a car object (GLB or procedural) into movable "units", using src/data/carParts.js.
 * Stores every unit's original transform so it can fly back to exactly where it was.
 */

const lower = (s) => (s || '').toLowerCase();
const matchGroup = (name) => cfg.groups.find((g) => g.keywords.some((k) => lower(name).includes(k)));
const matchesAny = (name, keywords) => keywords.some((k) => lower(name).includes(k));

/** Rotate/scale/center a loaded model so its nose points to +Z, length = cfg.targetLength, wheels on y = 0. */
export function normalizeCar(root) {
  const rot = { '+z': 0, '-z': Math.PI, '+x': -Math.PI / 2, '-x': Math.PI / 2 }[cfg.forward] ?? 0;
  root.rotation.y += rot;
  root.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  root.scale.multiplyScalar(cfg.targetLength / Math.max(size.x, size.y, size.z));
  root.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(root);
  const c = box.getCenter(new THREE.Vector3());
  root.position.x -= c.x;
  root.position.z -= c.z;
  root.position.y -= box.min.y;
  root.updateMatrixWorld(true);
}

export function analyzeCar(root) {
  const names = [];
  root.traverse((o) => o.isMesh && names.push(o.name || '(unnamed)'));
  console.info('[car] mesh names (copy them into src/data/carParts.js):', names);

  const units = [];
  const visit = (node) => {
    node.children.forEach((child) => {
      const group = matchGroup(child.name);
      if (group) units.push({ obj: child, group: group.key, distance: group.explode });
      else if (child.isMesh) units.push({ obj: child, group: null, distance: cfg.defaultExplode });
      else visit(child);
    });
  };
  visit(root);

  root.updateMatrixWorld(true);
  const carBox = new THREE.Box3().setFromObject(root);
  const center = carBox.getCenter(new THREE.Vector3());

  // Wrap every hood unit in a pivot placed on the hood's rear edge so it can open.
  const hoodUnits = units.filter((u) => u.group === 'hood');
  let hoodPivot = null;
  if (hoodUnits.length) {
    const hb = new THREE.Box3();
    hoodUnits.forEach((u) => hb.expandByObject(u.obj));
    hoodPivot = new THREE.Group();
    hoodPivot.name = 'hood_pivot';
    root.add(hoodPivot);
    hoodPivot.position.copy(root.worldToLocal(new THREE.Vector3((hb.min.x + hb.max.x) / 2, hb.max.y, hb.min.z)));
    root.updateMatrixWorld(true);
    hoodUnits.forEach((u) => hoodPivot.attach(u.obj));
    units.splice(0, units.length, ...units.filter((u) => u.group !== 'hood'));
    units.push({ obj: hoodPivot, group: 'hood', distance: cfg.groups.find((g) => g.key === 'hood').explode });
  }

  // Remember original transforms + compute the exploded transforms.
  units.forEach((u, i) => {
    const o = u.obj;
    u.origPos = o.position.clone();
    u.origQuat = o.quaternion.clone();
    if (!u.distance) return;
    const wc = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
    const dir = wc.clone().sub(center);
    dir.y = Math.max(dir.y, 0) + 0.45;
    if (dir.lengthSq() < 1e-4) dir.set(0, 1, 0);
    dir.normalize();
    const worldPos = o.getWorldPosition(new THREE.Vector3());
    const targetWorld = worldPos.clone().add(dir.multiplyScalar(u.distance));
    u.explodedPos = o.parent.worldToLocal(targetWorld);
    const rand = (s) => (Math.sin(i * 12.9898 + s) * 43758.5453) % 1;
    const delta = new THREE.Quaternion().setFromEuler(new THREE.Euler(rand(1) * 0.35, rand(2) * 0.35, rand(3) * 0.35));
    u.explodedQuat = u.origQuat.clone().multiply(delta);
  });

  // Special points.
  let oilCap = null;
  let exhaust = null;
  const lightsFront = [];
  const lightsRear = [];
  root.traverse((o) => {
    if (!oilCap && matchesAny(o.name, cfg.oilCapKeywords)) oilCap = o;
    if (!exhaust && matchesAny(o.name, cfg.exhaustKeywords)) exhaust = o;
    if (o.isMesh) {
      const g = matchGroup(o.name) || matchGroup(o.parent?.name);
      if (g?.key === 'lightsFront') lightsFront.push(o);
      if (g?.key === 'lightsRear') lightsRear.push(o);
    }
  });
  const engineUnit = units.find((u) => u.group === 'engine');

  /** World position where the oil goes in. */
  const oilCapWorld = () => {
    if (oilCap) {
      const b = new THREE.Box3().setFromObject(oilCap);
      return new THREE.Vector3((b.min.x + b.max.x) / 2, b.max.y, (b.min.z + b.max.z) / 2);
    }
    const b = engineUnit
      ? new THREE.Box3().setFromObject(engineUnit.obj)
      : new THREE.Box3(new THREE.Vector3(-0.3, 0, carBox.max.z * 0.45), new THREE.Vector3(0.3, carBox.max.y * 0.62, carBox.max.z * 0.7));
    return new THREE.Vector3((b.min.x + b.max.x) / 2, b.max.y, (b.min.z + b.max.z) / 2);
  };
  const exhaustWorld = () =>
    exhaust
      ? exhaust.getWorldPosition(new THREE.Vector3())
      : new THREE.Vector3(carBox.max.x * 0.55, carBox.min.y + 0.3, carBox.min.z);

  return { units, hoodPivot, center, carBox, oilCapWorld, exhaustWorld, oilCap, lightsFront, lightsRear };
}

const hoverTweens = new Set();

function stopHover() {
  hoverTweens.forEach((t) => t.kill());
  hoverTweens.clear();
}

function tweenQuat(obj, from, to, vars) {
  const proxy = { t: 0 };
  return gsap.to(proxy, {
    t: 1,
    ...vars,
    onUpdate: () => obj.quaternion.slerpQuaternions(from, to, proxy.t)
  });
}

export function explode(parts) {
  stopHover();
  const tl = gsap.timeline();
  const movable = parts.units.filter((u) => u.distance);
  movable.forEach((u, i) => {
    const at = i * 0.045;
    tl.to(u.obj.position, { ...u.explodedPos, duration: 1.2, ease: 'power3.out' }, at);
    tl.add(tweenQuat(u.obj, u.obj.quaternion.clone(), u.explodedQuat, { duration: 1.2, ease: 'power3.out' }), at);
  });
  tl.call(() =>
    movable.forEach((u, i) => {
      hoverTweens.add(
        gsap.to(u.obj.position, {
          y: u.explodedPos.y + 0.05 + (i % 3) * 0.015,
          duration: 1.4 + (i % 5) * 0.2,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        })
      );
    })
  );
  return tl;
}

export function reassemble(parts) {
  stopHover();
  const tl = gsap.timeline();
  const movable = parts.units.filter((u) => u.distance);
  [...movable].reverse().forEach((u, i) => {
    const at = i * 0.035;
    gsap.killTweensOf(u.obj.position);
    tl.to(u.obj.position, { x: u.origPos.x, y: u.origPos.y, z: u.origPos.z, duration: 1.0, ease: 'power3.inOut' }, at);
    tl.add(tweenQuat(u.obj, u.obj.quaternion.clone(), u.origQuat, { duration: 1.0, ease: 'power3.inOut' }), at);
  });
  return tl;
}

/** Instantly put every part back (used when the experience is closed/reset). */
export function snapAssembled(parts) {
  stopHover();
  parts.units.forEach((u) => {
    gsap.killTweensOf(u.obj.position);
    u.obj.position.copy(u.origPos);
    u.obj.quaternion.copy(u.origQuat);
  });
  if (parts.hoodPivot) {
    gsap.killTweensOf(parts.hoodPivot.rotation);
  }
}

export function setHood(parts, open, duration = 0.9) {
  if (!parts.hoodPivot) return gsap.timeline();
  const angle = open ? -THREE.MathUtils.degToRad(cfg.hoodOpenAngle) : 0;
  const q = parts.hoodPivot.userData.baseQuat || (parts.hoodPivot.userData.baseQuat = parts.hoodPivot.quaternion.clone());
  const target = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), angle));
  return tweenQuat(parts.hoodPivot, parts.hoodPivot.quaternion.clone(), target, { duration, ease: 'power2.inOut' });
}
