/* =====================================================================
   MY TECHSTACK — physics balls labelled with your skills.
   Balls fall in when the section appears, cluster in the middle,
   collide with each other and get pushed away by the cursor.
   Labels come from DATA.techstack in index.html.
   ===================================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('techCanvas');
const holder = canvas.parentElement;
const NAMES = (window.TECHSTACK || ['React', 'Python', 'Node.js']).slice(0, 40);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0, 14);

scene.add(new THREE.HemisphereLight(0xffffff, 0x220308, 0.7));
const key = new THREE.DirectionalLight(0xffffff, 1.8); key.position.set(4, 6, 8); scene.add(key);
const rim = new THREE.PointLight(0xc8102e, 40, 30, 1.5); rim.position.set(-6, -3, 4); scene.add(rim);
const rim2 = new THREE.PointLight(0xff5a6e, 18, 30, 1.5); rim2.position.set(7, 4, 3); scene.add(rim2);

/* label texture: name printed twice around the ball */
function labelTex(name, dark) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = dark ? '#6e0a19' : '#f3f3f5'; g.fillRect(0, 0, 1024, 512);
  const fs = Math.max(48, Math.min(110, 720 / Math.max(3, name.length)));
  g.font = `700 ${fs}px "Space Grotesk", Arial, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = dark ? '#ffffff' : '#8e1022';
  g.fillText(name, 256, 256); g.fillText(name, 768, 256);
  // small accent band
  g.fillStyle = dark ? 'rgba(255,255,255,.18)' : 'rgba(142,16,34,.12)';
  g.fillRect(0, 330, 1024, 10);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

const balls = [];
const geo = new THREE.SphereGeometry(1, 48, 32);
NAMES.forEach((name, i) => {
  const dark = i % 5 === 2;
  const mat = new THREE.MeshPhysicalMaterial({ map: labelTex(name, dark), roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.15, sheen: 0.3, envMapIntensity: 0.9 });
  const m = new THREE.Mesh(geo, mat);
  const r = 0.55 + ((i * 37) % 10) / 10 * 0.45;
  m.scale.setScalar(r);
  m.rotation.set(Math.random() * 6, Math.random() * 6, 0);
  scene.add(m);
  balls.push({ m, r, p: new THREE.Vector3(), v: new THREE.Vector3(), started: false });
});
function resetDrop() {
  balls.forEach((b, i) => {
    b.p.set((Math.random() - 0.5) * 14, 8 + Math.random() * 6 + i * 0.12, (Math.random() - 0.5) * 2);
    b.v.set(0, -9 - Math.random() * 4, 0);
    b.m.position.copy(b.p);
  });
}
resetDrop();

/* pointer in world space (z = 0 plane) */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const mouse = new THREE.Vector3(999, 999, 0); let mouseActive = false;
holder.addEventListener('pointermove', e => {
  const r = holder.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera); ray.ray.intersectPlane(plane, mouse); mouseActive = true;
});
holder.addEventListener('pointerleave', () => { mouseActive = false; });

function resize() {
  const w = holder.clientWidth, h = holder.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.position.z = w / h < 0.9 ? 34 : 14;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

let visible = false, dropped = false, last = performance.now();
new IntersectionObserver(es => {
  visible = es[0].isIntersecting;
  if (visible && !dropped) { dropped = true; resetDrop(); }
}, { threshold: 0.15 }).observe(holder);

const center = new THREE.Vector3(0, -0.6, 0), tmp = new THREE.Vector3(), axis = new THREE.Vector3(), Z = new THREE.Vector3(0, 0, 1);
function step(dt) {
  for (const b of balls) {
    // pull toward the centre (spring) + slight gravity while falling
    tmp.subVectors(center, b.p);
    b.v.addScaledVector(tmp, 2.4 * dt);
    b.v.z += -b.p.z * 3 * dt;
    // cursor pushes balls away
    if (mouseActive) {
      tmp.subVectors(b.p, mouse); tmp.z = 0;
      const d = tmp.length(), R = 2.4 + b.r;
      if (d < R && d > 1e-4) b.v.addScaledVector(tmp.normalize(), (R - d) * 26 * dt);
    }
    b.v.multiplyScalar(Math.pow(0.18, dt));          // damping
  }
  // collisions
  for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
    const a = balls[i], c = balls[j];
    tmp.subVectors(c.p, a.p); const d = tmp.length(), min = a.r + c.r;
    if (d < min && d > 1e-5) {
      tmp.divideScalar(d); const push = (min - d) * 0.5;
      a.p.addScaledVector(tmp, -push); c.p.addScaledVector(tmp, push);
      const rel = tmp.dot(axis.subVectors(c.v, a.v));
      if (rel < 0) { a.v.addScaledVector(tmp, rel * 0.5); c.v.addScaledVector(tmp, -rel * 0.5); }
    }
  }
  for (const b of balls) {
    b.p.addScaledVector(b.v, dt);
    b.m.position.copy(b.p);
    // roll: rotate around axis perpendicular to motion
    const sp = Math.hypot(b.v.x, b.v.y);
    if (sp > 1e-3) { axis.set(-b.v.y, b.v.x, 0).normalize(); b.m.rotateOnWorldAxis(axis, sp * dt / b.r * 0.6); }
  }
}

function frame() {
  requestAnimationFrame(frame);
  const now = performance.now(); const dt = Math.min(0.033, (now - last) / 1000); last = now;
  if (!visible) return;
  step(dt / 2); step(dt / 2);
  renderer.render(scene, camera);
}
frame();
document.documentElement.classList.add('has-tech');
