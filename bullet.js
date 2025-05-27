class Bullet {
  constructor(x, y, angle, speed, image) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.hitbox = 4;
    this.image = image;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    if (!this.image.complete || this.image.naturalWidth === 0) return;
    const angle = Math.atan2(this.vy, this.vx);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle - Math.PI / 2 + Math.PI / 2); // OBRÓT O 90° W PRAWO
    const size = canvas.width * 0.08; // POWIĘKSZENIE (np. 0.06 zamiast 0.025)
    ctx.drawImage(this.image, -size / 2, -size / 2, size, size);
    ctx.restore();

    // Rysuj hitbox jeśli aktywne
    if (typeof showHitboxes !== "undefined" && showHitboxes) {
      ctx.save();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.hitbox, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }
  }

  isOffScreen(canvas) {
    return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
  }
}

class SpiralWaveBullet extends Bullet {
  constructor(x, y, angle, speed, image) {
    super(x, y, angle, speed, image);
    this.radius = 0;
  }

  update() {
    this.radius += this.speed;
    this.x = canvas.width / 2 + Math.cos(this.angle) * 40; // LOWERED from 80/90
    this.y = 100 + Math.sin(this.angle) * 20 + this.radius; // add radius to y for downward movement
    this.angle += 0.025; // LOWERED from 0.05
  }
}

class WaveBullet extends Bullet {
  constructor(x, y, angle, speed, image) {
    super(x, y, angle, speed, image);
    this.startX = x;
    this.frequency = 0.025; // LOWERED from 0.05
    this.amplitude = 10;    // LOWERED from 50
    this.time = 0;
  }

  update() {
    this.time++;
    this.y += this.speed;
    this.x = this.startX + Math.sin(this.time * this.frequency) * this.amplitude;
  }
}

class SpiralUpBullet extends Bullet {
  constructor(x, y, speed, image, spiralSpeed, spiralRadius, phase) {
    super(x, y, Math.PI / 2, speed, image); // always downwards
    this.baseX = x;
    this.t = 0;
    this.spiralSpeed = spiralSpeed || 0.04; // LOWERED from 0.12
    this.spiralRadius = spiralRadius || 30; // LOWERED from 70
    this.phase = phase || 0;
  }

  update() {
    this.t += 1;
    this.y += this.speed;
    this.x = this.baseX + Math.cos(this.t * this.spiralSpeed + this.phase) * this.spiralRadius;
  }
}
