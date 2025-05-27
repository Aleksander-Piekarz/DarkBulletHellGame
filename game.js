const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const secondLifeCheckbox = document.getElementById("secondLifeCheckbox");
const showHitboxCheckbox = document.getElementById("showHitboxCheckbox");
const menuMusic = document.getElementById("menuMusic");
const gameMusic = document.getElementById("gameMusic");
const hellModeCheckbox = document.getElementById("hellModeCheckbox");
const hellModeLabel = document.querySelector('label[for="hellModeCheckbox"]');
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

let startTime = 0;
let endTime = 0; // Dodaj na górze pliku

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


  startTime = performance.now(); // ZAPAMIĘTAJ CZAS STARTU
  endTime = 0; // RESETUJ
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

  // --- SPRAWDZENIE ŚMIERCI ---
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
      // setTimeout(() => {
      //   document.getElementById("menu").style.display = "block";
      //   document.body.classList.add("show-scores");
      //   if (menuMusic) menuMusic.play();
      //   if (gameMusic) gameMusic.pause();
      //   if (gameMusic) gameMusic.currentTime = 0;
      //   updateCurrentScoreBox();
      // }, 500);
      
      drawGameOver();
      return;
    }
  }

  // Spawn bulletów co X ms, niezależnie od Hz
  let spawnInterval = hellMode ? 1000 : 1500;
  if (!lastSpawn) lastSpawn = timestamp;
  if (timestamp - lastSpawn > spawnInterval) {
    spawnPattern();
    lastSpawn = timestamp;
  }

  // --- AKTYWACJA ENEMY ---
  // UWAGA: score już nie jest czasem, więc zamień na elapsedTime
  let elapsedTime = Math.floor((timestamp - startTime) / 1000);
  if (!hellMode && !enemyActive && elapsedTime > 25) {
    enemyActive = true;
  }

  // Rysowanie i aktualizacja przeciwnika tylko jeśli aktywny
  if (enemyActive) {
    enemy.update();
    enemy.draw(ctx);
  }

  frame++;

  // AKTUALIZUJ WYNIK W CZASIE RZECZYWISTYM
  updateCurrentScoreBox(elapsedTime);

  if (gameState !== "gameover") {
    // score++ NIE POTRZEBNE, czas liczymy z timestamp
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
  // elapsedTime przekazany z gameLoop, jeśli nie ma to licz z score (dla kompatybilności)
  if (el) el.textContent = `${dodgedBullets} | ${(typeof elapsedTime !== "undefined" ? elapsedTime : Math.floor(score / 60))}s`;
}

// Dodaj na końcu pliku:
function showNameInputBox() {
  // Ukryj menu, żeby nie przykrywało okna z imieniem
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
    // Teraz pokaż menu i resztę
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

// Uruchom muzykę menu po pierwszym kliknięciu
document.body.addEventListener("mousedown", function playMenuMusicOnce() {
  if (menuMusic.paused) {
    menuMusic.currentTime = 0;
    menuMusic.play();
  }
  document.body.removeEventListener("mousedown", playMenuMusicOnce);
});

