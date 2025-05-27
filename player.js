class Player {
  constructor() {
    this.reset();
    this.hp = 100
    this.image = new Image();
    this.image.src = "img/player.png";
  }

  reset() {
    this.x = canvas.width / 2;
    this.y = canvas.height - 80;
    this.vx = 0;
    this.vy = 0;
    this.speed = 0.22;      // było np. 0.3, teraz wolniej
    this.friction = 0.80;   // było np. 0.88, teraz szybciej wyhamowuje
    this.hitbox = 8;
    this.invincibleUntil = 0;
    this.hp = 100;
  }

  draw() {
    const isInvincible = frame < this.invincibleUntil;
    if (isInvincible && frame % 10 < 5) return; // miganie

    if (this.image.complete && this.image.naturalWidth > 0) {
      const size = canvas.width * 0.06;
      ctx.drawImage(this.image, this.x - size / 2, this.y - size / 2, size, size);
    } else {
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - 15);
      ctx.lineTo(this.x - 10, this.y + 10);
      ctx.lineTo(this.x + 10, this.y + 10);
      ctx.closePath();
      ctx.fill();
    }

    // Rysuj hitbox jeśli aktywne
    if (typeof showHitboxes !== "undefined" && showHitboxes) {
      ctx.save();
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.hitbox, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }
  }

  update() {
    let ax = 0, ay = 0;
    if (keys["ArrowLeft"] || keys["a"]) this.vx -= this.speed;
    if (keys["ArrowRight"] || keys["d"]) this.vx += this.speed;
    if (keys["ArrowUp"] || keys["w"]) this.vy -= this.speed;
    if (keys["ArrowDown"] || keys["s"]) this.vy += this.speed;

    // Zastosuj opór
    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx;
    this.y += this.vy;

    this.x = Math.max(this.hitbox, Math.min(canvas.width - this.hitbox, this.x));
    this.y = Math.max(this.hitbox, Math.min(canvas.height - this.hitbox, this.y));
  }
}
