import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createRenderer, getEnvironment, fitToCanvas, loadOptionalGLB } from '../three/core.js';
import { getBottle } from '../three/bottles.js';
import { carPartsConfig } from '../data/carParts.js';
import { visibleProducts, brands, oilColors, productTitle } from '../data/products.js';
import { createProceduralCar } from './proceduralCar.js';
import { normalizeCar, analyzeCar, explode, reassemble, snapAssembled, setHood } from './parts.js';
import { OilStream, Splash, Exhaust } from './effects.js';
import { EngineAudio } from './engineAudio.js';
import { t, onLangChange } from '../i18n/i18n.js';
import { contact } from '../i18n/translations.js';
import { asset, esc, isMobile } from '../utils.js';

/**
 * "Oil Change Experience": disassemble → choose oil → reassemble → pour → engine start.
 * Loaded lazily the first time the overlay opens.
 */
export async function createExperience(root) {
  const canvas = root.querySelector('#exp-canvas');
  const ui = {
    status: root.querySelector('.exp-status'),
    steps: [...root.querySelectorAll('.exp-steps li')],
    disassemble: root.querySelector('[data-action="disassemble"]'),
    picker: root.querySelector('.exp-picker'),
    pickerChips: root.querySelector('.exp-picker-chips'),
    pickerGrid: root.querySelector('.exp-picker-grid'),
    final: root.querySelector('.exp-final'),
    finalText: root.querySelector('.exp-final-text'),
    replay: root.querySelector('[data-action="replay"]'),
    another: root.querySelector('[data-action="another"]'),
    order: root.querySelector('[data-action="order"]'),
    mute: root.querySelector('[data-action="mute"]'),
    loading: root.querySelector('.exp-loading'),
    loadingBar: root.querySelector('.exp-loading-bar span'),
    hint: root.querySelector('.exp-hint')
  };

  // ── Renderer, scene, camera ────────────────────────────────────────
  const renderer = createRenderer(canvas);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#09090b');
  scene.fog = new THREE.Fog('#09090b', 12, 26);
  scene.environment = await getEnvironment(renderer);
  scene.environmentIntensity = 0.42;

  const camera = new THREE.PerspectiveCamera(isMobile() ? 48 : 36, 1, 0.1, 80);
  const homeCam = new THREE.Vector3(6.2, 2.5, 7.4).multiplyScalar(isMobile() ? 1.15 : 1);
  camera.position.copy(homeCam);
  // No bloom here: glossy paint under studio strips would bloom everywhere; the lights get halo sprites instead.
  const pipeline = { render: () => renderer.render(scene, camera), setSize() {} };
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 4.2;
  controls.maxDistance = 13;
  controls.minPolarAngle = 0.25;
  controls.maxPolarAngle = 1.45;
  controls.target.set(0, 0.7, 0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    ui.hint.classList.add('gone');
  });

  // Floor, soft contact shadow and a gold ring.
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(16, 64),
    new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.78, metalness: 0.05, envMapIntensity: 0.12 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const aoTex = (() => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 128, 10, 64, 128, 128);
    grad.addColorStop(0, 'rgba(0,0,0,0.85)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 256);
    return new THREE.CanvasTexture(c);
  })();
  const ao = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 5.8), new THREE.MeshBasicMaterial({ map: aoTex, transparent: true, depthWrite: false }));
  ao.rotation.x = -Math.PI / 2;
  ao.position.y = 0.002;
  scene.add(ao);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.9, 0.012, 8, 200), new THREE.MeshBasicMaterial({ color: '#C9A34A' }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.005;
  scene.add(ring);

  scene.add(new THREE.HemisphereLight('#ffffff', '#1a1408', 0.12));
  const key = new THREE.DirectionalLight('#ffffff', 0.9);
  key.position.set(3, 7, 4);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(isMobile() ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 18 });
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight('#E6C27A', 0.9);
  rim.position.set(-5, 3, -5);
  scene.add(rim);

  // ── Car ────────────────────────────────────────────────────────────
  const setLoad = (k) => (ui.loadingBar.style.width = `${Math.round(k * 100)}%`);
  setLoad(0.1);
  const gltf = await loadOptionalGLB(carPartsConfig.modelPath, (k) => setLoad(0.1 + k * 0.8));
  let car;
  if (gltf) {
    car = gltf.scene;
    normalizeCar(car);
    car.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = o.receiveShadow = true;
        if (o.material) o.material.envMapIntensity = 1.2;
      }
    });
  } else {
    car = createProceduralCar();
  }
  const carWrap = new THREE.Group();
  carWrap.add(car);
  scene.add(carWrap);
  scene.updateMatrixWorld(true);
  const parts = analyzeCar(car);
  setLoad(1);

  // Lights: headlight + taillight materials and real spotlights for the beams.
  const uniqueMats = (meshes) => [...new Set(meshes.flatMap((m) => (Array.isArray(m.material) ? m.material : [m.material])))];
  const headMats = uniqueMats(parts.lightsFront);
  const tailMats = uniqueMats(parts.lightsRear);
  headMats.forEach((m) => m.emissive || (m.emissive = new THREE.Color('#ffffff')));
  tailMats.forEach((m) => m.emissive || (m.emissive = new THREE.Color('#ff1428')));
  const front = parts.carBox.max.z;
  const beamSpots = [-1, 1].map((s) => {
    const spot = new THREE.SpotLight('#fff6e5', 0, 18, 0.42, 0.55, 1.2);
    spot.position.set(s * parts.carBox.max.x * 0.66, parts.carBox.max.y * 0.5, front - 0.1);
    spot.target.position.set(s * 0.8, 0, front + 6);
    scene.add(spot, spot.target);
    return spot;
  });
  const tailGlow = new THREE.PointLight('#ff2030', 0, 3, 2);
  tailGlow.position.set(0, parts.carBox.max.y * 0.55, parts.carBox.min.z - 0.3);
  scene.add(tailGlow);
  const capGlow = new THREE.PointLight('#F2C14E', 0, 2.2, 2);
  scene.add(capGlow);

  // Soft glow halos on every headlight / taillight, attached so they follow the parts.
  const glowTexture = (inner, outer) => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.25, outer);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
  const halos = [];
  const addHalos = (meshes, tex, size) =>
    meshes.forEach((m) => {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      const ws = m.getWorldScale(new THREE.Vector3());
      sprite.scale.set(size / ws.x, size / ws.y, 1);
      m.add(sprite);
      halos.push(sprite);
    });
  addHalos(parts.lightsFront, glowTexture('rgba(255,255,255,1)', 'rgba(255,240,210,0.45)'), 1.1);
  addHalos(parts.lightsRear, glowTexture('rgba(255,90,90,1)', 'rgba(255,20,40,0.45)'), 0.7);

  const stream = new OilStream(scene);
  const splash = new Splash(scene);
  const smoke = new Exhaust(scene);
  const audio = new EngineAudio();

  // ── State + UI helpers ─────────────────────────────────────────────
  let running = false;
  let busy = false;
  let product = null;
  let statusKey = 'exp.intro';
  let statusVars = {};
  let vibration = 0;
  let rig = null;
  const activeTweens = new Set();
  const track = (tw) => (activeTweens.add(tw), tw);

  const setStep = (n) =>
    ui.steps.forEach((li, i) => {
      li.classList.toggle('active', i === n - 1);
      li.classList.toggle('done', i < n - 1);
    });
  const setStatus = (key, vars = {}) => {
    statusKey = key;
    statusVars = vars;
    ui.status.textContent = key ? t(key, vars) : '';
  };
  const show = (el, v) => el.classList.toggle('is-visible', v);
  onLangChange(() => {
    setStatus(statusKey, statusVars);
    if (product) ui.finalText.textContent = t('exp.final', { name: productTitle(product) });
  });

  function moveCamera(pos, target, duration = 1.4) {
    controls.enabled = false;
    controls.autoRotate = false;
    const tl = gsap.timeline({ onComplete: () => (controls.enabled = true) });
    tl.to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration, ease: 'power2.inOut' }, 0);
    tl.to(controls.target, { x: target.x, y: target.y, z: target.z, duration, ease: 'power2.inOut' }, 0);
    return track(tl);
  }
  const wait = (s) => new Promise((r) => track(gsap.delayedCall(s, r)));

  // ── Product picker ─────────────────────────────────────────────────
  let pickerBrand = 'all';
  function renderPicker() {
    const brandKeys = [...new Set(visibleProducts.map((p) => p.brand))];
    ui.pickerChips.innerHTML = ['all', ...brandKeys]
      .map(
        (b) =>
          `<button type="button" class="chip${b === pickerBrand ? ' active' : ''}" data-brand="${b}">${
            b === 'all' ? esc(t('products.allBrands')) : esc(brands[b].name)
          }</button>`
      )
      .join('');
    ui.pickerGrid.innerHTML = visibleProducts
      .filter((p) => pickerBrand === 'all' || p.brand === pickerBrand)
      .map(
        (p) => `<button type="button" class="pick-card" data-id="${p.id}" style="--accent:${p.accent}">
          <img src="${asset(p.image)}" alt="${esc(productTitle(p))}" loading="lazy" decoding="async">
          <span class="pick-brand">${esc(brands[p.brand].name)}</span>
          <span class="pick-grade" dir="ltr">${esc(p.viscosity)}</span>
          <span class="pick-name">${esc(p.name)}${p.size ? ` · <bdi>${esc(p.size)}</bdi>` : ''}</span>
        </button>`
      )
      .join('');
  }
  ui.pickerChips.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-brand]');
    if (!chip) return;
    pickerBrand = chip.dataset.brand;
    renderPicker();
  });
  ui.pickerGrid.addEventListener('click', (e) => {
    const card = e.target.closest('[data-id]');
    if (!card || busy) return;
    const chosen = visibleProducts.find((p) => p.id === card.dataset.id);
    show(ui.picker, false);
    runSequence(chosen);
  });
  onLangChange(renderPicker);
  renderPicker();

  // ── Sequence steps ─────────────────────────────────────────────────
  async function disassemble() {
    setStep(1);
    setStatus(null);
    show(ui.disassemble, false);
    // Look slightly below the car so the floating parts sit above the product picker.
    moveCamera(new THREE.Vector3(7.2, 4.6, 8.6).multiplyScalar(isMobile() ? 1.2 : 1), new THREE.Vector3(0, -0.9, 0), 1.6);
    await track(explode(parts));
  }

  async function pour(p) {
    const color = new THREE.Color(oilColors[p.kind] || oilColors.engine);
    const cap = parts.oilCapWorld();
    setStatus('exp.pouring', { name: productTitle(p) });
    moveCamera(cap.clone().add(new THREE.Vector3(2.9, 1.7, 1.7)), cap.clone().add(new THREE.Vector3(0, 0.3, 0)), 1.4);
    await track(setHood(parts, true));

    // Open the oil filler cap.
    const capObj = parts.oilCap;
    const capStart = capObj?.position.clone();
    if (capObj) await track(gsap.to(capObj.position, { y: capStart.y + 0.14, x: capStart.x + 0.12, duration: 0.4, ease: 'power2.out' }));

    // Bottle rig: neck sits at the rig origin so tilting keeps the neck over the cap.
    const bottle = await getBottle(p, 0.62);
    rig = new THREE.Group();
    const tilt = new THREE.Group();
    rig.rotation.y = Math.PI / 2; // label faces the camera side (+x)
    rig.add(tilt);
    tilt.add(bottle);
    bottle.position.sub(bottle.userData.neckTopWorldLocal);
    const pourPos = cap.clone().add(new THREE.Vector3(0, 0.34, -0.22));
    rig.position.copy(cap.clone().add(new THREE.Vector3(1.2, 1.4, -0.8)));
    rig.scale.setScalar(0.001);
    scene.add(rig);
    await track(
      gsap
        .timeline()
        .to(rig.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'back.out(1.6)' }, 0)
        .to(rig.position, { x: pourPos.x, y: pourPos.y, z: pourPos.z, duration: 1.0, ease: 'power3.out' }, 0)
        .to(rig.rotation, { x: 0.08, duration: 1.0 }, 0)
    );
    if (bottle.userData.cap) bottle.userData.cap.visible = false;
    await track(gsap.to(tilt.rotation, { z: 2.2, duration: 0.8, ease: 'power2.inOut' }));

    // Stream from the neck to the cap.
    scene.updateMatrixWorld(true);
    const neck = rig.getWorldPosition(new THREE.Vector3());
    const neckDir = new THREE.Vector3(0, 1, 0).applyQuaternion(bottle.getWorldQuaternion(new THREE.Quaternion()));
    stream.build(neck, cap.clone().add(new THREE.Vector3(0, 0.02, 0)), neckDir, color);
    splash.origin.copy(cap).add(new THREE.Vector3(0, 0.03, 0));
    capGlow.position.copy(cap).add(new THREE.Vector3(0, 0.15, 0));
    capGlow.color.copy(color).lerp(new THREE.Color('#E6C27A'), 0.5);
    const range = { s: 0, e: 0 };
    const upd = () => stream.setRange(range.s, range.e);
    await track(gsap.to(range, { e: 1, duration: 0.45, ease: 'power1.in', onUpdate: upd }));
    splash.active = true;
    track(gsap.to(capGlow, { intensity: 3, duration: 0.3 }));
    await track(gsap.to(tilt.rotation, { z: 2.35, duration: 2.2, ease: 'sine.inOut' }));
    splash.active = false;
    track(gsap.to(capGlow, { intensity: 0, duration: 0.5 }));
    await track(gsap.to(range, { s: 1, duration: 0.4, ease: 'power1.in', onUpdate: upd }));
    stream.clear();

    // Put everything back.
    await track(gsap.to(tilt.rotation, { z: 0, duration: 0.6, ease: 'power2.inOut' }));
    if (bottle.userData.cap) bottle.userData.cap.visible = true;
    await track(
      gsap
        .timeline()
        .to(rig.position, { y: rig.position.y + 1.2, x: rig.position.x + 0.8, duration: 0.7, ease: 'power2.in' }, 0)
        .to(rig.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.5, ease: 'power2.in' }, 0.2)
    );
    scene.remove(rig);
    rig = null;
    if (capObj) await track(gsap.to(capObj.position, { x: capStart.x, y: capStart.y, z: capStart.z, duration: 0.35 }));
    await track(setHood(parts, false));
  }

  async function startEngine() {
    setStatus('exp.starting');
    moveCamera(new THREE.Vector3(3.4, 1.3, 5.6), new THREE.Vector3(0, 0.65, 0.6), 1.3);
    await wait(0.9);
    audio.start();
    // Crank: a little shake while the starter turns.
    vibration = 0.006;
    await wait(1.0);
    // Ignition: lights flicker on, engine catches, smoke starts.
    const lit = { k: 0 };
    track(
      gsap
        .timeline({ onUpdate: () => applyLights(lit.k) })
        .to(lit, { k: 0.7, duration: 0.06 })
        .to(lit, { k: 0.1, duration: 0.07 })
        .to(lit, { k: 1, duration: 0.25 })
    );
    vibration = 0.02;
    track(gsap.to({ v: 0.02 }, { v: 0.0045, duration: 1.8, ease: 'power2.out', onUpdate() { vibration = this.targets()[0].v; } }));
    smoke.origin.copy(parts.exhaustWorld());
    smoke.active = true;
    await wait(1.4);
  }

  function applyLights(k) {
    headMats.forEach((m) => (m.emissiveIntensity = 4 * k));
    tailMats.forEach((m) => (m.emissiveIntensity = 3.5 * k));
    beamSpots.forEach((s) => (s.intensity = 70 * k));
    tailGlow.intensity = 2.5 * k;
    halos.forEach((h) => (h.material.opacity = 0.9 * k));
  }

  function stopEngine() {
    audio.stop();
    applyLights(0);
    vibration = 0;
    smoke.active = false;
  }

  async function runSequence(p) {
    busy = true;
    product = p;
    ui.order.href = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
      t('products.orderMessage', { name: productTitle(p), viscosity: p.viscosity, size: p.size || '' })
    )}`;
    try {
      setStep(3);
      setStatus('exp.reassembling');
      moveCamera(homeCam, new THREE.Vector3(0, 0.7, 0), 1.2);
      await track(reassemble(parts));
      setStep(4);
      await pour(p);
      setStep(5);
      await startEngine();
      setStatus(null);
      ui.finalText.textContent = t('exp.final', { name: productTitle(p) });
      show(ui.final, true);
      setStep(6);
    } finally {
      busy = false;
    }
  }

  async function chooseAnother() {
    if (busy) return;
    busy = true;
    show(ui.final, false);
    stopEngine();
    await disassemble();
    setStep(2);
    setStatus('exp.pickHint');
    show(ui.picker, true);
    busy = false;
  }

  async function replay() {
    if (busy || !product) return;
    busy = true;
    show(ui.final, false);
    stopEngine();
    await disassemble();
    busy = false;
    runSequence(product);
  }

  ui.disassemble.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    audio.ensure(); // unlock audio inside the click
    await disassemble();
    setStep(2);
    setStatus('exp.pickHint');
    show(ui.picker, true);
    busy = false;
  });
  ui.replay.addEventListener('click', replay);
  ui.another.addEventListener('click', chooseAnother);
  ui.mute.addEventListener('click', () => {
    audio.setMuted(!audio.muted);
    ui.mute.setAttribute('aria-pressed', String(audio.muted));
    const label = ui.mute.querySelector('span');
    label.dataset.i18n = audio.muted ? 'exp.unmute' : 'exp.mute';
    label.textContent = t(label.dataset.i18n);
  });

  // ── Render loop ────────────────────────────────────────────────────
  const timer = new THREE.Timer();
  function tick(now) {
    if (!running) return;
    requestAnimationFrame(tick);
    timer.update(now);
    const dt = Math.min(timer.getDelta(), 0.05);
    const time = timer.getElapsed();
    fitToCanvas(renderer, camera, pipeline);
    controls.update();
    carWrap.position.y = vibration * (Math.sin(time * 58) * 0.6 + (Math.random() - 0.5) * 0.8);
    carWrap.rotation.z = vibration * 0.5 * Math.sin(time * 37);
    splash.tick(dt);
    smoke.tick(dt);
    pipeline.render();
  }

  function reset() {
    activeTweens.forEach((tw) => tw.kill());
    activeTweens.clear();
    stopEngine();
    stream.clear();
    splash.clear();
    smoke.clear();
    snapAssembled(parts);
    if (rig) scene.remove(rig);
    rig = null;
    if (parts.oilCap) parts.oilCap.position.copy(parts.oilCap.userData.home || (parts.oilCap.userData.home = parts.oilCap.position.clone()));
    camera.position.copy(homeCam);
    controls.target.set(0, 0.7, 0);
    controls.enabled = true;
    controls.autoRotate = true;
    busy = false;
    product = null;
    setStep(0);
    setStatus('exp.intro');
    show(ui.picker, false);
    show(ui.final, false);
    show(ui.disassemble, true);
    ui.hint.classList.remove('gone');
  }

  ui.loading.classList.add('done');
  reset();

  return {
    start() {
      if (running) return;
      running = true;
      timer.reset();
      requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      reset();
    }
  };
}
