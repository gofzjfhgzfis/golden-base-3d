import * as THREE from 'three';

/** Oil stream: a tube that grows from the bottle neck to the oil cap, plus a soft golden glow. */
export class OilStream {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.core = null;
    this.glow = null;
    this.total = 0;
  }

  build(from, to, neckDir, color) {
    this.clear();
    const control = from.clone().add(neckDir.clone().multiplyScalar(0.16));
    const curve = new THREE.QuadraticBezierCurve3(from, control, to);
    const coreGeo = new THREE.TubeGeometry(curve, 80, 0.016, 12, false);
    const glowGeo = new THREE.TubeGeometry(curve, 80, 0.045, 12, false);
    this.total = coreGeo.index.count;
    this.core = new THREE.Mesh(
      coreGeo,
      new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.45,
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.05
      })
    );
    this.glow = new THREE.Mesh(
      glowGeo,
      new THREE.MeshBasicMaterial({
        color: '#E6C27A',
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    [this.core, this.glow].forEach((m) => {
      m.geometry.setDrawRange(0, 0);
      this.group.add(m);
    });
  }

  /** start/end in 0..1 along the stream. */
  setRange(start, end) {
    if (!this.core) return;
    const s = Math.floor(start * this.total / 3) * 3;
    const e = Math.floor(end * this.total / 3) * 3;
    [this.core, this.glow].forEach((m) => m.geometry.setDrawRange(s, Math.max(0, e - s)));
  }

  clear() {
    this.group.children.slice().forEach((m) => {
      m.geometry.dispose();
      m.material.dispose();
      this.group.remove(m);
    });
    this.core = this.glow = null;
  }
}

/** Generic CPU particle system rendered as soft round points. */
class Particles {
  constructor(scene, count, { color, blending = THREE.NormalBlending, sizeScale = 1 }) {
    this.count = count;
    this.alive = new Float32Array(count);
    this.vel = new Float32Array(count * 3);
    this.life = new Float32Array(count);
    this.maxLife = new Float32Array(count);
    const geo = new THREE.BufferGeometry();
    this.pos = new Float32Array(count * 3);
    this.alpha = new Float32Array(count);
    this.size = new Float32Array(count);
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending,
      uniforms: { uColor: { value: new THREE.Color(color) }, uScale: { value: sizeScale } },
      vertexShader: /* glsl */ `
        attribute float aAlpha;
        attribute float aSize;
        uniform float uScale;
        varying float vAlpha;
        void main() {
          vAlpha = aAlpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uScale * (300.0 / -mv.z);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d) * vAlpha;
          if (a < 0.01) discard;
          gl_FragColor = vec4(uColor, a);
        }
      `
    });
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.cursor = 0;
  }

  spawn(origin, velocity, life, size) {
    const i = this.cursor;
    this.cursor = (this.cursor + 1) % this.count;
    this.pos.set([origin.x, origin.y, origin.z], i * 3);
    this.vel.set([velocity.x, velocity.y, velocity.z], i * 3);
    this.life[i] = 0;
    this.maxLife[i] = life;
    this.size[i] = size;
    this.alive[i] = 1;
  }

  update(dt, { gravity = 0, grow = 0, fade = (k) => 1 - k } = {}) {
    for (let i = 0; i < this.count; i++) {
      if (!this.alive[i]) {
        this.alpha[i] = 0;
        continue;
      }
      this.life[i] += dt;
      const k = this.life[i] / this.maxLife[i];
      if (k >= 1) {
        this.alive[i] = 0;
        this.alpha[i] = 0;
        continue;
      }
      this.vel[i * 3 + 1] -= gravity * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.size[i] += grow * dt;
      this.alpha[i] = fade(k);
    }
    const a = this.points.geometry.attributes;
    a.position.needsUpdate = a.aAlpha.needsUpdate = a.aSize.needsUpdate = true;
  }

  clear() {
    this.alive.fill(0);
    this.alpha.fill(0);
    this.points.geometry.attributes.aAlpha.needsUpdate = true;
  }
}

/** Golden droplets splashing around the oil cap while pouring. */
export class Splash extends Particles {
  constructor(scene) {
    super(scene, 120, { color: '#F2C14E', blending: THREE.AdditiveBlending, sizeScale: 0.06 });
    this.active = false;
    this.origin = new THREE.Vector3();
  }

  tick(dt) {
    if (this.active) {
      for (let n = 0; n < 3; n++) {
        const v = new THREE.Vector3((Math.random() - 0.5) * 0.6, 0.4 + Math.random() * 0.5, (Math.random() - 0.5) * 0.6);
        this.spawn(this.origin, v, 0.35 + Math.random() * 0.25, 0.6 + Math.random() * 0.8);
      }
    }
    this.update(dt, { gravity: 3.2 });
  }
}

/** Exhaust smoke from the tailpipe once the engine runs. */
export class Exhaust extends Particles {
  constructor(scene) {
    super(scene, 160, { color: '#b9bcc2', sizeScale: 0.22 });
    this.active = false;
    this.origin = new THREE.Vector3();
    this.acc = 0;
    this.rate = 26;
  }

  tick(dt) {
    if (this.active) {
      this.acc += dt * this.rate;
      while (this.acc > 1) {
        this.acc -= 1;
        const v = new THREE.Vector3((Math.random() - 0.5) * 0.25, 0.18 + Math.random() * 0.2, -0.7 - Math.random() * 0.6);
        this.spawn(this.origin, v, 1.4 + Math.random() * 0.8, 0.4 + Math.random() * 0.3);
      }
    }
    this.update(dt, { grow: 1.4, fade: (k) => (k < 0.15 ? k / 0.15 : 1 - k) * 0.35 });
  }
}
