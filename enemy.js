class Enemy {
  constructor() {
    this.x = canvas.width / 2;
    this.y = 80;
    this.radius = 32;
    this.speed = 0.8; // wolniej
    this.direction = 1;
    this.image = new Image();
    this.image.src = "img/enemy.png";
    this.patternCooldown = 0;
  }

  update() {
    this.x += this.speed * this.direction;
    if (this.x < this.radius || this.x > canvas.width - this.radius) {
      this.direction *= -1;
    }
    // Pattern co pewien czas
    if (this.patternCooldown <= 0) {
      // TESTUJEMY TYLKO JEDEN PATTERN!
      spawnEnemyGapCirclePattern(this.x, this.y);
      this.patternCooldown = 120;
    } else {
      this.patternCooldown--;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(this.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
    ctx.restore();
  }
}