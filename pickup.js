
class Pickup {
  constructor() {
    this.x = Math.random() * (canvas.width - 60) + 30;
    this.y = -30;
    this.radius = 45;
    this.speed = 0.7;
    this.image = new Image();
    this.image.src = "img/shield.png";
    this.collected = false;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx) {
    if (this.image.complete && this.image.naturalWidth > 0) {
      ctx.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#0ff";
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.restore();
    }
  }

  isOffScreen() {
    return this.y - this.radius > canvas.height;
  }

  checkCollision(player) {
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius + player.hitbox;
  }
}