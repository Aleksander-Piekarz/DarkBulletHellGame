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
    this.speed = 0.42;      // było np. 0.3, teraz wolniej
    this.friction = 0.80;   // było np. 0.88, teraz szybciej wyhamowuje
    this.hitbox = 8;
    this.invincibleUntil = 0;
    this.hp = 100;
  }

  draw() {
    const now = performance.now();
    const msLeft = invincibleUntilMs - now;
    const isInvincible = msLeft > 0 || frame < this.invincibleUntil;

    // Miganie w ostatnich 0.5 sekundy
    let shouldDrawAura = true;
    if (msLeft > 0 && msLeft < 500) {
      // Miga bardzo szybko (10 razy na sekundę)
      shouldDrawAura = Math.floor(now / 50) % 2 === 0;
    }

    if (isInvincible && frame % 10 < 5) return; // miganie całej postaci

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

    if (isInvincible && shouldDrawAura) {
      ctx.save();
      ctx.globalAlpha = msLeft > 0 && msLeft < 500 ? 0.9 : 0.6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.hitbox + 18, 0, 2 * Math.PI);
      ctx.strokeStyle = msLeft > 0 && msLeft < 500 ? "#ff0" : "#0ff";
      ctx.lineWidth = 4;
      ctx.shadowColor = msLeft > 0 && msLeft < 500 ? "#ff0" : "#0ff";
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.restore();
    }
  }

  update(deltaTime = 1/60) {
    let ax = 0, ay = 0;
    if (keys["ArrowLeft"] || keys["a"]) this.vx -= this.speed * deltaTime * 60;
    if (keys["ArrowRight"] || keys["d"]) this.vx += this.speed * deltaTime * 60;
    if (keys["ArrowUp"] || keys["w"]) this.vy -= this.speed * deltaTime * 60;
    if (keys["ArrowDown"] || keys["s"]) this.vy += this.speed * deltaTime * 60;

    this.vx *= Math.pow(this.friction, deltaTime * 60);
    this.vy *= Math.pow(this.friction, deltaTime * 60);

    this.x += this.vx * deltaTime * 60;
    this.y += this.vy * deltaTime * 60;

    this.x = Math.max(this.hitbox, Math.min(canvas.width - this.hitbox, this.x));
    this.y = Math.max(this.hitbox, Math.min(canvas.height - this.hitbox, this.y));
  }
}


