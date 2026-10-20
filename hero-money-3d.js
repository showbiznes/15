/**
 * ============================================================
 * 3D Falling Realistic USD Money Engine for Velvet 39 Hero
 * Three.js + Cannon-es (Physics & Aerodynamics)
 * ============================================================
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function initHeroMoney3D(canvasId = 'moneyCanvas', containerSelector = '#hero') {
  const canvas = document.getElementById(canvasId);
  const container = document.querySelector(containerSelector);
  if (!canvas || !container) {
    console.warn('[Money3D] Не найден canvas или hero контейнер.');
    return;
  }

  // Проверка prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  // Адаптивные параметры для мобильных устройств
  const isMobile = window.innerWidth < 768 || ('ontouchstart' in window);
  const MAX_BILLS = isMobile ? 18 : 45;       // До 18 на смартфонах, до 45 на ПК
  const ENABLE_SHADOWS = !isMobile;           // Отключение теней на мобильных для 60 FPS
  const BILL_ASPECT = 156 / 66;               // Реальные пропорции 100 USD: 2.36:1
  const BILL_WIDTH = 2.4;
  const BILL_HEIGHT = BILL_WIDTH / BILL_ASPECT; // ~1.015
  const BILL_THICKNESS = 0.01;                // Тонкий объемный Box 0.01

  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;

  // ── 1. THREE.JS СЦЕНА, КАМЕРА, РЕНДЕРЕР ───────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  if (ENABLE_SHADOWS) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 16);
  camera.lookAt(0, 0, 0);

  // ── 2. ОСВЕЩЕНИЕ (Ambient + Directional с тенями + Rim) ───
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xfff6ea, 2.0);
  dirLight.position.set(6, 14, 10);
  if (ENABLE_SHADOWS) {
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 30;
    const d = 12;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
  }
  scene.add(dirLight);

  // Неоновый ночной клубный свет сзади
  const clubRimLight = new THREE.DirectionalLight(0xb24bf3, 0.85);
  clubRimLight.position.set(-8, -4, -6);
  scene.add(clubRimLight);

  // ── 3. ПРОЦЕДУРНАЯ ГЕНЕРАЦИЯ ТЕКСТУР $100 БАНКНОТЫ ─────────
  // Создает фотореалистичные Front, Back и Normal Map текстуры
  function generateTextures() {
    const tw = 1024;
    const th = Math.round(tw / BILL_ASPECT);

    // Front Canvas
    const fc = document.createElement('canvas');
    fc.width = tw; fc.height = th;
    const fctx = fc.getContext('2d');

    const fGrad = fctx.createLinearGradient(0, 0, tw, th);
    fGrad.addColorStop(0, '#e5ebd9');
    fGrad.addColorStop(0.5, '#f4f6ee');
    fGrad.addColorStop(1, '#dfe7d1');
    fctx.fillStyle = fGrad;
    fctx.fillRect(0, 0, tw, th);

    // Рамка гильош
    fctx.strokeStyle = '#223c28';
    fctx.lineWidth = 4;
    fctx.strokeRect(12, 12, tw - 24, th - 24);
    fctx.strokeStyle = '#38583d';
    fctx.lineWidth = 1.5;
    fctx.strokeRect(16, 16, tw - 32, th - 32);

    // Номиналы 100
    fctx.font = 'bold 36px "Times New Roman", Georgia, serif';
    fctx.fillStyle = '#1c3620';
    fctx.textAlign = 'left';
    fctx.fillText('100', 26, 54);
    fctx.fillText('100', 26, th - 26);
    fctx.textAlign = 'right';
    fctx.fillText('100', tw - 26, 54);

    // Крупная цифра 100 справа внизу
    fctx.fillStyle = '#9e6e2b';
    fctx.font = '900 64px "Times New Roman"';
    fctx.fillText('100', tw - 34, th - 28);

    // Синяя 3D-лента безопасности
    const rX = 350, rW = 42;
    const rGrad = fctx.createLinearGradient(rX, 0, rX + rW, 0);
    rGrad.addColorStop(0, '#1c4a75');
    rGrad.addColorStop(0.5, '#4990c8');
    rGrad.addColorStop(1, '#1b446a');
    fctx.fillStyle = rGrad;
    fctx.fillRect(rX, 16, rW, th - 32);

    // Тексты
    fctx.fillStyle = '#1e3822';
    fctx.textAlign = 'center';
    fctx.font = 'bold 15px "Times New Roman"';
    fctx.fillText('FEDERAL RESERVE NOTE', tw / 2, 34);
    fctx.font = '900 24px "Times New Roman"';
    fctx.fillText('THE UNITED STATES OF AMERICA', tw / 2, 60);

    // Портрет Бенджамина Франклина
    const pX = tw / 2 + 10, pY = th / 2 + 8;
    fctx.fillStyle = '#223c27';
    fctx.beginPath(); fctx.ellipse(pX, pY + 70, 75, 55, 0, Math.PI, 0); fctx.fill();
    fctx.fillStyle = '#f4f6ee';
    fctx.beginPath(); fctx.rect(pX - 10, pY + 28, 20, 40); fctx.fill();
    fctx.fillStyle = '#233d28';
    fctx.beginPath(); fctx.ellipse(pX, pY - 15, 46, 56, 0, 0, Math.PI * 2); fctx.fill();
    fctx.font = 'bold 10px "Times New Roman"';
    fctx.fillText('FRANKLIN', pX, th - 22);

    // Back Canvas (Independence Hall)
    const bc = document.createElement('canvas');
    bc.width = tw; bc.height = th;
    const bctx = bc.getContext('2d');
    bctx.fillStyle = '#e4ecd7';
    bctx.fillRect(0, 0, tw, th);

    bctx.strokeStyle = '#274b30';
    bctx.lineWidth = 4;
    bctx.strokeRect(12, 12, tw - 24, th - 24);

    bctx.fillStyle = '#214228';
    bctx.font = 'bold 36px "Times New Roman"';
    bctx.textAlign = 'left'; bctx.fillText('100', 28, 56); bctx.fillText('100', 28, th - 28);
    bctx.textAlign = 'right'; bctx.fillText('100', tw - 28, 56);

    bctx.textAlign = 'center';
    bctx.font = '900 24px "Times New Roman"';
    bctx.fillText('THE UNITED STATES OF AMERICA', tw / 2, 54);
    bctx.font = 'bold 13px "Times New Roman"';
    bctx.fillText('IN GOD WE TRUST', tw / 2, 74);

    // Здание
    bctx.fillStyle = '#295436';
    bctx.fillRect(tw / 2 - 150, th / 2 - 10, 300, 80);
    bctx.fillRect(tw / 2 - 60, th / 2 - 40, 120, 110);
    bctx.fillRect(tw / 2 - 25, th / 2 - 80, 50, 40);
    bctx.font = 'bold 11px "Times New Roman"';
    bctx.fillText('INDEPENDENCE HALL', tw / 2, th - 35);
    bctx.font = '900 20px "Times New Roman"';
    bctx.fillText('ONE HUNDRED DOLLARS', tw / 2, th - 14);

    // Normal Map
    const nw = 512, nh = Math.round(nw / BILL_ASPECT);
    const nc = document.createElement('canvas');
    nc.width = nw; nc.height = nh;
    const nctx = nc.getContext('2d');
    const nImg = nctx.createImageData(nw, nh);
    for (let i = 0; i < nImg.data.length; i += 4) {
      nImg.data[i] = 128 + (Math.random() - 0.5) * 14;
      nImg.data[i + 1] = 128 + (Math.random() - 0.5) * 14;
      nImg.data[i + 2] = 255;
      nImg.data[i + 3] = 255;
    }
    nctx.putImageData(nImg, 0, 0);

    return { fc, bc, nc };
  }

  const { fc, bc, nc } = generateTextures();

  const frontTexture = new THREE.CanvasTexture(fc);
  frontTexture.colorSpace = THREE.SRGBColorSpace;
  frontTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const backTexture = new THREE.CanvasTexture(bc);
  backTexture.colorSpace = THREE.SRGBColorSpace;
  backTexture.wrapS = THREE.RepeatWrapping;
  backTexture.repeat.x = -1; // Не переворачивает изображение задом наперед

  const normalTexture = new THREE.CanvasTexture(nc);

  // 6 материалов для граней: [X+, X-, Y+, Y-, Z+ (Front), Z- (Back)]
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xe0ead5, roughness: 0.9, metalness: 0 });
  const frontMat = new THREE.MeshStandardMaterial({
    map: frontTexture,
    normalMap: normalTexture,
    normalScale: new THREE.Vector2(0.3, 0.3),
    roughness: 0.75,
    metalness: 0.05
  });
  const backMat = new THREE.MeshStandardMaterial({
    map: backTexture,
    normalMap: normalTexture,
    normalScale: new THREE.Vector2(0.3, 0.3),
    roughness: 0.75,
    metalness: 0.05
  });

  const billMaterials = [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat];
  const billGeometry = new THREE.BoxGeometry(BILL_WIDTH, BILL_HEIGHT, BILL_THICKNESS);

  // ── 4. CANNON-ES ФИЗИЧЕСКИЙ МИР ────────────────────────────
  const world = new CANNON.World();
  // Замедленная гравитация по ТЗ: -2.8 м/с² для плавного падения
  world.gravity.set(0, -2.8, 0);
  world.broadphase = new CANNON.SAPBroadphase(world);

  const billShape = new CANNON.Box(new CANNON.Vec3(
    BILL_WIDTH / 2,
    BILL_HEIGHT / 2,
    BILL_THICKNESS / 2
  ));

  // ── 5. КЛАСС КУПЮРЫ (THREE MESH + CANNON RIGID BODY) ───────
  class BillItem {
    constructor(initY = null) {
      this.mesh = new THREE.Mesh(billGeometry, billMaterials);
      if (ENABLE_SHADOWS) {
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
      }
      scene.add(this.mesh);

      // Масса 0.05, linearDamping = 0.6, angularDamping = 0.8
      this.body = new CANNON.Body({
        mass: 0.05,
        shape: billShape,
        linearDamping: 0.6,
        angularDamping: 0.8
      });
      world.addBody(this.body);

      this.flutterSeed = Math.random() * 100;
      this.reset(initY);
    }

    reset(targetY = null) {
      // Спавн сверху (y = +10...12) со случайным смещением по X и Z
      const spawnX = (Math.random() - 0.5) * 18;
      const spawnZ = (Math.random() - 0.5) * 8;
      const spawnY = (targetY !== null) ? targetY : (10 + Math.random() * 3);

      this.body.position.set(spawnX, spawnY, spawnZ);

      // Случайная начальная 3D ориентация (quaternion)
      const euler = new THREE.Euler(
        (Math.random() - 0.5) * Math.PI,
        (Math.random() - 0.5) * Math.PI,
        (Math.random() - 0.5) * Math.PI
      );
      const q = new THREE.Quaternion().setFromEuler(euler);
      this.body.quaternion.set(q.x, q.y, q.z, q.w);

      this.body.velocity.set(
        (Math.random() - 0.5) * 0.5,
        -(0.2 + Math.random() * 0.6),
        (Math.random() - 0.5) * 0.5
      );
      this.body.angularVelocity.set(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5
      );
    }

    applyFlutter(time) {
      // Эффект "порхания": микро-силы по X и Z для плавного покачивания
      const fx = Math.sin(time * 2.2 + this.flutterSeed) * 0.012;
      const fz = Math.cos(time * 1.8 + this.flutterSeed) * 0.010;
      const torqueY = Math.sin(time * 1.5 + this.flutterSeed) * 0.003;

      this.body.applyForce(new CANNON.Vec3(fx, 0, fz), this.body.position);
      this.body.torque.y += torqueY;
    }

    update() {
      // Синхронизация визуальной сетки Three.js с физикой Cannon.js
      this.mesh.position.copy(this.body.position);
      this.mesh.quaternion.copy(this.body.quaternion);

      // Удаление/респавн при падении ниже y = -10
      if (this.body.position.y < -10) {
        this.reset(10 + Math.random() * 2);
      }
    }
  }

  // Заполняем пул с начальным вертикальным распределением
  const bills = [];
  for (let i = 0; i < MAX_BILLS; i++) {
    const staggeredY = -9 + (i / MAX_BILLS) * 20;
    bills.push(new BillItem(staggeredY));
  }

  // ── 6. ИНТЕРАКТИВНОСТЬ С МЫШЬЮ / ТАЧЕМ (РАЗЛЕТ КУПЮР) ───────
  const mouseRaycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-999, -999);
  const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  window.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect();
    if (e.clientY < rect.top || e.clientY > rect.bottom) return;

    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    mouseRaycaster.setFromCamera(mouse, camera);
    const hitPoint = new THREE.Vector3();
    mouseRaycaster.ray.intersectPlane(interactionPlane, hitPoint);

    if (hitPoint) {
      const radius = 3.6;
      for (let i = 0; i < bills.length; i++) {
        const b = bills[i];
        const bPos = new THREE.Vector3(b.body.position.x, b.body.position.y, b.body.position.z);
        const dist = bPos.distanceTo(hitPoint);

        if (dist < radius) {
          const push = new THREE.Vector3().subVectors(bPos, hitPoint).normalize();
          const power = (1 - dist / radius) * 0.045;
          b.body.applyImpulse(new CANNON.Vec3(push.x * power, push.y * power + 0.02, push.z * power), b.body.position);
          b.body.angularVelocity.x += (Math.random() - 0.5) * 3;
          b.body.angularVelocity.y += (Math.random() - 0.5) * 3;
        }
      }
    }
  }, { passive: true });

  // ── 7. РЕСАЙЗ И INTERSECTION OBSERVER ───────────────────────
  function onResize() {
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }
  window.addEventListener('resize', onResize, { passive: true });

  // Пауза при скролле вниз, когда Hero скрыт
  let isVisible = true;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { isVisible = entry.isIntersecting; });
    }, { threshold: 0.05 });
    observer.observe(container);
  }

  // ── 8. ЦИКЛ АНИМАЦИИ (60 FPS) ─────────────────────────────
  const TIME_STEP = 1 / 60;
  let lastTime = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    world.step(TIME_STEP, delta, 3);

    const timeSec = now * 0.001;
    for (let i = 0; i < bills.length; i++) {
      bills[i].applyFlutter(timeSec);
      bills[i].update();
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
}

// Автоматический запуск
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initHeroMoney3D('moneyCanvas', '#hero'));
} else {
  initHeroMoney3D('moneyCanvas', '#hero');
}
