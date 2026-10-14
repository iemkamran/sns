// WebGL backdrops: DNA double helix + drifting red blood cells (motifs from the brochures).
// Fails silently — the page is fully usable without WebGL.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GREEN = 0x207a5e, MINT = 0x6cc6a8, TEAL = 0x38a88e, RED = 0xc62828;

function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  r.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  r.outputColorSpace = THREE.SRGBColorSpace;
  return r;
}

function addLights(scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfe9df, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 6, 8);
  scene.add(key);
}

function buildHelix({ turns = 4, height = 16, radius = 1.6, perTurn = 12, sphere = 0.17, colors = [GREEN, MINT], rungColor = 0xb8ddd0 }) {
  const group = new THREE.Group();
  const n = turns * perTurn;
  const sGeo = new THREE.SphereGeometry(sphere, 20, 14);
  const matA = new THREE.MeshStandardMaterial({ color: colors[0], roughness: .35, metalness: .1 });
  const matB = new THREE.MeshStandardMaterial({ color: colors[1], roughness: .35, metalness: .1 });
  const rungMat = new THREE.MeshStandardMaterial({ color: rungColor, roughness: .6, transparent: true, opacity: .85 });
  const a = new THREE.InstancedMesh(sGeo, matA, n);
  const b = new THREE.InstancedMesh(sGeo, matB, n);
  const rungGeo = new THREE.CylinderGeometry(0.035, 0.035, 1, 8);
  const rungs = new THREE.InstancedMesh(rungGeo, rungMat, n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < n; i++) {
    const t = i / perTurn * Math.PI * 2;
    const y = (i / n - .5) * height;
    const p1 = new THREE.Vector3(Math.cos(t) * radius, y, Math.sin(t) * radius);
    const p2 = new THREE.Vector3(Math.cos(t + Math.PI) * radius, y, Math.sin(t + Math.PI) * radius);
    a.setMatrixAt(i, m.makeTranslation(p1.x, p1.y, p1.z));
    b.setMatrixAt(i, m.makeTranslation(p2.x, p2.y, p2.z));
    const dir = p2.clone().sub(p1);
    q.setFromUnitVectors(up, dir.clone().normalize());
    m.compose(p1.clone().add(p2).multiplyScalar(.5), q, new THREE.Vector3(1, dir.length(), 1));
    rungs.setMatrixAt(i, m);
  }
  group.add(a, b, rungs);
  return group;
}

// biconcave red-blood-cell disc via a lathe profile
function rbcGeometry() {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const r = i / 24;
    const th = 0.12 + 0.28 * Math.pow(r, 2) * (1 - Math.pow(r, 6)) * 1.6;
    pts.push(new THREE.Vector2(r, th));
  }
  pts.push(new THREE.Vector2(1.02, 0));
  for (let i = 24; i >= 0; i--) pts.push(new THREE.Vector2(pts[i].x, -pts[i].y));
  const g = new THREE.LatheGeometry(pts, 40);
  g.computeVertexNormals();
  return g;
}

/* ---------------- Hero ---------------- */
function hero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 100);
  camera.position.set(0, 0, 18);
  addLights(scene);

  const helix = buildHelix({ turns: 5, height: 26, radius: 1.4, sphere: .14 });
  helix.traverse(o => { if (o.material) { o.material.transparent = true; o.material.opacity = .4; } });
  const tilt = new THREE.Group();
  tilt.rotation.z = -0.95;
  tilt.position.set(6, -1, -9);
  tilt.add(helix);
  scene.add(tilt);

  const rbcMat = new THREE.MeshStandardMaterial({ color: RED, roughness: .45, metalness: .05, emissive: 0x3a0000, emissiveIntensity: .25 });
  const geo = rbcGeometry();
  const cells = [];
  for (let i = 0; i < 10; i++) {
    const mesh = new THREE.Mesh(geo, rbcMat);
    const s = .3 + Math.random() * .35;
    mesh.scale.setScalar(s);
    // keep cells to the right half so the headline stays clean
    mesh.position.set(1 + Math.random() * 14, (Math.random() - .5) * 16, -6 - Math.random() * 10);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    mesh.userData = { vy: .004 + Math.random() * .01, vr: (Math.random() - .5) * .01, phase: Math.random() * 6 };
    scene.add(mesh);
    cells.push(mesh);
  }
  // a few white cells (mint, bumpy) for variety
  const wbcGeo = new THREE.IcosahedronGeometry(.5, 3);
  const pos = wbcGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i);
    v.multiplyScalar(1 + (Math.sin(v.x * 9) * Math.cos(v.y * 7) * .08));
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  wbcGeo.computeVertexNormals();
  const wbcMat = new THREE.MeshStandardMaterial({ color: 0xeaf6f1, roughness: .7, emissive: TEAL, emissiveIntensity: .08 });
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(wbcGeo, wbcMat);
    m.position.set(2 + Math.random() * 12, (Math.random() - .5) * 12, -8 - Math.random() * 6);
    m.userData = { vy: .003 + Math.random() * .006, vr: .004, phase: Math.random() * 6 };
    scene.add(m);
    cells.push(m);
  }

  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', e => {
    mouse.x = e.clientX / innerWidth - .5;
    mouse.y = e.clientY / innerHeight - .5;
  }, { passive: true });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    tilt.position.x = w < 900 ? 2 : 6;
  }
  resize();
  addEventListener('resize', resize);

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime();
    const speed = reduceMotion ? 0 : 1;
    helix.rotation.y = t * .25 * speed;
    cells.forEach(c => {
      c.position.y += c.userData.vy * speed;
      c.position.x += Math.sin(t * .4 + c.userData.phase) * .004 * speed;
      c.rotation.x += c.userData.vr * speed;
      c.rotation.y += c.userData.vr * .7 * speed;
      if (c.position.y > 9) c.position.y = -9;
    });
    camera.position.x += (mouse.x * 2.2 - camera.position.x) * .04;
    camera.position.y += (-mouse.y * 1.4 - camera.position.y) * .04;
    camera.lookAt(0, 0, -4);
    renderer.render(scene, camera);
  }
  frame();
}

/* ---------------- About card helix ---------------- */
function aboutDna() {
  const canvas = document.getElementById('dna-canvas');
  if (!canvas) return;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
  camera.position.set(0, 0, 14);
  addLights(scene);
  const helix = buildHelix({ turns: 4, height: 18, radius: 1.4, sphere: .15, colors: [MINT, 0xffffff], rungColor: 0x9fd8c4 });
  const tilt = new THREE.Group();
  tilt.rotation.z = Math.PI / 2.4;
  tilt.position.set(1.5, 1.2, 0);
  tilt.add(helix);
  scene.add(tilt);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  const clock = new THREE.Clock();
  (function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    helix.rotation.y = clock.getElapsedTime() * (reduceMotion ? 0 : .5);
    renderer.render(scene, camera);
  })();
}

try { hero(); aboutDna(); } catch (err) { console.warn('3D scene unavailable:', err); }
