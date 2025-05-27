const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const secondLifeCheckbox = document.getElementById("secondLifeCheckbox");
const showHitboxCheckbox = document.getElementById("showHitboxCheckbox");
const menuMusic = document.getElementById("menuMusic");
const gameMusic = document.getElementById("gameMusic");
const hellModeCheckbox = document.getElementById("hellModeCheckbox");
const hellModeLabel = document.querySelector('label[for="hellModeCheckbox"]');

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
let gameState = "menu"; // "menu", "playing", "gameover"

let enemyActive = false;

let keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  // Dodaj ten blok:
  if (gameState === "gameover" && e.key === "Enter") {
    // Wyczyść pociski i tło
    bullets = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Pokaż menu
    document.getElementById("menu").style.display = "block";
    document.body.classList.add("show-scores");
    if (menuMusic) menuMusic.play();
    if (gameMusic) gameMusic.pause();
    if (gameMusic) gameMusic.currentTime = 0;
    gameState = "menu";
    updateCurrentScoreBox(); // Dodaj tutaj
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

function startGame() {
  isRunning = true;
  gameOver = false;
  gameState = "playing";
  secondLifeUsed = false;

  document.getElementById("menu").style.display = "none";
  hellMode = hellModeCheckbox.checked;
  secondLifeEnabled = secondLifeCheckbox.checked;
  secondLifeCheckbox.checked = false; // reset na kolejną grę
  if (menuMusic) menuMusic.pause();
  if (gameMusic) {
  gameMusic.currentTime = 0;
  gameMusic.play();
  }

  // Przywróć Second Life jeśli nie hellMode
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
  updateCurrentScoreBox(); // Dodaj tutaj

  enemyActive = hellMode; // true jeśli Hell Mode, false jeśli normalnie

  document.body.classList.remove("show-scores");

  requestAnimationFrame(gameLoop);
}



function restartGame() {
  gameState = "playing";
  secondLifeUsed = false;
  secondLifeEnabled = false;
  hellMode = false;


  document.getElementById("hellModeBtn").textContent = "HELL MODE";
  document.getElementById("hellModeBtn").classList.remove("explode");

  startGame(); // lepiej użyć tej samej logiki
}

let lastSpawn = 0;

let enemy = new Enemy();

let patternCooldown = 0;
function gameLoop(timestamp) {
  if (gameState === "menu") return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update();
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
  // updateSidebarScore(); // USUNIĘTE, nie istnieje

  // --- SPRAWDZENIE ŚMIERCI ---
  if (player.hp <= 0) {
    if (secondLifeEnabled && !secondLifeUsed) {
      secondLifeUsed = true;
      player.hp = 50;
      secondLifeEnabled = false;
    } else {
      saveHighscore();
      updateCurrentScoreBox(); // Dodaj to tutaj
      gameState = "gameover";
      setTimeout(() => {
        document.getElementById("menu").style.display = "block";
        document.body.classList.add("show-scores");
        if (menuMusic) menuMusic.play();
        if (gameMusic) gameMusic.pause();
        if (gameMusic) gameMusic.currentTime = 0;
        updateCurrentScoreBox(); // Dodaj też tutaj
      }, 500);
      drawGameOver();
      return;
    }
  }

  // Spawn bulletów co X ms, niezależnie od Hz
  let spawnInterval = hellMode ? 1000 : 1500; // Hell Mode: 500ms, normal: 1500ms
  if (!lastSpawn) lastSpawn = timestamp;
  if (timestamp - lastSpawn > spawnInterval) {
    spawnPattern();
    lastSpawn = timestamp;
  }

  // --- AKTYWACJA ENEMY ---
  if (!hellMode && !enemyActive && score > 25 * 60) { // 25 sekund (przy 60 FPS)
    enemyActive = true;
  }

  // Rysowanie i aktualizacja przeciwnika tylko jeśli aktywny
  if (enemyActive) {
    enemy.update();
    enemy.draw(ctx);
  }

  frame++;

  if (gameState !== "gameover") {
    score++;
    requestAnimationFrame(gameLoop);
  } else {
    drawGameOver();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderHighscores();
  document.body.classList.add("show-scores");
});

function updateCurrentScoreBox() {
  const el = document.getElementById("currentScoreValue");
  if (el) el.textContent = `${dodgedBullets} | ${Math.floor(score / 60)}s`;
}

