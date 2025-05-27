// --- Pociski: różne grafiki ---
const bulletImgs = [];
for (let i = 1; i <= 10; i++) {
  const img = new Image();
  img.src = `img/${i.toString().padStart(2, "0")}.png`;
  bulletImgs.push(img);
}

// Helper: returns a random float in [a, b]
function rand(a, b) {
  return a + Math.random() * (b - a);
}

// --- ŚCIANA Z LUKĄ --- (wygląd: projectile2.png, hitbox: 7)
function spawnWallWithGapPattern() {
  const numBullets = 40;
  const wallWidth = canvas.width * 1;
  const wallStart = (canvas.width - wallWidth) / 2;
  const speed = 0.45;
  const gapIndex = Math.floor(Math.random() * (numBullets - 10)) + 3;
  for (let i = 0; i < numBullets; i++) {
    if (i >= gapIndex && i < gapIndex + 5) continue;
    const x = wallStart + (wallWidth / numBullets) * (i + 0.5);
    let b = new Bullet(x, 0, Math.PI / 2, speed, bulletImgs[1]);
    b.hitbox = 5;
    bullets.push(b);
  }
}

// --- DESZCZ (RAIN) --- (wygląd: projectile2.png, hitbox: 7)
function spawnRainPattern() {
  const numBullets = hellMode ? 90 : 60;
  const speed = 0.45;
  const gapIndex = Math.floor(Math.random() * (numBullets - 10)) + 5;
  for (let i = 0; i < numBullets; i++) {
    if (i >= gapIndex - 3 && i <= gapIndex + 3) continue;
    const x = (canvas.width / numBullets) * (i + 0.5);
    let b = new Bullet(x, 0, Math.PI / 2, speed, bulletImgs[2]);
    b.hitbox = 4;
    bullets.push(b);
  }
}

// --- GĘSTY ŚRODEK (CENTER RAIN) --- (wygląd: projectile3.png, hitbox: 7)
function spawnCenterRainPattern() {
  const numBullets = hellMode ? 32 : 16;
  const spread = 320;
  const speed = 0.45;
  const center = rand(canvas.width * 0.25, canvas.width * 0.75);
  const gapIndex = Math.floor(Math.random() * (numBullets - 4)) + 2;
  for (let i = 0; i < numBullets; i++) {
    if (i >= gapIndex - 1 && i <= gapIndex + 1) continue;
    const x = center - spread / 2 + (spread / (numBullets - 1)) * i;
    let b = new Bullet(x, 0, Math.PI / 2, speed, bulletImgs[5]);
    b.hitbox = 4;
    bullets.push(b);
  }
}

// --- FALA (WAVE) --- (wygląd: projectile3.png, hitbox: 10)
function spawnWavePattern() {
  const numBullets = hellMode ? 28 : 18;
  const speed = 0.45;
  const waveWidth = canvas.width * 0.5;
  const waveStart = (canvas.width - waveWidth) / 2;
  const amplitude = 40;
  const gapIndex = Math.floor(Math.random() * (numBullets - 4)) + 2;

  for (let i = 0; i < numBullets; i++) {
    if (i >= gapIndex - 1 && i <= gapIndex + 1) continue;
    const x = waveStart + (waveWidth / (numBullets - 1)) * i;
    // WaveBullet: przesuwa się sinusoidalnie podczas lotu
    let b = new WaveBullet(
      x,
      0,
      Math.PI / 2,
      speed,
      bulletImgs[4],
      0.015, // częstotliwość fali
      amplitude
    );
    b.hitbox = 5;
    bullets.push(b);
  }
}

// --- WACHLARZ (FAN) --- (wygląd: BigProjectile.png, hitbox: 14)
function spawnFanPattern() {
  const numBullets = hellMode ? 20 : 12;
  const speed = hellMode ? 0.38 : 0.45;
  const spread = Math.PI / 2;
  const startAngle = Math.PI / 2 - spread / 2;
  for (let i = 0; i < numBullets; i++) {
    const angle = startAngle + (spread / (numBullets - 1)) * i;
    let b = new Bullet(canvas.width / 2, 0, angle, speed, bulletImgs[5]);
    b.hitbox = 12;
    bullets.push(b);
  }
}

// --- V-SHAPE --- (wygląd: projectile2.png, hitbox: 7)
function spawnVPattern() {
  const numBullets = hellMode ? 27 : 17;
  const speed = hellMode ? 0.38 : 0.45;
  const centerX = canvas.width / 2;
  const startY = 0;
  const armLength = 220; // długość ramion V
  const angleSpread = Math.PI / 1; // szerokość V

  for (let i = 0; i < numBullets; i++) {
    
    const rel = (i - (numBullets - 1) / 2) / ((numBullets - 1) / 2);
    const angle = Math.PI / 2 + rel * (angleSpread / 2);
    const x = centerX + Math.tan(rel * (angleSpread / 2)) * armLength;
    let b = new Bullet(x, startY, angle, speed, bulletImgs[6]);
    b.hitbox = 5;
    bullets.push(b);
  }
}

// --- U-SHAPE --- (wygląd: projectile3.png, hitbox: 7)
function spawnUPattern() {
  const numBullets = hellMode ? 44 : 28;
  const speed = hellMode ? 0.38 : 0.45;
  const leftX = canvas.width / 6;
  const rightX = (canvas.width * 5) / 6;
  const bottomY = 0;
  const height = 36;
  for (let i = 0; i < numBullets / 2; i++) {
    const y = bottomY + i * height;
    let b = new Bullet(leftX, y, Math.PI / 2, speed, bulletImgs[7]);
    b.hitbox = 7;
    bullets.push(b);
  }
  for (let i = 0; i < numBullets / 2; i++) {
    const y = bottomY + i * height;
    let b = new Bullet(rightX, y, Math.PI / 2, speed, bulletImgs[7]);
    b.hitbox = 7;
    bullets.push(b);
  }
  for (let i = 0; i < numBullets; i++) {
    const angle = Math.PI + (Math.PI * i) / (numBullets - 1);
    const x = canvas.width / 2 + Math.cos(angle) * ((rightX - leftX) / 2);
    const y = bottomY + (numBullets / 2) * height;
    let b = new Bullet(x, y, Math.PI / 2, speed, bulletImgs[7]);
    b.hitbox = 7;
    bullets.push(b);
  }
}

// Circle burst (classic bullet hell) (wygląd: projectile2.png, hitbox: 7)
function spawnCircleBurstPattern(centerX = canvas.width / 2, centerY = 0) {
  const numBullets = 32;
  for (let i = 0; i < numBullets; i++) {
    const angle = Math.PI / 1 + (Math.PI * 2 * i) / numBullets;
    let b = new Bullet(centerX, centerY, angle, 0.38, bulletImgs[1]);
    b.hitbox = 7;
    bullets.push(b);
  }
}

// Double wall with two gaps (wygląd: projectile3.png, hitbox: 7)
function spawnDoubleWallWithGapsPattern() {
  const numBullets = 28;
  const wallWidth = canvas.width * 0.8;
  const wallStart = (canvas.width - wallWidth) / 2;
  const speed = hellMode ? 0.38 : 0.45; // szybciej w Hell Mode
  const gap1 = Math.floor(Math.random() * (numBullets / 2 - 6)) + 3;
  const gap2 = Math.floor(Math.random() * (numBullets / 2 - 6)) + numBullets / 2 + 3;
  for (let i = 0; i < numBullets; i++) {
    if ((i >= gap1 - 4 && i <= gap1 + 4) || (i >= gap2 - 4 && i <= gap2 + 4)) continue;
    const x = wallStart + (wallWidth / numBullets) * (i + 0.5);
    let b = new Bullet(x, 0, Math.PI / 2, speed, bulletImgs[8]);
    b.hitbox = 7;
    bullets.push(b);
  }
}

// Zigzag pattern (wygląd: projectile3.png, hitbox: 10)
function spawnZigzagPattern() {
  const numBullets = hellMode ? 28 : 18;
  const speed = hellMode ? 0.45 : 0.45;
  for (let i = 0; i < numBullets; i++) {
    const x = (canvas.width / numBullets) * (i + 0.5);
    const angle = Math.PI / 2 + Math.sin(i) * 0.15;
    let b = new Bullet(x, 0, angle, speed, bulletImgs[9]);
    b.hitbox = 10;
    bullets.push(b);
  }
}

// Dense random rain (wygląd: projectile3.png, hitbox: 7)
function spawnDenseRandomPattern() {
  const numBullets = hellMode ? 60 : 40;
  const speed = hellMode ? 0.45 : 0.45;
  for (let i = 0; i < numBullets; i++) {
    const x = rand(30, canvas.width - 30);
    let b = new Bullet(x, 0, Math.PI / 2, speed, bulletImgs[8]);
    b.hitbox = 7;
    bullets.push(b);
  }
}

// Aimed pattern (player-focused, can move faster) (wygląd: projectile2.png, hitbox: 7)
function spawnAimedPattern() {
  const numBullets = 10;
  for (let i = 0; i < numBullets; i++) {
    const dx = player.x - canvas.width / 2;
    const dy = player.y - 100;
    let angle = Math.atan2(dy, dx);
    angle = Math.max(
      Math.PI / 2 - Math.PI / 4,
      Math.min(Math.PI / 2 + Math.PI / 4, angle)
    );
    let b = new Bullet(
      canvas.width / 2 + rand(-180, 180),
      0,
      angle,
      1.2,
      bulletImgs[1]
    );
    b.hitbox = 7;
    bullets.push(b);
  }
}

// Enemy gap circle pattern
function spawnEnemyGapCirclePattern(centerX, centerY) {
  const numBullets = 32;
  const gapStart = Math.random() * (Math.PI * 2);
  const gapSize = Math.PI / 3;
  for (let i = 0; i < numBullets; i++) {
    const angle = (2 * Math.PI / numBullets) * i;
    if (angle > gapStart && angle < gapStart + gapSize) continue;
    bullets.push(new Bullet(centerX, centerY, angle, 1.2, bulletImgs[3]));
  }
}

// Patterns array
const patterns = [
  spawnRainPattern,
  spawnCenterRainPattern,
  spawnWavePattern,
  spawnFanPattern,
  spawnVPattern,
   spawnWallWithGapPattern,
   spawnDoubleWallWithGapsPattern,
  spawnCircleBurstPattern,
  spawnZigzagPattern,
   spawnDenseRandomPattern,
];

// Only one non-aimed pattern at a time, but can always add aimed pattern
function spawnPattern() {
  if (patterns.length === 0) return;
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  console.log("Wywołuję pattern:", pattern.name);
  pattern();
  if (Math.random() < 0.3) {
    spawnAimedPattern();
  }
}
