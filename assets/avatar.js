/* =====================================================================
   3D animated avatar — cartoon developer with a cap, sweatshirt and
   sneakers, sitting at a desk and typing (black + maroon scene).
   ===================================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('avatarCanvas');
const holder = canvas.parentElement;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  document.documentElement.classList.add('no3d');
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

/* ---------------- materials ---------------- */
const M = {
  skin:   new THREE.MeshPhysicalMaterial({ color: 0xc07a4c, roughness: 0.5, sheen: 0.4, sheenColor: 0xffd0b0, clearcoat: 0.1, envMapIntensity: 0.6 }),
  skinDark: new THREE.MeshStandardMaterial({ color: 0x8e4f2e, roughness: 0.6 }),
  hair:   new THREE.MeshStandardMaterial({ color: 0x0c0a09, roughness: 0.7, envMapIntensity: 0.4 }),
  cap:    new THREE.MeshPhysicalMaterial({ color: 0xd9d9de, roughness: 0.55, sheen: 0.6, sheenColor: 0xffffff, envMapIntensity: 0.7 }),
  seam:   new THREE.MeshStandardMaterial({ color: 0xb7b7bd, roughness: 0.6 }),
  brim:   new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.45 }),
  sweat:  new THREE.MeshPhysicalMaterial({ color: 0x2a2f33, roughness: 0.7, sheen: 0.7, sheenColor: 0x6a7378, envMapIntensity: 0.45 }),
  rib:    new THREE.MeshStandardMaterial({ color: 0x1b1f22, roughness: 0.8 }),
  pants:  new THREE.MeshPhysicalMaterial({ color: 0x1c1f26, roughness: 0.65, sheen: 0.4, sheenColor: 0x555c6e, envMapIntensity: 0.45 }),
  shoe:   new THREE.MeshPhysicalMaterial({ color: 0xf2f2f4, roughness: 0.4, clearcoat: 0.4 }),
  sole:   new THREE.MeshStandardMaterial({ color: 0xbdbdc4, roughness: 0.7 }),
  white:  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 }),
  teeth:  new THREE.MeshPhysicalMaterial({ color: 0xfbfbf7, roughness: 0.2, clearcoat: 0.6 }),
  iris:   new THREE.MeshStandardMaterial({ color: 0x23325f, roughness: 0.2 }),
  dark:   new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.5 }),
  lip:    new THREE.MeshStandardMaterial({ color: 0x3d1a14, roughness: 0.6 }),
  desk:   new THREE.MeshPhysicalMaterial({ color: 0xf4f4f6, roughness: 0.25, clearcoat: 0.6 }),
  deskLeg:new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.4, metalness: 0.6 }),
  chair:  new THREE.MeshPhysicalMaterial({ color: 0xf5f5f7, roughness: 0.2, clearcoat: 0.8 }),
  wood:   new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.55 }),
  monitor:new THREE.MeshPhysicalMaterial({ color: 0x6a0a18, roughness: 0.3, metalness: 0.2, clearcoat: 0.8, emissive: 0x2a0308 }),
  mug:    new THREE.MeshPhysicalMaterial({ color: 0x8e1022, roughness: 0.3, clearcoat: 0.6 })
};

const add = (parent, geo, mat, pos, opts = {}) => {
  const m = new THREE.Mesh(geo, mat);
  if (pos) m.position.set(...pos);
  if (opts.rot) m.rotation.set(...opts.rot);
  if (opts.scale) m.scale.set(...opts.scale);
  m.castShadow = opts.cast !== false;
  m.receiveShadow = !!opts.receive;
  parent.add(m);
  return m;
};
const sphere = (r, w = 32, h = 24) => new THREE.SphereGeometry(r, w, h);

/* ---------------- limb helper (cylinder between two points) ---------------- */
const UP = new THREE.Vector3(0, 1, 0);
const _d = new THREE.Vector3();
function limb(r, mat, parent) {
  const m = add(parent, new THREE.CylinderGeometry(r, r, 1, 20, 1, true), mat);
  return m;
}
function setLimb(m, a, b) {
  _d.subVectors(b, a);
  const L = _d.length();
  m.position.copy(a).addScaledVector(_d, 0.5);
  m.quaternion.setFromUnitVectors(UP, _d.normalize());
  m.scale.set(1, L, 1);
}

/* ---------------- canvas textures ---------------- */
function jerseyDecal() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  // faint woven pattern
  g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 2;
  for (let y = 300; y < 512; y += 18) { g.beginPath(); for (let x = 0; x <= 1024; x += 24) g.lineTo(x, y + (x / 24 % 2 ? 6 : -6)); g.stroke(); }
  // badge
  g.fillStyle = '#d4a23c'; g.beginPath(); g.arc(395, 120, 34, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1a1a1f'; g.beginPath(); g.arc(395, 120, 24, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#d4a23c'; g.font = 'bold 26px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('R', 395, 122);
  // Reload wordmark
  g.font = '900 118px "Arial Black", Arial, sans-serif';
  g.fillStyle = '#e0ad44';
  g.fillText('Reload', 512, 270);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
const codeCanvas = document.createElement('canvas'); codeCanvas.width = 512; codeCanvas.height = 320;
const codeCtx = codeCanvas.getContext('2d');
const codeTex = new THREE.CanvasTexture(codeCanvas); codeTex.colorSpace = THREE.SRGBColorSpace;
const CODE = [
  ['#c084fc', 'from'], ['#e5e7eb', ' langgraph.graph import StateGraph'],
  ['#c084fc', 'from'], ['#e5e7eb', ' llama_index.core import VectorStoreIndex'],
  null,
  ['#c084fc', 'def'], ['#fbbf24', ' retrieve'], ['#e5e7eb', '(state):'],
  ['#e5e7eb', '    docs = index.as_retriever().retrieve(q)'],
  ['#c084fc', 'def'], ['#fbbf24', ' agent'], ['#e5e7eb', '(state):'],
  ['#e5e7eb', '    return llm.invoke(tools, memory)'],
  ['#ff4d63', 'graph'], ['#e5e7eb', ' = StateGraph(AgentState)'],
  ['#e5e7eb', '    .add_node("rag", retrieve)'],
  ['#64748b', '# lora fine-tune → eval → ship 🚀'],
  ['#ff4d63', 'model'], ['#e5e7eb', ' = get_peft_model(vlm, lora_cfg)']
];
const codeLines = [];
{ let line = []; for (const tok of CODE) { if (tok === null || ['from','def','graph','model'].includes(tok[1]) || tok[1].startsWith('  ') || tok[1] === '}' || tok[1].startsWith('//')) { if (line.length) codeLines.push(line); line = []; } if (tok) line.push(tok); } if (line.length) codeLines.push(line); }
let codeOffset = 0;
function drawCode() {
  const g = codeCtx;
  g.fillStyle = '#120609'; g.fillRect(0, 0, 512, 320);
  g.fillStyle = '#1e0a0f'; g.fillRect(0, 0, 512, 26);
  ['#ef4444', '#f59e0b', '#22c55e'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(16 + i * 16, 13, 5, 0, 7); g.fill(); });
  g.font = '18px monospace'; g.textBaseline = 'top';
  for (let i = 0; i < 13; i++) {
    const ln = codeLines[(i + Math.floor(codeOffset)) % codeLines.length];
    let x = 40; g.fillStyle = '#334155'; g.fillText(String(i + 1).padStart(2, ' '), 8, 36 + i * 22);
    for (const [col, txt] of ln) { g.fillStyle = col; g.fillText(txt, x, 36 + i * 22); x += g.measureText(txt).width; }
  }
  if ((performance.now() / 500 | 0) % 2) { g.fillStyle = '#ff4d63'; g.fillRect(40, 36 + 12 * 22, 10, 18); }
  codeTex.needsUpdate = true;
}
function floorGlow() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  gr.addColorStop(0, 'rgba(255,225,230,0.9)'); gr.addColorStop(0.25, 'rgba(200,16,46,0.5)');
  gr.addColorStop(0.55, 'rgba(110,8,24,0.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function keyboardTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 512;
  const g = c.getContext('2d'); g.fillStyle = '#1b1c22'; g.fillRect(0, 0, 256, 512);
  g.fillStyle = '#3a3c46';
  for (let r = 0; r < 5; r++) for (let k = 0; k < 14; k++) g.fillRect(14 + r * 46, 14 + k * 35, 38, 28);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ---------------- environment: floor, chair, desk ---------------- */
const world = new THREE.Group(); scene.add(world);

add(world, new THREE.CircleGeometry(2.6, 64), new THREE.MeshBasicMaterial({ map: floorGlow(), transparent: true, depthWrite: false }), [0.4, 0.002, 0], { rot: [-Math.PI / 2, 0, 0], cast: false });
const shadowFloor = add(world, new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.45 }), [0.4, 0.004, 0], { rot: [-Math.PI / 2, 0, 0], cast: false, receive: true });

// chair: white shell + wooden legs
const chair = new THREE.Group(); world.add(chair);
add(chair, new THREE.BoxGeometry(0.78, 0.07, 0.82), M.chair, [0, 0.86, 0], { receive: true });
add(chair, new THREE.BoxGeometry(0.07, 0.8, 0.8), M.chair, [-0.42, 1.28, 0], { rot: [0, 0, 0.12] });
for (const [x, z] of [[0.28, 0.32], [0.28, -0.32], [-0.3, 0.32], [-0.3, -0.32]]) {
  const a = new THREE.Vector3(x, 0.83, z), b = new THREE.Vector3(x * 1.25, 0, z * 1.25);
  setLimb(limb(0.028, M.wood, chair), a, b);
}

// desk
const desk = new THREE.Group(); world.add(desk);
add(desk, new THREE.BoxGeometry(1.05, 0.06, 2.3), M.desk, [1.3, 1.42, 0], { receive: true });
for (const [x, z] of [[0.85, 1.08], [0.85, -1.08], [1.75, 1.08], [1.75, -1.08]])
  add(desk, new THREE.CylinderGeometry(0.03, 0.03, 1.39, 12), M.deskLeg, [x, 0.695, z]);
// keyboard
const kbMat = new THREE.MeshStandardMaterial({ map: keyboardTex(), roughness: 0.6 });
add(desk, new THREE.BoxGeometry(0.28, 0.03, 0.82), [M.dark, M.dark, kbMat, M.dark, M.dark, M.dark], [0.98, 1.465, 0]);
// monitor (screen faces the avatar, back faces the viewer)
const mon = new THREE.Group(); mon.position.set(1.55, 1.45, 0); desk.add(mon);
add(mon, new THREE.BoxGeometry(0.22, 0.03, 0.34), M.monitor, [0, 0.015, 0]);
add(mon, new THREE.BoxGeometry(0.05, 0.42, 0.08), M.monitor, [0.02, 0.22, 0]);
add(mon, new THREE.BoxGeometry(0.07, 0.72, 1.22), M.monitor, [-0.02, 0.72, 0]);
add(mon, new THREE.PlaneGeometry(1.14, 0.64), new THREE.MeshBasicMaterial({ map: codeTex }), [-0.056, 0.72, 0], { rot: [0, -Math.PI / 2, 0], cast: false });
// glowing edge on the monitor back
add(mon, new THREE.BoxGeometry(0.005, 0.74, 1.24), new THREE.MeshBasicMaterial({ color: 0xff2d48, transparent: true, opacity: 0.55 }), [0.017, 0.72, 0], { cast: false });
const screenLight = new THREE.PointLight(0xff5a6e, 1.3, 3, 1.6); screenLight.position.set(1.2, 2.15, 0); world.add(screenLight);
// phone on a stand
add(desk, new THREE.BoxGeometry(0.12, 0.03, 0.16), M.monitor, [1.2, 1.465, -0.62]);
add(desk, new THREE.BoxGeometry(0.03, 0.3, 0.17), M.monitor, [1.24, 1.6, -0.62], { rot: [0, 0, 0.25] });
add(desk, new THREE.PlaneGeometry(0.15, 0.27), new THREE.MeshBasicMaterial({ color: 0x2a0a10 }), [1.222, 1.6, -0.62], { rot: [0, -Math.PI / 2, -0.25], cast: false });
// mug
add(desk, new THREE.CylinderGeometry(0.075, 0.065, 0.17, 24), M.white, [1.15, 1.535, 0.8]);

/* ---------------- the avatar (cartoon developer with a cap) ---------------- */
const av = new THREE.Group(); world.add(av);
const P = (x, y, z) => new THREE.Vector3(x, y, z);

// torso — long-sleeve sweatshirt
const torsoPts = [ [0.0, 0.0], [0.35, 0.02], [0.38, 0.15], [0.39, 0.45], [0.42, 0.7], [0.41, 0.82], [0.31, 0.93], [0.15, 0.98], [0.0, 0.99] ].map(([x, y]) => new THREE.Vector2(x, y));
const torso = new THREE.Group(); torso.position.set(0.03, 0.93, 0); torso.rotation.z = -0.07; av.add(torso);
add(torso, new THREE.LatheGeometry(torsoPts, 40), M.sweat, null, { scale: [0.84, 1, 1.12] });
add(torso, new THREE.TorusGeometry(0.17, 0.04, 12, 32), M.rib, [0.02, 0.95, 0], { rot: [Math.PI / 2, 0, 0], scale: [1, 1.1, 1] });   // ribbed collar
add(torso, new THREE.TorusGeometry(0.37, 0.035, 10, 40), M.rib, [0, 0.05, 0], { rot: [Math.PI / 2, 0, 0], scale: [0.84, 1.12, 1] }); // waist band
const neck = add(av, new THREE.CylinderGeometry(0.12, 0.13, 0.28, 20), M.skin, [0.05, 2.0, 0]);

// hips / pants
add(av, sphere(0.37), M.pants, [0.02, 1.02, 0], { scale: [1, 0.55, 1.15] });
for (const s of [1, -1]) {
  const hip = P(0.05, 1.04, 0.2 * s), knee = P(0.66, 1.06, 0.23 * s), ankle = P(0.7, 0.2, 0.24 * s);
  setLimb(limb(0.19, M.pants, av), hip, knee);
  add(av, sphere(0.19), M.pants, knee.toArray());
  setLimb(limb(0.16, M.pants, av), knee, ankle);
  add(av, new THREE.CapsuleGeometry(0.115, 0.27, 8, 16), M.shoe, [0.8, 0.12, 0.24 * s], { rot: [0, 0, Math.PI / 2], scale: [1, 1, 1.05] });
  add(av, new THREE.BoxGeometry(0.52, 0.045, 0.23), M.sole, [0.8, 0.022, 0.24 * s]);
}

/* arms — full sleeves, ribbed cuffs */
function makeArm(s) {
  return {
    s,
    shoulder: P(0.03, 1.8, 0.42 * s),
    cap: add(av, sphere(0.17), M.sweat, null),
    upper: limb(0.15, M.sweat, av),
    elbowJ: add(av, sphere(0.145), M.sweat, null),
    fore: limb(0.135, M.sweat, av),
    cuff: add(av, new THREE.CylinderGeometry(0.115, 0.115, 0.07, 20), M.rib, null),
    hand: add(av, sphere(0.12), M.skin, null, { scale: [1.15, 0.75, 0.95] }),
    thumb: add(av, new THREE.CapsuleGeometry(0.038, 0.08, 6, 10), M.skin, null)
  };
}
const arms = { R: makeArm(1), L: makeArm(-1) };
const _v = new THREE.Vector3(), _w = new THREE.Vector3();
function poseArm(a, elbow, wrist) {
  const sh = a.shoulder;
  a.cap.position.copy(sh);
  setLimb(a.upper, sh, elbow);
  a.elbowJ.position.copy(elbow);
  _w.subVectors(wrist, elbow);
  const cuffAt = elbow.clone().addScaledVector(_w, 0.92);
  setLimb(a.fore, elbow, cuffAt);
  _w.normalize();
  a.cuff.position.copy(cuffAt);
  a.cuff.quaternion.setFromUnitVectors(UP, _w);
  a.hand.position.copy(wrist).addScaledVector(_w, 0.08);
  a.hand.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), _w);
  a.thumb.position.copy(a.hand.position).add(P(0, 0.03, -0.09 * a.s));
  a.thumb.quaternion.copy(a.hand.quaternion);
}

/* head */
const head = new THREE.Group(); head.position.set(0.06, 2.6, 0); av.add(head);
add(head, sphere(0.5, 48, 36), M.skin, null, { scale: [1, 1.06, 0.92] });
// jaw — slightly squarer, wider lower face
add(head, sphere(0.44, 40, 30), M.skin, [0.0, -0.13, 0], { scale: [0.95, 0.85, 1.04] });
// ears (with inner shading)
for (const s of [1, -1]) {
  add(head, sphere(0.13), M.skin, [0, -0.02, 0.46 * s], { scale: [0.6, 1, 0.45] });
  add(head, sphere(0.075), M.skinDark, [0.02, -0.02, 0.5 * s], { scale: [0.5, 0.9, 0.3], cast: false });
}
// short hair: sideburns + back of the head under the cap
add(head, new THREE.SphereGeometry(0.508, 40, 16, -Math.PI / 2, Math.PI, 0.7, 1.0), M.hair, null, { scale: [1, 1.06, 0.92] });
for (const s of [1, -1]) add(head, sphere(0.06), M.hair, [0.14, 0.1, 0.445 * s], { scale: [1, 1.3, 0.3] });

// baseball cap: light crown, panel seams, button, black brim
const capG = new THREE.Group(); capG.position.set(-0.02, 0.215, 0); capG.rotation.z = 0.1; head.add(capG);
add(capG, new THREE.SphereGeometry(0.535, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), M.cap, null, { scale: [1.02, 0.8, 0.96] });
add(capG, new THREE.CylinderGeometry(0.535, 0.52, 0.1, 48, 1, true), M.cap, [0, -0.045, 0], { scale: [1.02, 1, 0.96] });
for (let i = 0; i < 3; i++) add(capG, new THREE.TorusGeometry(0.535, 0.006, 6, 60, Math.PI), M.seam, null, { rot: [0, i * Math.PI / 3, 0], scale: [1.02, 0.8, 0.96], cast: false });
add(capG, sphere(0.04), M.cap, [0, 0.43, 0]);
add(capG, new THREE.CylinderGeometry(0.42, 0.42, 0.035, 40, 1, false, 0, Math.PI), M.brim, [0.37, -0.09, 0], { rot: [0, 0, -0.38], scale: [1.1, 1, 1.2] });

// eyebrows — thick, flat, a little smug
const brows = new THREE.Group(); head.add(brows);
for (const s of [1, -1]) add(brows, new THREE.CapsuleGeometry(0.035, 0.15, 6, 12), M.hair, [0.475, 0.165, 0.17 * s], { rot: [Math.PI / 2 + 0.12 * s, 0, 0], scale: [0.85, 1, 1] });

// eyes: white, blue iris, pupil, highlight, heavy upper lid (half-closed look)
const eyes = [];
for (const s of [1, -1]) {
  const e = new THREE.Group(); e.position.set(0.445, 0.03, 0.165 * s); e.scale.setScalar(1.15); e.rotation.y = -0.28 * s; head.add(e);
  add(e, sphere(0.088), M.white, null, { scale: [0.75, 0.82, 1], cast: false });
  add(e, sphere(0.05), M.iris, [0.045, -0.01, 0], { scale: [0.6, 1, 1], cast: false });
  add(e, sphere(0.028), M.dark, [0.065, -0.01, 0], { scale: [0.5, 1, 1], cast: false });
  add(e, sphere(0.01), M.white, [0.078, -0.022, 0.012 * s], { cast: false });
  const lid = add(e, new THREE.SphereGeometry(0.094, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), M.skin, null, { scale: [0.78, 0.86, 1.04], cast: false });
  lid.rotation.z = -0.25;     // lid tilted forward → sleepy, confident look
  add(e, new THREE.TorusGeometry(0.075, 0.009, 6, 24, Math.PI), M.skinDark, [0.02, -0.005, 0], { rot: [0, Math.PI / 2, Math.PI], scale: [1, 0.55, 1], cast: false }); // lower lid line
  eyes.push({ e, lid });
}
// nose
add(head, sphere(0.085), M.skin, [0.5, -0.07, 0], { scale: [0.9, 0.95, 1.05] });
// big toothy grin
const mouthG = new THREE.Group(); mouthG.position.set(0.415, -0.25, 0); head.add(mouthG);
add(mouthG, sphere(0.2, 40, 24), M.lip, null, { scale: [0.3, 0.42, 1.0], cast: false });
add(mouthG, sphere(0.19, 40, 24), M.teeth, [0.02, 0, 0], { scale: [0.3, 0.33, 0.93], cast: false });
add(mouthG, new THREE.BoxGeometry(0.006, 0.008, 0.3), M.lip, [0.078, 0.002, 0], { cast: false });

const glasses = null;
av.traverse(o => { if (o.isMesh) o.castShadow = o.castShadow !== false; });

/* ---------------- lights ---------------- */
scene.add(new THREE.HemisphereLight(0xffe2e6, 0x1a0508, 0.6));
const key = new THREE.DirectionalLight(0xfff1e0, 2.2);
key.position.set(4, 6, 5); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -3, right: 3, top: 4, bottom: -1, near: 1, far: 20 });
key.shadow.bias = -0.0005; key.shadow.radius = 4;
scene.add(key);
const rimTeal = new THREE.SpotLight(0xc8102e, 26, 12, 0.7, 0.6); rimTeal.position.set(-2.5, 1.5, 3.2); rimTeal.target.position.set(0, 2.2, 0); scene.add(rimTeal, rimTeal.target);
const rimPink = new THREE.SpotLight(0xff8095, 16, 12, 0.6, 0.6); rimPink.position.set(-2.2, 4.5, -2.5); rimPink.target.position.set(0, 2.4, 0); scene.add(rimPink, rimPink.target);

/* ---------------- interaction state ---------------- */
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', e => { mouse.tx = (e.clientX / innerWidth) * 2 - 1; mouse.ty = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

const headWorld = P(0.06, 2.6, 0);
const cam = { pos: new THREE.Vector3(), tgt: new THREE.Vector3() };
function shots() {
  const aspect = holder.clientWidth / Math.max(1, holder.clientHeight);
  const narrow = aspect < 0.9;
  // close-up on the face — head sits on the left half (text on the right)
  const closePos = narrow ? P(2.1, 2.3, 4.9) : P(2.15, 2.4, 4.15);
  const closeTgt = narrow ? P(0.1, 1.95, 0) : P(0.95, 2.22, -0.45);
  // full desk shot
  const far = narrow ? 1.9 : 1.38;
  const deskTgt = narrow ? P(0.7, 2.0, 0) : P(0.75, 1.4, 0);
  const deskPos = deskTgt.clone().add(P(2.4, 1.35, 5.6).multiplyScalar(far));
  return { closePos, closeTgt, deskPos, deskTgt };
}
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

let nextBlink = 1.5, blinkT = -1, codeTimer = 0;
let visible = true, last = performance.now() / 1000, t = 0;
new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '200px' }).observe(holder);

function resize() {
  const w = holder.clientWidth, h = holder.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 0.9 ? 38 : 30;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

const elbowTypeR = P(0.38, 1.33, 0.52), wristTypeR = P(0.82, 1.53, 0.22);
const elbowTypeL = P(0.38, 1.33, -0.52), wristTypeL = P(0.82, 1.53, -0.22);
const elbowRestR = P(0.12, 1.32, 0.56), wristRestR = P(0.5, 1.2, 0.3);
const elbowRestL = P(0.12, 1.32, -0.56), wristRestL = P(0.5, 1.2, -0.3);
const tmpE = new THREE.Vector3(), tmpW = new THREE.Vector3(), gE = new THREE.Vector3(), gW = new THREE.Vector3();

function frame() {
  requestAnimationFrame(frame);
  const now = performance.now() / 1000; const dt = Math.min(0.05, now - last); last = now;
  if (!visible) return;
  t += dt;

  const p = window.__aboutProgress || 0;
  const k = ease(smooth(0.26, 0.62, p));           // 0 = close-up, 1 = desk view
  const s = shots();
  cam.pos.lerpVectors(s.closePos, s.deskPos, k);
  cam.tgt.lerpVectors(s.closeTgt, s.deskTgt, k);
  mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
  camera.position.copy(cam.pos).add(P(mouse.x * 0.12, -mouse.y * 0.06, 0));
  camera.lookAt(cam.tgt);

  // whole body (and chair) swivels toward the viewer in the close-up
  const swivel = -0.7 * (1 - k);
  av.rotation.y = swivel; chair.rotation.y = swivel;
  const ds = smooth(0.08, 0.6, k);
  desk.scale.setScalar(Math.max(0.0001, ds)); desk.visible = ds > 0.001;
  desk.position.set(1.3 * (1 - ds), 0, 0);
  screenLight.intensity = 1.2 * ds;
  // head: looks at the viewer in the close-up, at the monitor in the desk view
  av.updateMatrixWorld();
  const camLocal = av.worldToLocal(camera.position.clone());
  const toCam = camLocal.sub(head.position);
  const yawCam = Math.max(-1.05, Math.min(1.05, Math.atan2(-toCam.z, toCam.x)));
  const yaw = THREE.MathUtils.lerp(yawCam - mouse.x * 0.35, Math.sin(t * 0.7) * 0.06, k);
  const pitch = THREE.MathUtils.lerp(-mouse.y * 0.18 + Math.sin(t * 1.3) * 0.02, -0.12 + Math.sin(t * 9) * 0.008, k);
  head.rotation.set(0, yaw, pitch, 'YZX');
  torso.rotation.y = yaw * 0.18;

  // blink (scale whole eye) + occasional eyebrow raise
  if (t > nextBlink && blinkT < 0) blinkT = 0;
  if (blinkT >= 0) { blinkT += dt; const b = blinkT < 0.07 ? 1 - blinkT / 0.07 : Math.min(1, (blinkT - 0.07) / 0.08); eyes.forEach(o => o.e.scale.y = Math.max(0.1, b)); if (blinkT > 0.15) { blinkT = -1; nextBlink = t + 2 + Math.random() * 3; eyes.forEach(o => o.e.scale.y = 1); } }
  const cycle = (t % 6) / 6;
  const browUp = smooth(0.1, 0.18, cycle) * (1 - smooth(0.32, 0.42, cycle));
  brows.position.y = browUp * 0.035;
  eyes.forEach(o => o.lid.rotation.z = -0.25 + browUp * 0.25);
  const g = 0;
  const tap = k > 0.2 ? 1 : 0;
  head.updateMatrixWorld();
  gW.set(0, 0, 0); gE.set(0, 0, 0);
  // relaxed: hands resting on the lap (close-up) -> typing (desk view)
  const kt = smooth(0.15, 0.7, k);
  const eR = elbowRestR.clone().lerp(elbowTypeR, kt), wR = wristRestR.clone().lerp(wristTypeR, kt);
  const eL = elbowRestL.clone().lerp(elbowTypeL, kt), wL = wristRestL.clone().lerp(wristTypeL, kt);
  wR.y += Math.max(0, Math.sin(t * 17)) * 0.035 * tap;
  wL.y += Math.max(0, Math.sin(t * 17 + 1.7)) * 0.035 * tap;
  tmpE.lerpVectors(eR, gE, g);
  tmpW.lerpVectors(wR, gW, g);
  poseArm(arms.R, tmpE, tmpW);
  poseArm(arms.L, eL, wL);
  // when not typing in the close-up, rest the left hand
  // subtle breathing
  torso.scale.y = 1 + Math.sin(t * 2) * 0.008;

  codeTimer += dt;
  if (codeTimer > 0.12) { codeTimer = 0; codeOffset += k > 0.3 ? 0.35 : 0.05; drawCode(); }

  renderer.render(scene, camera);
}
drawCode();
frame();
document.documentElement.classList.add('has3d');
