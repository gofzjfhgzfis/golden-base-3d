import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createRenderer, getEnvironment, fitToCanvas } from './core.js';
import { getBottle } from './bottles.js';
import { featuredProducts } from '../data/products.js';
import { clamp, smoothstep, isMobile, lerp } from '../utils.js';
import { onLangChange } from '../i18n/i18n.js';

gsap.registerPlugin(ScrollTrigger);

/** Flowing "liquid gold silk" background shader. */
function createBackground() {
  const material = new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uShift: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uShift;
      void main() {
        vec2 p = vUv * vec2(3.2, 2.0) + vec2(uShift * 0.6, 0.0);
        for (int i = 1; i < 5; i++) {
          float fi = float(i);
          p += vec2(0.55 / fi * sin(fi * p.y + uTime * 0.16 + 0.3 * fi) + 0.8,
                    0.4 / fi * sin(fi * p.x + uTime * 0.13 + 0.3 * fi) - 1.6);
        }
        float v = 0.5 + 0.5 * sin(p.x + p.y);
        float silk = pow(v, 9.0);
        vec3 base = vec3(0.027, 0.027, 0.035);
        vec3 gold = vec3(0.79, 0.64, 0.29);
        vec3 col = base + gold * silk * 0.42 + gold * pow(v, 3.0) * 0.05;
        float vig = smoothstep(1.15, 0.2, length(vUv - 0.5) * 1.6);
        gl_FragColor = vec4(col * (0.35 + 0.65 * vig), 1.0);
        #include <colorspace_fragment>
      }
    `
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  mesh.renderOrder = -1;
  return mesh;
}

/** Floating golden dust particles. */
function createDust(count) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
    seed[i] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPixel: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime;
      uniform float uPixel;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.y += mod(uTime * (0.05 + aSeed * 0.08) + aSeed * 7.0, 7.0) - 3.5;
        p.x += sin(uTime * 0.3 + aSeed * 20.0) * 0.2;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (2.0 + aSeed * 4.0) * uPixel * (6.0 / -mv.z);
        vAlpha = 0.25 + 0.5 * sin(uTime + aSeed * 30.0) * 0.5 + 0.25;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d) * vAlpha;
        gl_FragColor = vec4(0.95, 0.78, 0.4, a);
      }
    `
  });
  return new THREE.Points(geo, mat);
}

/** Glowing gold ring the bottles float above. */
function createPedestal() {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.25, 0.012, 16, 160),
    new THREE.MeshBasicMaterial({ color: '#E6C27A' })
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  const glowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(201,163,74,0.55)');
    grad.addColorStop(0.45, 'rgba(201,163,74,0.18)');
    grad.addColorStop(1, 'rgba(201,163,74,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 4.2),
    new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  glow.rotation.x = -Math.PI / 2;
  group.add(glow);
  return group;
}

export async function initHero({ onProgress } = {}) {
  const section = document.getElementById('hero');
  const pin = section.querySelector('.hero-pin');
  const canvas = document.getElementById('hero-canvas');
  const intro = section.querySelector('.hero-intro');
  const hint = section.querySelector('.scroll-hint');
  let panels = [];
  let dots = [];

  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  scene.environment = await getEnvironment(renderer);
  scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  camera.position.set(0, 0.2, 8);

  const bg = createBackground();
  scene.add(bg);
  const dust = createDust(isMobile() ? 90 : 220);
  dust.material.uniforms.uPixel.value = renderer.getPixelRatio();
  scene.add(dust);

  // Lights: soft key + rim + a sweeping "studio strip" that slides across the label.
  scene.add(new THREE.AmbientLight('#ffffff', 0.15));
  const key = new THREE.DirectionalLight('#fff4e0', 1.1);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#E6C27A', 2.2);
  rim.position.set(-4, 2, -3);
  scene.add(rim);
  const sweep = new THREE.SpotLight('#ffffff', 60, 14, 0.32, 0.6, 1.4);
  sweep.position.set(0, 1, 5);
  scene.add(sweep, sweep.target);

  const stage = new THREE.Group();
  scene.add(stage);
  const pedestal = createPedestal();
  pedestal.position.y = -1.2;
  stage.add(pedestal);

  // Load every featured bottle (model or procedural fallback).
  const bottles = [];
  for (let i = 0; i < featuredProducts.length; i++) {
    const b = await getBottle(featuredProducts[i], 2.25);
    const holder = new THREE.Group();
    b.position.y = -1.12;
    holder.add(b);
    holder.visible = false;
    stage.add(holder);
    bottles.push(holder);
    onProgress?.((i + 1) / featuredProducts.length);
  }

  const N = bottles.length;
  let target = -0.5;
  let current = -0.5;
  let visible = true;
  let paused = false;

  // Pin the hero and map scroll → p ∈ [-0.5, N - 0.5].
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${N * window.innerHeight}`,
    pin,
    scrub: true,
    onUpdate: (self) => {
      target = -0.5 + self.progress * N;
    }
  });

  // Panels/dots are re-rendered when the language changes, so (re)bind them.
  const bindOverlays = () => {
    panels = [...section.querySelectorAll('.hero-product')];
    dots = [...section.querySelectorAll('.hero-dots button')];
    dots.forEach((dot, i) =>
      dot.addEventListener('click', () => {
        const st = ScrollTrigger.getAll().find((s) => s.pin === pin);
        if (!st) return;
        const y = st.start + ((i + 0.5) / N) * (st.end - st.start);
        window.__lenis ? window.__lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: 'smooth' });
      })
    );
  };
  bindOverlays();
  onLangChange(bindOverlays);

  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(section);

  function layout() {
    if (!fitToCanvas(renderer, camera)) return;
    // Cover the view with the background plane.
    const dist = camera.position.z + 6;
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
    bg.scale.set(h * camera.aspect * 1.1, h * 1.1, 1);
    bg.position.set(0, 0, -6);

    const rtl = document.documentElement.dir === 'rtl';
    const mobile = camera.aspect < 0.9;
    // Bottle goes opposite to the text column.
    stage.position.x = mobile ? 0 : (rtl ? -1 : 1) * Math.min(2.2, 1.1 * camera.aspect);
    stage.position.y = mobile ? 1.05 : 0;
    stage.scale.setScalar(mobile ? 0.62 : 1);
  }

  const timer = new THREE.Timer();
  function tick(now) {
    requestAnimationFrame(tick);
    timer.update(now);
    if (!visible || paused) return;
    const time = timer.getElapsed();
    layout();
    current = lerp(current, target, 0.12);
    const p = current;

    bottles.forEach((holder, i) => {
      const t = p - i;
      const show = Math.abs(t) < 1.05;
      holder.visible = show;
      if (!show) return;
      // The first bottle already stands in the center during the intro.
      const tp = i === 0 ? Math.max(t, 0) : t;
      const e = Math.sign(tp) * Math.pow(Math.abs(tp), 1.4);
      holder.position.y = e * 4.2 + Math.sin(time * 1.3 + i) * 0.06;
      holder.position.z = -Math.abs(e) * 1.5;
      // One full turn while entering and one while leaving → the label faces the viewer at rest.
      const spin = i === 0 && t < 0 ? t * Math.PI * 4 : t * Math.PI * 2;
      holder.rotation.y = -0.45 + spin + Math.sin(time * 0.6) * 0.06;
      holder.rotation.z = Math.sin(time * 0.9 + i) * 0.03;
      holder.scale.setScalar(1 - Math.abs(e) * 0.25);
    });

    // The studio strip slides across the label as you scroll.
    const local = p - Math.round(p);
    sweep.position.set(Math.sin(local * Math.PI) * 4.5, 1.2, 4.5);
    sweep.target.position.set(stage.position.x, 0, 0);
    pedestal.rotation.y = time * 0.2;
    pedestal.children[0].material.color.setHSL(0.11, 0.6, 0.62 + Math.sin(time * 2) * 0.06);

    bg.material.uniforms.uTime.value = time;
    bg.material.uniforms.uShift.value = p * 0.35;
    dust.material.uniforms.uTime.value = time;

    // HTML overlays follow the same progress value.
    intro.style.opacity = String(1 - smoothstep(-0.4, -0.15, p));
    intro.style.transform = `translateY(${-smoothstep(-0.5, -0.1, p) * 40}px)`;
    intro.style.pointerEvents = p < -0.3 ? 'auto' : 'none';
    hint.style.opacity = String(1 - smoothstep(-0.45, -0.3, p));
    const active = clamp(Math.round(p), 0, N - 1);
    panels.forEach((el, i) => {
      const d = Math.abs(p - i);
      const o = i === 0 ? smoothstep(-0.28, -0.05, p) * (1 - smoothstep(0.28, 0.45, d)) : 1 - smoothstep(0.28, 0.45, d);
      el.style.opacity = String(o);
      el.style.transform = `translateY(${(p - i) * -60}px)`;
      el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === active && p > -0.2));

    renderer.render(scene, camera);
  }
  tick();
  window.addEventListener('resize', () => ScrollTrigger.refresh());

  return {
    setPaused(v) {
      paused = v;
    }
  };
}
