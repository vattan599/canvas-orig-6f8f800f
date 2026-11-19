
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('scene');
const stage = canvas.parentElement;
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) { document.body.classList.add('no-gl'); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.32;

scene.add(new THREE.HemisphereLight(0xffe2c0, 0x2a1408, 0.45));
const keyLight = new THREE.DirectionalLight(0xffd3a0, 2.7); keyLight.position.set(4, 7, 5); scene.add(keyLight);
const rim = new THREE.DirectionalLight(0xff7a2e, 2.4); rim.position.set(-6, 2.5, -4); scene.add(rim);
const glow = new THREE.PointLight(0xff9a3c, 0, 6, 1.6); glow.position.set(0, 0.6, 0); scene.add(glow);

/* ---------- helpers ---------- */
let seed = 7;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const R = (a, b) => a + rnd() * (b - a);
const lump = (x, y, z) => Math.sin(x * 3.1 + 1.3) * Math.sin(y * 2.7 + .4) * Math.sin(z * 3.3 + 2.1) + .5 * Math.sin(x * 6.3 + 2) * Math.sin(y * 5.9 + 1.1) * Math.sin(z * 6.7 + .3);
function tex(size, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8; return t;
}
function blob(g, x, y, r, col) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
function oval(g, x, y, rx, ry, rot, col) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(1, ry / rx); blob(g, 0, 0, rx, col); g.restore(); }

/* ---------- textures ---------- */
const rawTex = tex(1024, (g, S) => {
  g.fillStyle = '#e4c896'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 70; i++) blob(g, R(0, S), R(0, S), R(40, 170), rnd() < .5 ? 'rgba(255,240,212,.22)' : 'rgba(170,128,80,.14)');
  for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(255,252,244,${R(.15, .55)})`; g.beginPath(); g.arc(R(0, S), R(0, S), R(.6, 2.2), 0, 7); g.fill(); }
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(150,105,60,${R(.12, .3)})`; g.beginPath(); g.arc(R(0, S), R(0, S), R(.8, 1.8), 0, 7); g.fill(); }
});
const cookTex = tex(1024, (g, S) => {
  const c = S / 2;
  const base = g.createRadialGradient(c, c, 0, c, c, c); base.addColorStop(0, '#e8b462'); base.addColorStop(.75, '#dca04c'); base.addColorStop(1, '#b97a32');
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 60; i++) blob(g, R(0, S), R(0, S), R(50, 160), rnd() < .5 ? 'rgba(255,215,140,.25)' : 'rgba(170,100,40,.2)');
  for (let i = 0; i < 40; i++) blob(g, R(0, S), R(0, S), R(20, 60), 'rgba(250,224,150,.3)');
  for (let i = 0; i < 230; i++) { const r = R(5, 30); oval(g, R(0, S), R(0, S), r, r * R(.45, 1), R(0, 3.2), `rgba(${R(80, 115)|0},${R(36, 55)|0},12,${R(.55, .9)})`); }
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(42,18,6,${R(.5, .9)})`; g.beginPath(); g.arc(R(0, S), R(0, S), R(1.2, 4), 0, 7); g.fill(); }
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(60,100,35,${R(.4, .7)})`; g.beginPath(); g.ellipse(R(0, S), R(0, S), R(2, 6), R(1, 3), R(0, 3), 0, 7); g.fill(); }
  const edge = g.createRadialGradient(c, c, S * .38, c, c, S * .5); edge.addColorStop(0, 'rgba(0,0,0,0)'); edge.addColorStop(1, 'rgba(120,58,16,.55)');
  g.fillStyle = edge; g.fillRect(0, 0, S, S);
});
const bumpTex = tex(512, (g, S) => {
  g.fillStyle = '#808080'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 260; i++) blob(g, R(0, S), R(0, S), R(6, 40), rnd() < .5 ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)');
}, false);
const fillTex = tex(512, (g, S) => {
  g.fillStyle = '#e1bb57'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 60; i++) blob(g, R(0, S), R(0, S), R(20, 90), rnd() < .5 ? 'rgba(255,236,170,.35)' : 'rgba(190,140,50,.25)');
  const dots = (n, col, a, b) => { for (let i = 0; i < n; i++) { g.fillStyle = col; g.beginPath(); g.ellipse(R(0, S), R(0, S), R(a, b), R(a * .5, b * .7), R(0, 3), 0, 7); g.fill(); } };
  dots(260, '#4a7a24', 2, 6); dots(130, '#b8331b', 1.5, 3.5); dots(90, '#f4e9cc', 2, 5); dots(160, '#3b2a14', .8, 1.6);
});
const woodTex = tex(512, (g, S) => {
  g.fillStyle = '#6a4124'; g.fillRect(0, 0, S, S);
  for (let r = 4; r < S * .72; r += R(3, 9)) { g.strokeStyle = `rgba(${rnd() < .5 ? '40,22,10' : '150,100,60'},${R(.12, .32)})`; g.lineWidth = R(1, 3.5); g.beginPath(); g.ellipse(S / 2 + R(-3, 3), S / 2 + R(-3, 3), r, r * R(.97, 1.03), 0, 0, 7); g.stroke(); }
});
const softTex = tex(128, (g, S) => blob(g, S / 2, S / 2, S / 2, 'rgba(255,255,255,1)'));
const shadowTex = tex(256, (g, S) => blob(g, S / 2, S / 2, S / 2, 'rgba(0,0,0,.75)'));

/* ---------- materials ---------- */
const uCook = { value: 0 };
const doughMat = new THREE.MeshStandardMaterial({ map: rawTex, roughness: .82, bumpMap: bumpTex, bumpScale: 1.2 });
doughMat.onBeforeCompile = sh => {
  sh.uniforms.uCook = uCook; sh.uniforms.cookMap = { value: cookTex };
  sh.fragmentShader = 'uniform float uCook;\nuniform sampler2D cookMap;\n' + sh.fragmentShader
    .replace('#include <map_fragment>', `#ifdef USE_MAP
      vec4 rawC = texture2D( map, vMapUv ); vec4 ckC = texture2D( cookMap, vMapUv );
      diffuseColor *= mix( rawC, ckC, uCook );
    #endif`)
    .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = mix( roughnessFactor, 0.38, uCook );');
};
const steel = new THREE.MeshStandardMaterial({ color: 0xbdb6ac, metalness: .92, roughness: .26, side: THREE.DoubleSide, envMapIntensity: 1.6 });
const brass = new THREE.MeshStandardMaterial({ color: 0xc08a3e, metalness: .9, roughness: .32, side: THREE.DoubleSide, envMapIntensity: 1.5 });
const iron = new THREE.MeshStandardMaterial({ color: 0x23201e, metalness: .65, roughness: .5, side: THREE.DoubleSide });
const wood = new THREE.MeshStandardMaterial({ map: woodTex, roughness: .7 });

/* ---------- dough (one mesh, morphs through every step) ---------- */
function doughGeo() {
  const g = new THREE.SphereGeometry(1, 160, 110);
  const pos = g.attributes.position, uv = g.attributes.uv, n = pos.count;
  const base = new Float32Array(n * 3), cup = new Float32Array(n * 3), flat = new Float32Array(n * 3), knead = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), r2 = x * x + z * z, a = Math.atan2(z, x);
    const s = 1 + .025 * lump(x, y, z);
    base.set([x * s, y * s, z * s], i * 3);
    cup.set([x * 1.6, y * .12 + r2 * .34, z * 1.6], i * 3);
    const e = 1 + .024 * Math.sin(a * 5 + 1.2) + .014 * Math.sin(a * 11 + .4);
    flat.set([x * 2.35 * e, y * .075 + .02 * lump(x * 2, 0, z * 2), z * 2.35 * e], i * 3);
    const k = 1 + .085 * lump(x * 1.7 + 3, y * 1.7, z * 1.7);
    knead.set([x * 1.14 * k, y * .82 * k, z * 1.14 * k], i * 3);
    uv.setXY(i, x * .5 + .5, z * .5 + .5);
  }
  pos.array.set(base);
  const normals = arr => { const t = new THREE.BufferGeometry(); t.setAttribute('position', new THREE.BufferAttribute(arr, 3)); t.setIndex(g.index); t.computeVertexNormals(); return t.attributes.normal; };
  g.computeVertexNormals();
  g.morphAttributes.position = [new THREE.BufferAttribute(cup, 3), new THREE.BufferAttribute(flat, 3), new THREE.BufferAttribute(knead, 3)];
  g.morphAttributes.normal = [normals(cup), normals(flat), normals(knead)];
  return g;
}
const root = new THREE.Group(); scene.add(root);
const doughPivot = new THREE.Group(); root.add(doughPivot);
const dough = new THREE.Mesh(doughGeo(), doughMat); doughPivot.add(dough);

/* filling */
const fillGeo = new THREE.IcosahedronGeometry(.82, 24);
{ const p = fillGeo.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i); v.multiplyScalar(1 + .07 * lump(v.x * 2.2, v.y * 2.2, v.z * 2.2)); p.setXYZ(i, v.x, v.y * .9, v.z); } fillGeo.computeVertexNormals(); }
const filling = new THREE.Mesh(fillGeo, new THREE.MeshStandardMaterial({ map: fillTex, roughness: .78, bumpMap: bumpTex, bumpScale: 2 }));
root.add(filling);

/* potatoes */
const potatoes = new THREE.Group(); root.add(potatoes);
const potMat = new THREE.MeshStandardMaterial({ color: 0xe2c27a, roughness: .62 });
[[-.55, .62, .1, .62], [.5, .6, -.25, .56], [.05, .58, .6, .5]].forEach(([x, y, z, s], i) => {
  const g = new THREE.SphereGeometry(1, 64, 48); const p = g.attributes.position;
  for (let j = 0; j < p.count; j++) { const v = new THREE.Vector3().fromBufferAttribute(p, j); const k = 1 + .06 * lump(v.x * 2 + i, v.y * 2, v.z * 2); p.setXYZ(j, v.x * k * 1.2, v.y * k * .82, v.z * k * .9); }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, potMat); m.position.set(x, y, z); m.scale.setScalar(s); m.rotation.set(R(0, 1), R(0, 3), R(0, 1)); m.userData = { y, s, ph: i * 2.1 };
  potatoes.add(m);
});

/* vessels */
const V = pts => pts.map(([x, y]) => new THREE.Vector2(x, y));
const bowl = new THREE.Mesh(new THREE.LatheGeometry(V([[0, 0], [.9, .02], [1.45, .25], [1.8, .7], [1.95, 1.1], [2, 1.15], [1.92, 1.13], [1.84, 1.05], [1.7, .7], [1.38, .3], [.85, .1], [0, .08]]), 96), steel);
const parat = new THREE.Mesh(new THREE.LatheGeometry(V([[0, 0], [2.2, .02], [2.6, .25], [2.78, .46], [2.82, .5], [2.72, .48], [2.55, .3], [2.1, .1], [0, .08]]), 96), brass);
const board = new THREE.Group();
{ const top = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.6, .22, 96), wood); top.position.y = -.11; board.add(top); }
const tawa = new THREE.Group();
{ const pan = new THREE.Mesh(new THREE.LatheGeometry(V([[0, 0], [2.5, .03], [2.9, .14], [3.05, .22], [2.96, .21], [2.45, .1], [0, .07]]), 96), iron); tawa.add(pan);
  [-1, 1].forEach(s => { const h = new THREE.Mesh(new THREE.TorusGeometry(.26, .045, 12, 32, Math.PI), iron); h.position.set(s * 3.1, .2, 0); h.rotation.set(Math.PI / 2, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2); tawa.add(h); }); }
const plate = new THREE.Mesh(new THREE.LatheGeometry(V([[0, 0], [3, .02], [3.22, .17], [3.32, .25], [3.24, .24], [3.02, .1], [0, .05]]), 120), steel);
const sides = new THREE.Group();
function katori(x, z, fillCol, rough) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.LatheGeometry(V([[0, 0], [.4, .01], [.6, .12], [.68, .4], [.7, .42], [.65, .41], [.62, .38], [.55, .12], [.38, .05], [0, .04]]), 64), steel));
  const top = new THREE.Mesh(new THREE.CircleGeometry(.62, 48), new THREE.MeshStandardMaterial({ color: fillCol, roughness: rough }));
  top.rotation.x = -Math.PI / 2; top.position.y = .33; g.add(top);
  g.position.set(x, .05, z); return g;
}
sides.add(katori(2.35, -1.05, 0xf1ece0, .55));
const achar = katori(2.45, .85, 0xa8361a, .25); sides.add(achar);
for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(R(.08, .14), 1), new THREE.MeshStandardMaterial({ color: 0xc8571c, roughness: .3 })); m.position.set(R(-.35, .35), .36, R(-.35, .35)); m.scale.y = .6; achar.add(m); }
[bowl, parat, board, tawa, plate, sides].forEach(o => root.add(o));

/* rolling pin */
const pin = new THREE.Group();
{ const body = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, 3.4, 40), wood); body.rotation.z = Math.PI / 2; pin.add(body);
  [-1, 1].forEach(s => { const h = new THREE.Mesh(new THREE.CylinderGeometry(.09, .11, .7, 24), wood); h.rotation.z = Math.PI / 2; h.position.x = s * 2.05; pin.add(h); }); }
pin.rotation.y = Math.PI / 2; root.add(pin);

/* butter + melt */
const butter = new THREE.Mesh(new RoundedBoxGeometry(.72, .36, .52, 4, .07), new THREE.MeshPhysicalMaterial({ color: 0xf7df8e, roughness: .3, clearcoat: .6, clearcoatRoughness: .2 }));
butter.rotation.y = .5; doughPivot.add(butter);
const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshPhysicalMaterial({ color: 0xf5c556, roughness: .05, clearcoat: 1, transparent: true, opacity: .55, depthWrite: false }));
puddle.rotation.x = -Math.PI / 2; doughPivot.add(puddle);

/* contact shadow */
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: .8 }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = -.02; root.add(shadow);

/* particles: steam, flour, spice */
function points(n, size, color, opacity) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 4).fill(1), 4));
  const m = new THREE.PointsMaterial({ size, map: softTex, color, transparent: true, opacity, depthWrite: false, vertexColors: true, sizeAttenuation: true });
  const p = new THREE.Points(g, m); p.userData.seed = Array.from({ length: n }, () => [R(0, 1), R(0, 1), R(0, 1), R(0, 1)]); p.frustumCulled = false; return p;
}
const steam = points(70, 1.4, 0xfff4e6, .3); root.add(steam);
const flour = points(260, .07, 0xfffaf0, .8); root.add(flour);
const SPICE = 360;
const spice = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.032, 0), new THREE.MeshStandardMaterial({ roughness: .6, flatShading: true }), SPICE);
const spiceCols = [0x4a7a24, 0x5f9a2c, 0xb8331b, 0xd4532f, 0x3b2a14, 0xe0b84a, 0xf4e9cc];
const spiceSeed = [];
for (let i = 0; i < SPICE; i++) { spice.setColorAt(i, new THREE.Color(spiceCols[i % spiceCols.length])); const a = R(0, 6.28), r = Math.sqrt(rnd()) * .75; spiceSeed.push([Math.cos(a) * r, Math.sin(a) * r, rnd(), R(.6, 1.4)]); }
spice.frustumCulled = false; root.add(spice);

/* ---------- keyframes (scroll position p → scene state) ---------- */
const D = { dough: 1, cup: 0, flat: 0, knead: 0, cook: 0, dX: 0, dY: 0, flip: 0, fill: 0, fY: .75, potato: 0, mash: 0, bowl: 0, parat: 0, board: 0, pin: 0, pinX: -2.7, tawa: 0, plate: 0, sides: 0, butter: 0, melt: 0, steam: 0, flour: 0, spice: 0, heat: 0, r: 9, el: 34, az: -25, ty: .3 };
const K = []; let last = D;
const key = (p, s) => { last = { ...last, ...s }; K.push([p, last]); };
key(0,    { flat: 1, cook: 1, dY: .16, tawa: 1, butter: 1, melt: .3, steam: 1, heat: .6, r: 10.2, el: 36, az: -28, ty: .2 });
key(.8,   { flat: 0, cook: 0, knead: 1, dY: .9, tawa: 0, parat: 1, butter: 0, melt: 0, steam: 0, heat: 0, flour: 1, r: 9.2, el: 24, az: 8, ty: .75 });
key(1.3,  { az: 18 });
key(1.75, { dough: 0, knead: 0, parat: 0, flour: 0, bowl: 1, potato: 1, steam: .7, r: 8, el: 40, az: 15, ty: .7 });
key(2.05, { az: 22 });
key(2.4,  { mash: 1, fill: .92, steam: .25 });
key(2.7,  { potato: 0, fill: 1, steam: 0, spice: 1, r: 8.8, el: 54, az: 28, ty: .95 });
key(3.3,  { az: 38 });
key(3.7,  { spice: 0, bowl: 0, board: 1, dough: 1, cup: 1, dY: .22, fill: .78, fY: .82, r: 8.8, el: 34, az: 14, ty: .7 });
key(4.0,  { az: 4 });
key(4.35, { cup: 0, dY: 1.0, fY: 1.0, fill: .7 });
key(4.65, { fill: 0, pin: 1, pinX: -2.6, flour: .5, r: 9.8, el: 30, az: -8, ty: .7 });
key(5.35, { flat: 1, dY: .08, pinX: 2.7, flour: .35 });
key(5.7,  { pin: 0, board: 0, flour: 0, tawa: 1, dY: .16, heat: 1, r: 10.2, el: 38, az: -24, ty: .2 });
key(6.0,  { cook: .45, steam: .5 });
key(6.15, { dY: 1.3, flip: Math.PI * .5 });
key(6.3,  { dY: .16, flip: Math.PI, cook: .85 });
key(6.45, { cook: 1, steam: 1 });
key(6.75, { tawa: 0, heat: 0, plate: 1, sides: 1, dX: -.75, dY: .13, flip: Math.PI * 2, butter: 1, melt: 0, steam: .8, r: 12, el: 54, az: -6, ty: .1 });
key(7.35, { melt: 1, az: 6 });
key(8,    { r: 12.6, el: 60, az: 18, steam: .5 });

const ss = t => t * t * (3 - 2 * t);
function stateAt(p) {
  if (p <= K[0][0]) return K[0][1];
  for (let i = 0; i < K.length - 1; i++) {
    const [p0, a] = K[i], [p1, b] = K[i + 1];
    if (p <= p1) { const t = ss((p - p0) / (p1 - p0)); const o = {}; for (const k in a) o[k] = a[k] + (b[k] - a[k]) * t; return o; }
  }
  return K[K.length - 1][1];
}

/* ---------- scroll → p ---------- */
const anchors = [...document.querySelectorAll('.anchor')];
const railLinks = [...document.querySelectorAll('.rail a')];
const rail = document.querySelector('.rail');
let target = 0, p = 0;
function readScroll() {
  const mid = innerHeight / 2;
  const c = anchors.map(a => { const r = a.getBoundingClientRect(); return a.id === 'order' ? r.top + innerHeight * .55 : r.top + r.height / 2; });
  if (mid <= c[0]) target = 0;
  else if (mid >= c[c.length - 1]) target = c.length - 1;
  else for (let i = 0; i < c.length - 1; i++) if (mid < c[i + 1]) { target = i + (mid - c[i]) / (c[i + 1] - c[i]); break; }
  const idx = Math.round(target);
  railLinks.forEach(l => l.classList.toggle('active', +l.dataset.i === idx));
  rail.classList.toggle('on', target > .5 && target < 7.6);
}
addEventListener('scroll', readScroll, { passive: true });

/* ---------- layout ---------- */
let wide = true;
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  wide = w > 900;
  if (wide) camera.setViewOffset(w, h, -w * .2, 0, w, h);
  else camera.setViewOffset(w, h, 0, h * .25, w, h);
  camera.updateProjectionMatrix();
  readScroll();
}
addEventListener('resize', resize); resize();

let mx = 0, my = 0, smx = 0, smy = 0;
addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });

/* ---------- render loop ---------- */
const dummy = new THREE.Object3D();
const clock = new THREE.Clock();
p = target;
const vis = (o, v) => { if (o.userData.by === undefined) o.userData.by = o.position.y; const e = ss(Math.min(1, Math.max(v, 0))); o.visible = e > .01; o.scale.setScalar(.55 + .45 * e); o.position.y = o.userData.by - (1 - e) * 2.6; o.rotation.z = (1 - e) * .5; };

function frame() {
  const dt = Math.min(clock.getDelta(), .1);
  const t = reduce ? 0 : clock.elapsedTime;
  p += (target - p) * (reduce ? 1 : 1 - Math.pow(1 - .06, dt * 60));
  const S = stateAt(p);
  const fade = 1 - Math.min(1, Math.max(0, (p - 7.45) / .45));
  stage.style.opacity = fade;
  if (fade < .002) { requestAnimationFrame(frame); return; }
  root.rotation.y = reduce ? 0 : Math.sin(t * .1) * .12;

  /* dough */
  const kneadPulse = S.knead * (reduce ? 1 : .7 + .3 * Math.sin(t * 2.3));
  dough.morphTargetInfluences[0] = S.cup;
  dough.morphTargetInfluences[1] = S.flat;
  dough.morphTargetInfluences[2] = kneadPulse;
  uCook.value = S.cook;
  doughPivot.position.set(S.dX, S.dY, 0);
  doughPivot.rotation.x = S.flip;
  dough.rotation.y = S.knead * Math.sin(t * .9) * .4;
  vis(dough, S.dough);

  filling.visible = S.fill > .01; filling.scale.setScalar(Math.max(S.fill, .0001)); filling.position.set(0, S.fY, 0); filling.rotation.y = t * .15;

  potatoes.visible = S.potato > .01;
  potatoes.children.forEach(m => { const u = m.userData; const sq = 1 - S.mash * .55; m.scale.set(u.s * S.potato * (1 + S.mash * .25), u.s * S.potato * sq, u.s * S.potato * (1 + S.mash * .25)); m.position.y = u.y * (1 - S.mash * .35) + (reduce ? 0 : Math.sin(t * 1.6 + u.ph) * .04 * (1 - S.mash)); });

  vis(bowl, S.bowl); vis(parat, S.parat); vis(board, S.board); vis(tawa, S.tawa); vis(plate, S.plate); vis(sides, S.sides);
  glow.intensity = S.heat * (6 + (reduce ? 0 : Math.sin(t * 7) * .8 + Math.sin(t * 13) * .5));

  /* pin rolls across the dough */
  vis(pin, S.pin);
  const top = S.dY + (1 - S.flat) * .95 + S.flat * .075 + .17;
  pin.position.set(0, top, S.pinX * .9);
  pin.children.forEach(c => c.rotation.x = -S.pinX / .17);

  /* butter melts */
  const bTop = .075 + .18 * (1 - S.melt * .7);
  vis(butter, S.butter); butter.scale.set(S.butter * (1 + S.melt * .25), Math.max(S.butter * (1 - S.melt * .75), .0001), S.butter * (1 + S.melt * .25));
  butter.position.y = bTop;
  puddle.visible = S.butter > .01 && S.melt > .02; puddle.scale.setScalar(.35 + S.melt * 1.05); puddle.position.y = .082; puddle.material.opacity = .55 * Math.min(1, S.melt * 3);

  /* steam */
  steam.visible = S.steam > .01; steam.material.opacity = .28 * S.steam;
  { const pa = steam.geometry.attributes.position, ca = steam.geometry.attributes.color, sd = steam.userData.seed;
    const cx = S.potato > .3 ? 0 : S.dX, cy = S.potato > .3 ? 1.1 : S.dY + .2;
    for (let i = 0; i < sd.length; i++) { const [a, b, c, d] = sd[i]; const life = (t * .22 * (.7 + d * .6) + a) % 1; const ang = b * 6.28; const rr = c * 1.6;
      pa.setXYZ(i, cx + Math.cos(ang) * rr + Math.sin(t * .7 + i) * .25 * life, cy + life * 3.2, Math.sin(ang) * rr + Math.cos(t * .6 + i) * .2 * life);
      ca.setW(i, Math.sin(life * Math.PI) * (reduce ? .5 : 1)); }
    pa.needsUpdate = ca.needsUpdate = true; }

  /* flour */
  flour.visible = S.flour > .01; flour.material.opacity = .75 * S.flour;
  { const pa = flour.geometry.attributes.position, ca = flour.geometry.attributes.color, sd = flour.userData.seed;
    for (let i = 0; i < sd.length; i++) { const [a, b, c, d] = sd[i]; const life = (t * .05 * (.5 + d) + a) % 1; const ang = b * 6.28 + t * .05; const rr = .6 + c * 2.6;
      pa.setXYZ(i, Math.cos(ang) * rr, .2 + (1 - life) * 3 + Math.sin(t + i) * .05, Math.sin(ang) * rr); ca.setW(i, Math.sin(life * Math.PI)); }
    pa.needsUpdate = ca.needsUpdate = true; }

  /* spices fall into the filling */
  spice.visible = S.spice > .01;
  if (spice.visible) {
    for (let i = 0; i < SPICE; i++) { const [x, z, ph, sp] = spiceSeed[i]; const life = reduce ? ph : (t * .45 * sp + ph) % 1; const y = 3.6 - life * 2.2; const floor = S.fY + .6 - (x * x + z * z) * .5;
      dummy.position.set(x, Math.max(y, floor), z); dummy.rotation.set(ph * 9, life * 6, 0); dummy.scale.set(S.spice * (1 + sp * .6), S.spice * .55, S.spice * (1 + ph * .5)); dummy.updateMatrix(); spice.setMatrixAt(i, dummy.matrix); }
    spice.instanceMatrix.needsUpdate = true;
  }

  shadow.scale.setScalar(.75 + S.tawa * .35 + S.plate * .45 + S.parat * .2);

  /* camera */
  smx += (mx - smx) * .05; smy += (my - smy) * .05;
  const narrow = camera.aspect < 1 ? Math.min(2.2, Math.max(1.15, 1.02 / camera.aspect)) : 1;
  const rad = S.r * narrow, el = THREE.MathUtils.degToRad(S.el + (reduce ? 0 : smy * 6)), az = THREE.MathUtils.degToRad(S.az + (reduce ? 0 : Math.sin(t * .12) * 4 + smx * 8));
  camera.position.set(Math.sin(az) * Math.cos(el) * rad, S.ty + Math.sin(el) * rad, Math.cos(az) * Math.cos(el) * rad);
  camera.lookAt(0, S.ty, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
readScroll(); p = target;
requestAnimationFrame(() => { frame(); document.body.classList.add('gl-ready'); });
