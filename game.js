const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const secondLifeCheckbox = document.getElementById("secondLifeCheckbox");
const showHitboxCheckbox = document.getElementById("showHitboxCheckbox");
const menuMusic = document.getElementById("menuMusic");
const gameMusic = document.getElementById("gameMusic");
const hellModeCheckbox = document.getElementById("hellModeCheckbox");
const hellModeLabel = document.querySelector('label[for="hellModeCheckbox"]');
let pickups = [];
let invincibleUntilMs = 0;
const INVINCIBLE_DURATION_MS = 2500;
menuMusic.volume = 0.1;  
gameMusic.volume = 0.03;

hellModeCheckbox.addEventListener("change", () => {
  hellMode = hellModeCheckbox.checked;
  const secondLifeOption = document.getElementById("secondLifeOption");
  if (hellMode) {
    secondLifeOption.classList.add("hell-blood");
    hellModeLabel.textContent = "HELL MODE: ACTIVE";
    const sound = document.getElementById("hellmodeSound");
    if (sound) sound.play();
  } else {
    secondLifeOption.classList.remove("hell-blood");
    hellModeLabel.textContent = "HELL MODE";
  }
});

let secondLifeEnabled = false;
let secondLifeUsed = false;
let hellMode = false;
let showHitboxes = false;

let player = new Player();
let bullets = [];
let frame = 0;
let score = 0;
let dodgedBullets = 0;
let gameState = "menu";

let enemyActive = false;

let keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (gameState === "gameover" && e.key === "Enter") {
    bullets = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("menu").style.display = "block";
    document.body.classList.add("show-scores");
    if (menuMusic) menuMusic.play();
    if (gameMusic) gameMusic.pause();
    if (gameMusic) gameMusic.currentTime = 0;
    gameState = "menu";
    updateCurrentScoreBox();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});
document.getElementById("startBtn").addEventListener("click", () => {
  startGame();
});

showHitboxCheckbox.addEventListener("change", () => {
  showHitboxes = showHitboxCheckbox.checked;
});

let startTime = 0;
let endTime = 0;

function startGame() {
  isRunning = true;
  gameOver = false;
  gameState = "playing";
  secondLifeUsed = false;

  document.getElementById("menu").style.display = "none";
  hellMode = hellModeCheckbox.checked;
  secondLifeEnabled = secondLifeCheckbox.checked;
  secondLifeCheckbox.checked = false;
  if (menuMusic) menuMusic.pause();
  if (gameMusic) {
    gameMusic.currentTime = 0;
    gameMusic.play();
  }

  const secondLifeOption = document.getElementById("secondLifeOption");
  if (!hellMode) {
    secondLifeOption.classList.remove("hell-blood");
    secondLifeOption.style.display = "flex";
  } else {
    secondLifeOption.classList.add("hell-blood");
    secondLifeOption.style.display = "flex";
  }

  player = new Player();
  player.hp = 100;

  bullets = [];

  lastTime = 0;
  frame = 0;
  score = 0;
  dodgedBullets = 0;
  updateCurrentScoreBox();

  enemyActive = hellMode;

  startTime = performance.now();
  endTime = 0;
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  gameState = "playing";
  secondLifeUsed = false;
  secondLifeEnabled = false;
  hellMode = false;

  document.getElementById("hellModeBtn").textContent = "HELL MODE";
  document.getElementById("hellModeBtn").classList.remove("explode");

  startGame();
}

let lastSpawn = 0;

let enemy = new Enemy();

let patternCooldown = 0;
let lastPickupSpawn = 0;
const PICKUP_SPAWN_INTERVAL_MS = hellMode ? 20000 : 10000; 
let lastFrameTime = performance.now();

function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastFrameTime) / 1000; 
  lastFrameTime = timestamp;

  if (gameState === "menu") return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update(deltaTime);
  player.draw();

  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].draw(ctx);
    if (bullets[i].isOffScreen(canvas)) {
      bullets.splice(i, 1);
      dodgedBullets++;
    }
  }

  detectCollisions();

  if (player.hp <= 0) {
    if (secondLifeEnabled && !secondLifeUsed) {
      secondLifeUsed = true;
      player.hp = 50;
      secondLifeEnabled = false;
    } else {
      endTime = performance.now();
      showNameInputBox();
      updateCurrentScoreBox();
      gameState = "gameover";
      drawGameOver();
      return;
    }
  }

  let spawnInterval = hellMode ? 1250 : 1500;
  if (!lastSpawn) lastSpawn = timestamp;
  if (timestamp - lastSpawn > spawnInterval) {
    spawnPattern();
    lastSpawn = timestamp;
  }

  let elapsedTime = Math.floor((timestamp - startTime) / 1000);
  if (!hellMode && !enemyActive && elapsedTime > 25) {
    enemyActive = true;
  }

  if (enemyActive) {
    enemy.update();
    enemy.draw(ctx);
  }


  if (!lastPickupSpawn) lastPickupSpawn = timestamp;
  if (timestamp - lastPickupSpawn > PICKUP_SPAWN_INTERVAL_MS && gameState === "playing") {
    pickups.push(new Pickup());
    lastPickupSpawn = timestamp;
  }

  for (let i = pickups.length - 1; i >= 0; i--) {
    pickups[i].update();
    pickups[i].draw(ctx);

    if (pickups[i].checkCollision(player)) {
      pickups.splice(i, 1);
      invincibleUntilMs = performance.now() + INVINCIBLE_DURATION_MS;
    } else if (pickups[i].isOffScreen()) {
      pickups.splice(i, 1);
    }
  }

  frame++;

  updateCurrentScoreBox(elapsedTime);

  if (gameState !== "gameover") {
    requestAnimationFrame(gameLoop);
  } else {
    drawGameOver();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderHighscores();
  document.body.classList.add("show-scores");
});

function updateCurrentScoreBox(elapsedTime) {
  const el = document.getElementById("currentScoreValue");
  if (el) el.textContent = `${dodgedBullets} | ${(typeof elapsedTime !== "undefined" ? elapsedTime : Math.floor(score / 60))}s`;
}

function showNameInputBox() {
  document.getElementById("menu").style.display = "none";

  const box = document.getElementById("nameInputBox");
  box.style.display = "block";
  const input = document.getElementById("playerName");
  input.value = "";
  setTimeout(() => input.focus(), 50);

  function saveAndHide() {
    const name = input.value.trim().substring(0, 12) || "Anonim";
    saveHighscore(name);
    box.style.display = "none";
    renderHighscores();
    document.getElementById("menu").style.display = "block";
    document.body.classList.add("show-scores");
    if (menuMusic) menuMusic.play();
    if (gameMusic) gameMusic.pause();
    if (gameMusic) gameMusic.currentTime = 0;
    updateCurrentScoreBox();
  }

  document.getElementById("saveNameBtn").onclick = saveAndHide;
  input.onkeydown = (e) => {
    if (e.key === "Enter") saveAndHide();
  };
}

document.body.addEventListener("mousedown", function playMenuMusicOnce() {
  if (menuMusic.paused) {
    menuMusic.currentTime = 0;
    menuMusic.play();
  }
  document.body.removeEventListener("mousedown", playMenuMusicOnce);
});

