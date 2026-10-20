/* ============================================================
   VELVET 39 — Performance Interactive Engine
   Taste-Skill Compliant JavaScript Implementation
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initAgeModal();
    initCookieBanner();
    initHeroVideo();
    // 3D falling money with Cannon-es physics is handled in hero-money-3d.js
    // initMoneyRain();
    initNav();
    initMobileMenu();
    initGallery();
    initLightbox();
    initSmoothScroll();
    initMenuPageTabs();
  }

  // ── AGE VERIFICATION MODAL (18+) ────────────────────────────
  function initAgeModal() {
    const modal = document.getElementById('ageModal');
    const acceptBtn = document.getElementById('ageAcceptBtn');
    const rejectBtn = document.getElementById('ageRejectBtn');
    const warning = document.getElementById('ageWarning');

    if (!modal || !acceptBtn || !rejectBtn) return;

    const isVerified = sessionStorage.getItem('velvet39_age_verified') === 'true';

    if (isVerified) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    } else {
      document.body.style.overflow = 'hidden';
    }

    acceptBtn.addEventListener('click', () => {
      sessionStorage.setItem('velvet39_age_verified', 'true');
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    });

    rejectBtn.addEventListener('click', () => {
      if (warning) {
        warning.style.display = 'block';
      }
      acceptBtn.disabled = true;
      rejectBtn.disabled = true;
      setTimeout(() => {
        window.location.href = 'https://www.google.com';
      }, 1200);
    });
  }

  // ── PROCEDURAL NEON $100 BILL RAIN & BOKEH ENGINE ───────────
  function initMoneyRain() {
    const canvas = document.getElementById('moneyCanvas');
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none';
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0;
    let height = 0;
    let dpr = 1;

    // ── PROCEDURAL $100 BILL GENERATOR (OFFSCREEN CACHE) ────────
    // Real USD proportions: 2.36:1 ratio (236×100 px base)
    function createBaseBillCanvas() {
      const off = document.createElement('canvas');
      off.width = 236;
      off.height = 100;
      const c = off.getContext('2d');
      const w = 236;
      const h = 100;

      // 1. Base fill: gradient from #d63384 (dark pink) to #e84393 (hot pink)
      const baseGrad = c.createLinearGradient(0, 0, w, h);
      baseGrad.addColorStop(0, '#d63384');
      baseGrad.addColorStop(0.5, '#e84393');
      baseGrad.addColorStop(1, '#d63384');
      c.fillStyle = baseGrad;
      c.fillRect(0, 0, w, h);

      // 2. Paper texture: random noise dots scattered across at very low opacity
      // Deterministic PRNG to produce identical realistic grain
      let seed = 42;
      const rng = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      c.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let i = 0; i < 350; i++) {
        c.fillRect(rng() * w, rng() * h, rng() * 1.5 + 0.5, rng() * 1.5 + 0.5);
      }
      c.fillStyle = 'rgba(70, 0, 30, 0.05)';
      for (let i = 0; i < 280; i++) {
        c.fillRect(rng() * w, rng() * h, rng() * 1.2 + 0.5, rng() * 1.2 + 0.5);
      }

      // 3. Fine guilloche pattern: thin horizontal wavy lines across the bill in rgba(255,200,230,0.15)
      c.save();
      c.strokeStyle = 'rgba(255, 200, 230, 0.15)';
      c.lineWidth = 0.8;
      for (let y = 10; y <= h - 10; y += 4.5) {
        c.beginPath();
        for (let x = 8; x <= w - 8; x += 3) {
          const waveY = y + Math.sin(x * 0.12 + y * 0.22) * 1.6 + Math.cos(x * 0.06) * 1.1;
          if (x === 8) c.moveTo(x, waveY);
          else c.lineTo(x, waveY);
        }
        c.stroke();
      }

      // Concentric ornamental guilloche rings around the center
      c.lineWidth = 0.6;
      for (let r = 26; r <= 46; r += 5) {
        c.beginPath();
        c.ellipse(w / 2, h / 2, r * 0.95, r * 1.05, 0, 0, Math.PI * 2);
        c.stroke();
      }
      c.restore();

      // 4. Modern USD 3D security ribbon strip (vertical band at x ≈ 82)
      const ribbonX = 82;
      const ribbonW = 8;
      const ribbonGrad = c.createLinearGradient(ribbonX, 0, ribbonX + ribbonW, 0);
      ribbonGrad.addColorStop(0, 'rgba(155, 20, 85, 0.45)');
      ribbonGrad.addColorStop(0.5, 'rgba(255, 110, 180, 0.55)');
      ribbonGrad.addColorStop(1, 'rgba(155, 20, 85, 0.45)');
      c.fillStyle = ribbonGrad;
      c.fillRect(ribbonX, 4, ribbonW, h - 8);

      c.fillStyle = 'rgba(255, 230, 245, 0.4)';
      c.font = 'bold 5px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      for (let ry = 18; ry < h - 15; ry += 16) {
        c.fillText('100', ribbonX + ribbonW / 2, ry);
      }

      // 5. Border frame: 3px inset border in lighter pink #f0a6ca
      c.save();
      c.strokeStyle = '#f0a6ca';
      c.lineWidth = 3;
      c.strokeRect(3.5, 3.5, w - 7, h - 7);

      // Outer thin rim
      c.strokeStyle = '#fca5cb';
      c.lineWidth = 1;
      c.strokeRect(1.5, 1.5, w - 3, h - 3);

      // 6. Inner decorative border: 1px dashed line in #d4789c
      c.strokeStyle = '#d4789c';
      c.lineWidth = 1;
      c.setLineDash([4, 3]);
      c.strokeRect(8.5, 8.5, w - 17, h - 17);
      c.setLineDash([]);
      c.restore();

      // Decorative corner filigree brackets
      c.strokeStyle = 'rgba(240, 166, 202, 0.5)';
      c.lineWidth = 1;
      const cornerBrackets = [
        [10, 10, 1, 1],
        [w - 10, 10, -1, 1],
        [10, h - 10, 1, -1],
        [w - 10, h - 10, -1, -1]
      ];
      cornerBrackets.forEach(([cx, cy, dx, dy]) => {
        c.beginPath();
        c.moveTo(cx, cy + dy * 13);
        c.lineTo(cx, cy);
        c.lineTo(cx + dx * 13, cy);
        c.stroke();
      });

      // 7. Center oval: lighter pink ellipse with simplified portrait silhouette
      const cx = w / 2;
      const cy = h / 2;
      const rx = 30;
      const ry = 38;

      c.save();
      const ovalGrad = c.createRadialGradient(cx, cy, 4, cx, cy, ry);
      ovalGrad.addColorStop(0, '#f28dbd');
      ovalGrad.addColorStop(0.85, '#e06b9e');
      ovalGrad.addColorStop(1, '#c84b80');
      c.fillStyle = ovalGrad;
      c.beginPath();
      c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      c.fill();

      // Double ring border on oval
      c.strokeStyle = '#f8d7e8';
      c.lineWidth = 1.5;
      c.stroke();
      c.strokeStyle = '#d4789c';
      c.lineWidth = 0.8;
      c.beginPath();
      c.ellipse(cx, cy, rx - 3, ry - 3, 0, 0, Math.PI * 2);
      c.stroke();

      // Simplified portrait silhouette (dark shadow shape for Franklin's head/shoulders)
      c.save();
      c.beginPath();
      c.ellipse(cx, cy, rx - 1, ry - 1, 0, 0, Math.PI * 2);
      c.clip();

      c.fillStyle = '#5c0836';
      c.beginPath();
      c.moveTo(cx - 25, cy + ry);
      c.quadraticCurveTo(cx - 22, cy + 16, cx - 12, cy + 11);
      c.lineTo(cx - 6, cy + 6);
      c.quadraticCurveTo(cx - 15, cy + 2, cx - 14, cy - 14);
      c.quadraticCurveTo(cx - 12, cy - 26, cx - 2, cy - 28);
      c.quadraticCurveTo(cx + 8, cy - 28, cx + 12, cy - 20);
      c.lineTo(cx + 15, cy - 13);
      c.lineTo(cx + 13, cy - 10);
      c.quadraticCurveTo(cx + 14, cy - 6, cx + 12, cy - 3);
      c.quadraticCurveTo(cx + 13, cy + 3, cx + 9, cy + 6);
      c.quadraticCurveTo(cx + 14, cy + 12, cx + 24, cy + ry);
      c.closePath();
      c.fill();

      // White/pink cravat accent
      c.fillStyle = '#f8d7e8';
      c.beginPath();
      c.moveTo(cx - 5, cy + 7);
      c.lineTo(cx + 2, cy + 7);
      c.lineTo(cx, cy + 18);
      c.closePath();
      c.fill();

      // Hair & facial contour lines
      c.strokeStyle = 'rgba(248, 215, 232, 0.45)';
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(cx - 11, cy - 16);
      c.quadraticCurveTo(cx - 8, cy - 6, cx - 10, cy + 4);
      c.moveTo(cx + 2, cy - 2);
      c.quadraticCurveTo(cx + 6, cy + 2, cx + 2, cy + 7);
      c.stroke();

      c.restore(); // clip
      c.restore(); // oval save

      // 8. Seals & Emblems
      c.save();
      // Left Federal Reserve circular seal
      c.strokeStyle = 'rgba(122, 19, 70, 0.75)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(48, cy, 12, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = 'rgba(122, 19, 70, 0.65)';
      c.font = 'bold 9px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('B', 48, cy);

      // Right Treasury circular seal
      c.strokeStyle = 'rgba(240, 166, 202, 0.8)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(188, cy, 11, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = 'rgba(248, 215, 232, 0.75)';
      c.font = 'bold 7px sans-serif';
      c.fillText('USA', 188, cy);
      c.restore();

      // 9. Micro-text headers
      c.fillStyle = '#f8d7e8';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.font = 'bold 6.5px "Arial Black", Arial, sans-serif';
      c.fillText('THE UNITED STATES OF AMERICA', w / 2, 14);

      c.font = 'bold 5.5px "Arial Black", Arial, sans-serif';
      c.fillText('ONE HUNDRED DOLLARS', w / 2, h - 14);

      // 10. Corner denomination marks: "100" in each corner in #f8d7e8
      c.fillStyle = '#f8d7e8';
      c.font = '900 11.5px "Arial Black", Impact, sans-serif';
      c.textBaseline = 'top';

      c.textAlign = 'left';
      c.fillText('100', 12, 11);

      c.textAlign = 'right';
      c.fillText('100', w - 12, 11);

      c.textBaseline = 'bottom';
      c.textAlign = 'left';
      c.fillText('100', 12, h - 11);

      c.textAlign = 'right';
      c.font = '900 14px "Arial Black", Impact, sans-serif';
      c.fillStyle = '#ffc0e0';
      c.fillText('100', w - 12, h - 10);

      // 11. Subtle specular highlights — soft white gradient on upper-left area
      const specGrad = c.createLinearGradient(0, 0, w * 0.75, h * 0.75);
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      specGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.10)');
      specGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.02)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      c.fillStyle = specGrad;
      c.fillRect(0, 0, w, h);

      return off;
    }

    // Create 3 variants at different sizes for depth variety:
    // - Large bill: 236×100 for foreground
    // - Medium bill: 177×75 for midground
    // - Small bill: 118×50 for background (with depth-of-field blur)
    const billLarge = createBaseBillCanvas();

    const canvasMed = document.createElement('canvas');
    canvasMed.width = 177;
    canvasMed.height = 75;
    const ctxMed = canvasMed.getContext('2d');
    ctxMed.drawImage(billLarge, 0, 0, 177, 75);

    const canvasSmall = document.createElement('canvas');
    canvasSmall.width = 118;
    canvasSmall.height = 50;
    const ctxSmall = canvasSmall.getContext('2d');
    let blurred = false;
    try {
      if ('filter' in ctxSmall) {
        ctxSmall.filter = 'blur(1.2px)';
        ctxSmall.drawImage(billLarge, 0, 0, 118, 50);
        ctxSmall.filter = 'none';
        blurred = true;
      }
    } catch (e) {
      blurred = false;
    }
    if (!blurred) {
      ctxSmall.globalAlpha = 0.5;
      ctxSmall.drawImage(billLarge, -0.6, 0, 118, 50);
      ctxSmall.drawImage(billLarge, 0.6, 0, 118, 50);
      ctxSmall.drawImage(billLarge, 0, -0.6, 118, 50);
      ctxSmall.drawImage(billLarge, 0, 0.6, 118, 50);
      ctxSmall.globalAlpha = 1.0;
    }

    const variants = {
      large: { canvas: billLarge, w: 236, h: 100 },
      medium: { canvas: canvasMed, w: 177, h: 75 },
      small: { canvas: canvasSmall, w: 118, h: 50 }
    };

    function resize() {
      const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : null;
      width = rect && rect.width ? rect.width : window.innerWidth;
      height = rect && rect.height ? rect.height : window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Interactive air currents from mouse movement
    let prevMouseX = -1000;
    let mouseWind = 0;
    window.addEventListener('mousemove', e => {
      if (prevMouseX !== -1000) {
        mouseWind = (e.clientX - prevMouseX) * 0.025;
      }
      prevMouseX = e.clientX;
    }, { passive: true });

    // ── FLOATING NEON PINK BOKEH & DUST PARTICLES ────────────────
    const BOKEH_COUNT = 38;
    const bokehList = [];

    class NeonDust {
      constructor(initRandomY = true) {
        this.reset(initRandomY);
      }

      reset(initRandomY = false) {
        this.x = Math.random() * (width + 60) - 30;
        this.y = initRandomY ? Math.random() * height : height + 10 + Math.random() * 20;
        this.isOrb = Math.random() > 0.65;
        if (this.isOrb) {
          this.size = 6 + Math.random() * 12; // 6-18px larger soft orbs
          this.baseAlpha = 0.08 + Math.random() * 0.14;
        } else {
          this.size = 1 + Math.random() * 2; // 1-3px tiny dust specks
          this.baseAlpha = 0.35 + Math.random() * 0.45;
        }

        this.vy = -(0.2 + Math.random() * 0.45); // vy = -(0.2 to 0.65)
        this.vx = (Math.random() - 0.5) * 0.3; // subtle horizontal wander
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.03;
      }

      update(dtRatio) {
        this.pulsePhase += this.pulseSpeed * dtRatio;
        this.x += (this.vx + mouseWind * 0.2) * dtRatio;
        this.y += this.vy * dtRatio;

        if (this.y < -30) {
          this.reset(false);
        }
        if (this.x < -40) this.x = width + 30;
        if (this.x > width + 40) this.x = -30;
      }

      draw() {
        // Pulsing alpha with sine wave
        const alpha = Math.max(0, this.baseAlpha * (0.7 + 0.3 * Math.sin(this.pulsePhase)));
        ctx.save();
        ctx.globalAlpha = alpha;

        if (this.isOrb) {
          // Radial gradient from rgba(255,42,141,0.9) center to transparent edge
          const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
          grad.addColorStop(0, 'rgba(255, 42, 141, 0.9)');
          grad.addColorStop(0.5, 'rgba(224, 36, 195, 0.4)');
          grad.addColorStop(1, 'rgba(255, 42, 141, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Solid #ff52a5 with neon glow
          ctx.fillStyle = '#ff52a5';
          ctx.shadowColor = '#ff2a8d';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    for (let i = 0; i < BOKEH_COUNT; i++) {
      bokehList.push(new NeonDust(true));
    }

    // ── FALLING $100 BANKNOTE CLASS ─────────────────────────────
    const BILL_COUNT = 28;
    const bills = [];

    class FallingBill {
      constructor(index, total) {
        this.index = index;
        this.total = total;
        this.reset(true);
      }

      reset(isInitial = false) {
        // Depth system: 0 (background) to 1 (foreground)
        this.depth = Math.random();

        if (this.depth < 0.4) {
          // Background: smaller scale (0.3-0.55), slower fall, lower alpha (0.4-0.6)
          const t = this.depth / 0.4;
          this.scale = 0.3 + t * (0.55 - 0.3);
          this.alpha = 0.4 + t * (0.6 - 0.4);
          this.terminalVy = 1.0 + Math.random() * 0.5;
          this.variant = variants.small;
        } else if (this.depth > 0.75) {
          // Foreground: larger scale (0.75-1.0), faster fall, higher alpha (0.85-1.0), subtle neon glow shadow
          const t = (this.depth - 0.75) / 0.25;
          this.scale = 0.75 + t * (1.0 - 0.75);
          this.alpha = 0.85 + t * (1.0 - 0.85);
          this.terminalVy = 2.2 + Math.random() * 0.8;
          this.variant = variants.large;
        } else {
          // Midground: medium scale and speed
          const t = (this.depth - 0.4) / 0.35;
          this.scale = 0.55 + t * (0.75 - 0.55);
          this.alpha = 0.6 + t * (0.85 - 0.6);
          this.terminalVy = 1.5 + Math.random() * 0.7;
          this.variant = variants.medium;
        }

        // Stagger initial positions vertically across the screen
        this.x = Math.random() * (width + 120) - 60;
        this.y = isInitial
          ? (this.index / this.total) * (height + 240) - 120
          : -100 - Math.random() * 80;

        this.vx = 0;
        this.vy = this.terminalVy * 0.7;

        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.04; // random ±0.02

        this.swayPhase = Math.random() * Math.PI * 2;
        this.swayAmp = 1.0 + Math.random() * 1.2;
      }

      update(time, dtRatio) {
        // Wind drift: vx += sin(time * 0.001 + x * 0.01) * 0.05
        this.vx += Math.sin(time * 0.001 + this.x * 0.01) * 0.05 * dtRatio;
        this.vx += mouseWind * (0.3 + this.depth * 0.7);
        this.vx *= Math.pow(0.96, dtRatio);

        // Horizontal sway: x += sin(swayPhase) * swayAmp; swayPhase += 0.02
        this.x += Math.sin(this.swayPhase) * this.swayAmp * dtRatio;
        this.swayPhase += 0.02 * dtRatio;

        // Apply wind to horizontal position
        this.x += this.vx * dtRatio;

        // Rotation: rot += rotSpeed; rotSpeed is random ±0.02
        this.rot += this.rotSpeed * dtRatio;

        // Gravity: vy += 0.15 * dtRatio
        this.vy += 0.15 * dtRatio;

        // Air resistance: vy *= 0.995 — bills reach terminal velocity ~1-3 px/frame, float gently
        this.vy *= Math.pow(0.995, dtRatio);
        if (this.vy > this.terminalVy) {
          this.vy = this.terminalVy;
        }
        this.y += this.vy * dtRatio;

        // Respawn when bill falls below canvas height + 160
        if (this.y > height + 160) {
          this.reset(false);
          bills.sort((a, b) => a.depth - b.depth);
        }

        // Horizontal screen wrap
        if (this.x < -140) this.x = width + 100;
        if (this.x > width + 140) this.x = -100;
      }

      draw() {
        // Edge fading: Bills near top edge (y < 80) fade in gradually,
        // bills near bottom edge (y > height - 100) fade out gradually
        let edgeAlpha = 1.0;
        if (this.y < 80) {
          edgeAlpha = Math.max(0, (this.y + 80) / 160);
        } else if (this.y > height - 100) {
          edgeAlpha = Math.max(0, (height + 160 - this.y) / 260);
        }

        const finalAlpha = this.alpha * edgeAlpha;
        if (finalAlpha <= 0.01) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);

        // 3D tumble effect: scaleX = cos(rot * 0.7)
        // When scaleX is near 0, bill is seen edge-on (very thin)
        // When scaleX < 0, darken bill with overlay rgba(0,0,0,0.3) for back side
        const scaleX = Math.cos(this.rot * 0.7);
        const safeScaleX = Math.abs(scaleX) < 0.02 ? 0.02 * Math.sign(scaleX || 1) : scaleX;

        const baseW = this.variant.w;
        const baseH = this.variant.h;
        const s = this.scale / (baseW / 236);

        ctx.scale(safeScaleX * s, s);
        ctx.globalAlpha = finalAlpha;

        // Neon glow on foreground bills (depth > 0.75)
        if (this.depth > 0.75) {
          ctx.shadowColor = 'rgba(255, 42, 141, 0.45)';
          ctx.shadowBlur = 14;
        }

        ctx.drawImage(this.variant.canvas, -baseW / 2, -baseH / 2, baseW, baseH);

        // Darken back side when scaleX < 0
        if (scaleX < 0) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(-baseW / 2, -baseH / 2, baseW, baseH);
        }

        ctx.restore();
      }
    }

    for (let i = 0; i < BILL_COUNT; i++) {
      bills.push(new FallingBill(i, BILL_COUNT));
    }
    // Sort bills by depth so background draws first
    bills.sort((a, b) => a.depth - b.depth);

    // Delta-time rendering loop (ultra-smooth 60fps)
    let lastTime = performance.now();
    let isVisible = true;
    let animId = null;

    function renderLoop(now) {
      if (isVisible) {
        // Cap delta to 40ms to prevent jumps on tab refocus
        const delta = Math.min(now - lastTime, 40);
        lastTime = now;
        const dtRatio = delta / 16.667; // normalize to 60fps standard

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        // mouseWind decays smoothly each frame
        mouseWind *= 0.94;

        // 1. Draw floating neon pink bokeh & dust particles
        for (let i = 0; i < bokehList.length; i++) {
          bokehList[i].update(dtRatio);
          bokehList[i].draw();
        }

        // 2. Draw falling bills (sorted background to foreground)
        for (let i = 0; i < bills.length; i++) {
          bills[i].update(now, dtRatio);
          bills[i].draw();
        }
      }

      animId = requestAnimationFrame(renderLoop);
    }

    // Pause animation when hero is not visible
    if ('IntersectionObserver' in window) {
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            isVisible = entry.isIntersecting;
            if (isVisible) lastTime = performance.now();
          });
        }, { threshold: 0.05 });
        observer.observe(heroSection);
      }
    }

    animId = requestAnimationFrame(renderLoop);
  }

  // ── NAVIGATION SCROLL & ACTIVE STATES ───────────────────────
  function initNav() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;

    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── MOBILE MENU TOGGLE ──────────────────────────────────────
  function initMobileMenu() {
    const burger = document.getElementById('navBurger');
    const menu = document.getElementById('mobileMenu');
    const links = document.querySelectorAll('[data-mobile-link]');

    if (!burger || !menu) return;

    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('open');
      menu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── GALLERY FILTER TABS ─────────────────────────────────────
  function initGallery() {
    const filterBtns = document.querySelectorAll('.gallery__filter-btn');
    const items = document.querySelectorAll('.gallery__item');

    if (!filterBtns.length || !items.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-filter');

        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        items.forEach(item => {
          const itemCat = item.getAttribute('data-category');
          if (category === 'all' || itemCat === category) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // ── GALLERY LIGHTBOX MODAL ──────────────────────────────────
  function initLightbox() {
    const modal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    const backdrop = document.getElementById('lightboxBackdrop');
    const galleryItems = document.querySelectorAll('.gallery__item');

    if (!modal || !modalImg || !galleryItems.length) return;

    const images = [];
    galleryItems.forEach((item, index) => {
      const img = item.querySelector('img');
      if (img) {
        images.push(img.getAttribute('src'));
        item.addEventListener('click', () => {
          openLightbox(index);
        });
      }
    });

    let currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      renderImage();
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    function renderImage() {
      modalImg.src = images[currentIndex];
      if (counter) {
        counter.textContent = `${currentIndex + 1} / ${images.length}`;
      }
    }

    function prevImage() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      renderImage();
    }

    function nextImage() {
      currentIndex = (currentIndex + 1) % images.length;
      renderImage();
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (backdrop) backdrop.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    });
  }

  // ── SMOOTH SCROLL FOR IN-PAGE LINKS ─────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const navHeight = 76;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: top,
          behavior: 'smooth'
        });
      });
    });
  }

  // ── MENU PAGE CATEGORY TABS (for menu.html) ─────────────────
  function initMenuPageTabs() {
    const tabs = document.querySelectorAll('.menu-nav-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetId = tab.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          const navHeight = 140;
          const top = targetSection.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({
            top: top,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ── HERO VIDEO ENHANCEMENT & RESOURCE OPTIMIZATION ──────────
  function initHeroVideo() {
    const video = document.querySelector('.hero__bg-video');
    if (!video) return;

    video.muted = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const onFirstInteract = () => {
          video.play().catch(() => {});
          document.removeEventListener('click', onFirstInteract);
          document.removeEventListener('touchstart', onFirstInteract);
        };
        document.addEventListener('click', onFirstInteract, { once: true });
        document.addEventListener('touchstart', onFirstInteract, { once: true });
      });
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.1 });
      observer.observe(video);
    }
  }

  // ── COOKIE & PERSONAL DATA CONSENT BANNER ───────────────────
  function initCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookieAcceptBtn');
    if (!banner || !acceptBtn) return;

    const isAccepted = localStorage.getItem('velvet39_cookie_accepted') === 'true';
    if (!isAccepted) {
      setTimeout(() => {
        banner.classList.add('show');
      }, 1500);
    }

    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('velvet39_cookie_accepted', 'true');
      banner.classList.remove('show');
    });
  }

})();