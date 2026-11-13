// Procedural canvas textures — no external art files, everything ships in JS.

import * as THREE from '../three.js';

function makeCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

function texFromCanvas(canvas, repeatX = 1, repeatY = 1) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 4;
  return tex;
}

function noise(ctx, w, h, amount = 0.08, alpha = 0.05) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 255 * amount;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
  if (alpha > 0) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#000';
    for (let i = 0; i < 90; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

export function makeFloorTexture() {
  const s = 512;
  const canvas = makeCanvas(s, s);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#6d3b2b';
  ctx.fillRect(0, 0, s, s);
  const tile = s / 4;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const shade = 0.86 + Math.random() * 0.22;
      const r = Math.round(150 * shade);
      const g = Math.round(84 * shade);
      const b = Math.round(62 * shade);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x * tile + 3, y * tile + 3, tile - 6, tile - 6);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(x * tile + 3, y * tile + 3, tile - 6, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(x * tile + 3, y * tile + tile - 7, tile - 6, 4);
    }
  }
  ctx.strokeStyle = 'rgba(30,16,10,0.55)';
  ctx.lineWidth = 5;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tile, 0);
    ctx.lineTo(i * tile, s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * tile);
    ctx.lineTo(s, i * tile);
    ctx.stroke();
  }
  noise(ctx, s, s, 0.06, 0.05);
  return texFromCanvas(canvas, 2.5, 1.8);
}

export function makeWallTexture() {
  const s = 512;
  const canvas = makeCanvas(s, s);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#c6ad8c';
  ctx.fillRect(0, 0, s, s);
  const tw = s / 4;
  const th = s / 6;
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 4; x++) {
      const shade = 0.92 + Math.random() * 0.1;
      ctx.fillStyle = `rgba(255,241,216,${0.18 * shade})`;
      ctx.fillRect(x * tw + 2, y * th + 2, tw - 4, th - 4);
      ctx.strokeStyle = 'rgba(110,86,62,0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x * tw + 2, y * th + 2, tw - 4, th - 4);
    }
  }
  noise(ctx, s, s, 0.06, 0.04);
  return texFromCanvas(canvas, 3, 2);
}

export function makeWoodTexture() {
  const w = 512;
  const h = 512;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 46; i++) {
    const y = Math.random() * h;
    ctx.strokeStyle = `rgba(${60 + Math.random() * 40},${34 + Math.random() * 20},${16 + Math.random() * 14},${0.15 + Math.random() * 0.25})`;
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 32) {
      ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 5 + Math.random() * 3);
    }
    ctx.stroke();
  }
  noise(ctx, w, h, 0.07, 0.03);
  return texFromCanvas(canvas, 1, 1);
}

export function makeTileTexture() {
  const s = 256;
  const canvas = makeCanvas(s, s);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#19332d';
  ctx.fillRect(0, 0, s, s);
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 4; x++) {
      const shade = 0.85 + Math.random() * 0.3;
      const g = Math.round(58 * shade);
      ctx.fillStyle = `rgb(${Math.round(30 * shade)},${g},${Math.round(54 * shade)})`;
      ctx.fillRect(x * 64 + 3, y * 42 + 3, 58, 36);
      ctx.fillStyle = 'rgba(230,255,240,0.04)';
      ctx.fillRect(x * 64 + 3, y * 42 + 3, 58, 2);
    }
  }
  ctx.strokeStyle = 'rgba(8,20,16,0.85)';
  ctx.lineWidth = 4;
  for (let y = 0; y <= 6; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * 42);
    ctx.lineTo(s, y * 42);
    ctx.stroke();
  }
  for (let x = 0; x <= 4; x++) {
    ctx.beginPath();
    ctx.moveTo(x * 64, 0);
    ctx.lineTo(x * 64, s);
    ctx.stroke();
  }
  noise(ctx, s, s, 0.04, 0.01);
  return texFromCanvas(canvas, 2.6, 1.4);
}

export function makeSteelTexture() {
  const s = 256;
  const canvas = makeCanvas(s, s);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#9aa6ad';
  ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`;
    ctx.fillRect(Math.random() * s, Math.random() * s, 1, 1 + Math.random() * 2);
  }
  noise(ctx, s, s, 0.04, 0);
  return texFromCanvas(canvas, 1, 1);
}

export function makeRadialTexture(inner = 1, outer = 0) {
  const s = 128;
  const canvas = makeCanvas(s, s);
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, `rgba(255,255,255,${inner})`);
  g.addColorStop(0.5, `rgba(255,255,255,${outer + (inner - outer) * 0.35})`);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeLabelTexture(title, subtitle, accent = '#f6a623') {
  const w = 512;
  const h = 160;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(18,11,8,0.82)';
  roundRect(ctx, 8, 12, w - 16, h - 24, 28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(247,232,208,0.18)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = accent;
  roundRect(ctx, 24, 28, 10, h - 56, 5);
  ctx.fill();

  ctx.fillStyle = '#f7e8d0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 56px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.fillText(title, w / 2 + 8, h / 2 - (subtitle ? 12 : 0));

  if (subtitle) {
    ctx.fillStyle = 'rgba(247,232,208,0.66)';
    ctx.font = '600 26px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText(subtitle, w / 2 + 8, h / 2 + 38);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function makeNeonTexture(text = 'SIZZLE!') {
  const w = 1024;
  const h = 300;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Outer glow layers
  for (const [blur, alpha] of [
    [70, 0.45],
    [34, 0.7],
    [12, 0.9],
  ]) {
    ctx.shadowColor = 'rgba(255,96,58,0.95)';
    ctx.shadowBlur = blur;
    ctx.fillStyle = `rgba(255,120,70,${alpha})`;
    ctx.font = 'italic 900 168px "Arial Black", sans-serif';
    ctx.fillText(text, w / 2, h / 2);
  }
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#ffd7a0';
  ctx.fillStyle = '#fff4de';
  ctx.font = 'italic 900 168px "Arial Black", sans-serif';
  ctx.fillText(text, w / 2, h / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function makePosterTexture(title, subtitle, hue = 12) {
  const w = 384;
  const h = 512;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = `hsl(${hue} 48% 28%)`;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = `hsl(${hue + 18} 70% 58%)`;
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.4, w * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(20,12,8,0.85)';
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.4, w * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe9c9';
  ctx.textAlign = 'center';
  ctx.font = 'italic 900 84px "Arial Black", sans-serif';
  ctx.fillText(title, w / 2, h * 0.4 + 28);
  ctx.font = '700 32px "Microsoft YaHei", sans-serif';
  ctx.fillText(subtitle, w / 2, h * 0.72);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(24, h - 48, w - 48, 8);
  noise(ctx, w, h, 0.04, 0.02);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeCrateTagTexture(emoji, label) {
  const w = 320;
  const h = 112;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f4e4c6';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#e9d3ad';
  ctx.fillRect(0, 0, w, 8);
  ctx.fillRect(0, h - 8, w, 8);
  ctx.strokeStyle = '#7a4c2b';
  ctx.lineWidth = 5;
  ctx.strokeRect(4, 4, w - 8, h - 8);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '34px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.fillText(emoji, 48, h / 2 + 2);
  ctx.fillStyle = '#3a2416';
  ctx.font = '800 34px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.fillText(label, 198, h / 2 + 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function makeMenuBoardTexture() {
  const w = 512;
  const h = 256;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1b2a24';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(220,235,220,0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, w - 12, h - 12);
  ctx.fillStyle = '#f1e6cf';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 26px "Microsoft YaHei", sans-serif';
  ctx.fillText('今 日 菜 单', w / 2, 46);
  ctx.strokeStyle = 'rgba(241,230,207,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(90, 70);
  ctx.lineTo(w - 90, 70);
  ctx.stroke();
  ctx.font = '600 22px "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('芝士汉堡', 70, 112);
  ctx.fillText('田园沙拉', 70, 158);
  ctx.fillText('双层芝士堡', 70, 204);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(246,166,35,0.9)';
  ctx.fillText('¥ 18', w - 70, 112);
  ctx.fillText('¥ 12', w - 70, 158);
  ctx.fillText('¥ 28', w - 70, 204);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
