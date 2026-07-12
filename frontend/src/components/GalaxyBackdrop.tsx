"use client";

import React, { useEffect, useRef } from "react";

/**
 * A self-playing galaxy rendered with plain Canvas2D — no WebGL.
 *
 * This intentionally avoids three.js/WebGL: on some integrated-graphics
 * laptops, WebGL context creation/loss was unreliable and caused the whole
 * page to flicker or show nothing. Canvas2D has no context-negotiation step,
 * so it can't fail the same way.
 *
 * A `progress` value (0 → 1) cycles back and forth on its own (a slow
 * triangle wave driven by elapsed time, no scroll input) and drives the
 * same life-cycle morph as the original WebGL version:
 * gas cloud → (perturbation / proto-disk collapse) → spiral disk →
 * elliptical old galaxy, then back again — with a matching color shift per
 * stage and a slow orbiting view that flattens toward top-down during the
 * disk phase. The cursor acts as a light gravity well while hovering.
 */
export function GalaxyBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    const smoothstep = (a: number, b: number, x: number) => {
      const t = clamp01((x - a) / (b - a));
      return t * t * (3 - 2 * t);
    };
    const mix3 = (a: number[], b: number[], t: number) => [
      lerp(a[0], b[0], t),
      lerp(a[1], b[1], t),
      lerp(a[2], b[2], t),
    ];
    const randn = () => {
      let u = 0;
      let v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    interface Particle {
      gasX: number; gasY: number; gasZ: number;
      diskR: number; diskAngle0: number; diskH: number;
      ellX: number; ellY: number; ellZ: number;
      seedX: number; seedY: number; seedZ: number;
      size: number;
    }

    const COUNT = 4500;
    const particles: Particle[] = [];

    const clumps: number[][] = [];
    for (let k = 0; k < 7; k++) clumps.push([randn() * 5.5, randn() * 2.6, randn() * 5.5]);

    const branches = 2;
    // Tighter winding than the original WebGL version (which relied on
    // 60k-100k GPU-rendered points for arm contrast) so the ~4-5k points a
    // CPU canvas can comfortably draw still read as visible spiral arms
    // rather than a diffuse blob.
    const spin = 2.6;
    const galaxyRadius = 5.2;

    for (let i = 0; i < COUNT; i++) {
      let gasX: number, gasY: number, gasZ: number;
      if (Math.random() < 0.3) {
        const c = clumps[(Math.random() * clumps.length) | 0];
        gasX = c[0] + randn() * 2.3;
        gasY = c[1] + randn() * 1.4;
        gasZ = c[2] + randn() * 2.3;
      } else {
        const rr = 9.5 * Math.cbrt(Math.random());
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        gasX = rr * Math.sin(phi) * Math.cos(theta);
        gasY = rr * Math.cos(phi) * 0.7;
        gasZ = rr * Math.sin(phi) * Math.sin(theta);
      }

      let diskR: number, diskAngle0: number, diskH: number;
      if (Math.random() < 0.17) {
        const r = Math.pow(Math.random(), 2.5) * 1.1;
        diskR = r;
        diskAngle0 = Math.random() * Math.PI * 2;
        diskH = randn() * 0.55 * (1 - r / 1.4);
      } else {
        const r = Math.pow(Math.random(), 1.7) * galaxyRadius + 0.18;
        const branchAngle = ((i % branches) / branches) * Math.PI * 2;
        diskR = r;
        diskAngle0 = branchAngle + r * spin + randn() * 0.12;
        diskH = randn() * (0.1 + 0.02 * r);
      }

      particles.push({
        gasX, gasY, gasZ,
        diskR, diskAngle0, diskH,
        ellX: randn() * 3.6, ellY: randn() * 2.3, ellZ: randn() * 3.0,
        seedX: Math.random(), seedY: Math.random(), seedZ: Math.random(),
        size: rand(0.7, 2.1),
      });
    }

    let width = 0, height = 0, dpr = 1;
    const resize = () => {
      width = container.clientWidth || 1;
      height = container.clientHeight || 1;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let mouseX = -9999, mouseY = -9999, lastMove = -10, clock = 0, strength = 0;
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      lastMove = clock;
    };
    container.addEventListener("mousemove", onMove);

    let visible = true;
    let last = performance.now();
    const onVisibility = () => {
      visible = !document.hidden;
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const CYCLE_SECONDS = 55;
    const cGas = [77, 107, 204], cHot = [255, 204, 133], cCore = [255, 247, 235];
    const cArm = [128, 158, 255], cPink = [255, 140, 210], cEllip = [255, 168, 107];

    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (visible) {
        clock += dt * (reduce ? 0.35 : 1);
        const t = clock;

        const cyclePos = (t / CYCLE_SECONDS) % 2;
        const p = cyclePos <= 1 ? cyclePos : 2 - cyclePos;

        const idle = t - lastMove > 2.2;
        strength += ((idle ? 0 : 1) - strength) * 0.07;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#04030c";
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        const scaleBase = Math.min(width, height) / 22;

        const topDown = Math.exp(-Math.pow((p - 0.5) / 0.3, 2));
        const flattenY = lerp(0.9, 1.0, topDown);
        const zoom = 1.0 - 0.1 * topDown;

        const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.5);
        coreGlow.addColorStop(0, "rgba(140,150,255,0.14)");
        coreGlow.addColorStop(1, "rgba(140,150,255,0)");
        ctx.fillStyle = coreGlow;
        ctx.fillRect(0, 0, width, height);

        // Additive blending: overlapping particles brighten instead of just
        // averaging color, so denser regions (the spiral arms) visibly glow
        // against sparser gaps — without this the arm shape barely reads at
        // a particle count a CPU canvas can comfortably draw every frame.
        ctx.globalCompositeOperation = "lighter";

        const orbit = t * 0.05 * (reduce ? 0 : 1);
        const cosA = Math.cos(orbit);
        const sinA = Math.sin(orbit);

        for (let i = 0; i < particles.length; i++) {
          const pt = particles[i];

          const gx = pt.gasX + Math.sin(t * 0.12 + pt.seedX * 6.2831) * 0.35;
          const gy = pt.gasY + Math.cos(t * 0.10 + pt.seedY * 6.2831) * 0.35;
          const gz = pt.gasZ + Math.sin(t * 0.11 + pt.seedZ * 6.2831) * 0.35;

          const r = pt.diskR;
          // The arm shape is mostly baked into diskAngle0 (r * spin) at
          // particle-creation time; only a small extra winding is layered on
          // top here, driven by the bounded progress value (not raw elapsed
          // time) so it stays a recognizable spiral every cycle instead of
          // smearing into a blurred ring after a few minutes of play.
          const ang = pt.diskAngle0 + p * (0.5 / (0.6 + r));
          const dx = Math.cos(ang) * r;
          const dy = pt.diskH;
          const dz = Math.sin(ang) * r;

          const et = t * 0.06;
          const ce = Math.cos(et), se = Math.sin(et);
          const ex = ce * pt.ellX + se * pt.ellZ;
          const ey = pt.ellY;
          const ez = -se * pt.ellX + ce * pt.ellZ;

          let wx: number, wy: number, wz: number;
          if (p < 0.6) {
            const s = smoothstep(0.05, 0.58, p);
            wx = lerp(gx, dx, s); wy = lerp(gy, dy, s); wz = lerp(gz, dz, s);
          } else {
            const s = smoothstep(0.62, 1.0, p);
            wx = lerp(dx, ex, s); wy = lerp(dy, ey, s); wz = lerp(dz, ez, s);
          }

          const turb = Math.exp(-Math.pow((p - 0.30) / 0.15, 2));
          const turbScale = turb * (0.8 + r * 0.12);
          wx += Math.sin(pt.seedX * 18 + t * 0.7) * turbScale;
          wy += Math.sin(pt.seedY * 18 + t * 0.6) * turbScale;
          wz += Math.sin(pt.seedZ * 18 + t * 0.8) * turbScale;

          const rx = wx * cosA + wz * sinA;
          const rz = -wx * sinA + wz * cosA;

          // Blend which world axis maps to the screen's vertical axis (and
          // which becomes depth) as the view tips between side-on (showing
          // world Y, e.g. for the gas cloud / elliptical blob) and top-down
          // (showing the disk's other horizontal axis, so the spiral's
          // actual 2D shape is visible instead of being flattened to a
          // near-zero-thickness sliver).
          const screenYWorld = lerp(wy, rz, topDown);
          const depthWorld = lerp(rz, wy, topDown);

          const depthScale = 1.0 / (1.0 + Math.max(-0.85, depthWorld * 0.035));
          const scale = scaleBase * zoom * depthScale;

          let screenX = cx + rx * scale;
          let screenY = cy - screenYWorld * scale * flattenY;

          const holeDx = screenX - mouseX;
          const holeDy = screenY - mouseY;
          const well = strength * Math.exp(-(holeDx * holeDx + holeDy * holeDy) / (2 * 55 * 55));
          screenX -= holeDx * well * 0.7;
          screenY -= holeDy * well * 0.7;

          const twinkle = 0.78 + 0.22 * Math.sin(t * 2.5 + pt.seedX * 40);
          const size = pt.size * (0.55 + pt.seedZ * 0.9) * twinkle * Math.max(0.35, depthScale);

          let col: number[];
          const spiralBase = mix3(cArm, cCore, smoothstep(3.6, 0, r));
          const spiral = mix3(spiralBase, cPink, pt.seedY > 0.85 ? smoothstep(1.0, 4.5, r) * 0.35 : 0);
          if (p < 0.3) col = mix3(cGas, cHot, smoothstep(0.10, 0.30, p));
          else if (p < 0.62) col = mix3(cHot, spiral, smoothstep(0.30, 0.62, p));
          else col = mix3(spiral, cEllip, smoothstep(0.62, 1.0, p));

          const glow = well * 200;
          // Kept low because additive blending stacks overlapping particles
          // — density does the brightening, not per-particle alpha.
          const alpha = clamp01((0.16 + 0.14 * depthScale) * (0.65 + 0.35 * twinkle));

          ctx.beginPath();
          ctx.fillStyle = `rgba(${Math.min(255, col[0] + glow)},${Math.min(255, col[1] + glow * 0.5)},${Math.min(255, col[2])},${alpha})`;
          ctx.arc(screenX, screenY, Math.max(0.4, size), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("mousemove", onMove);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
      {/* Vignette keeps the edges soft */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(125% 125% at 50% 38%, rgba(4,3,12,0) 0%, rgba(4,3,12,0.18) 68%, rgba(4,3,12,0.45) 100%)",
        }}
      />
    </div>
  );
}

export default GalaxyBackdrop;
