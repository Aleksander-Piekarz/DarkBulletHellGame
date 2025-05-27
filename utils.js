function detectCollisions() {
  // Gracz nietykalny przez określony czas po drugim życiu
  if (frame < player.invincibleUntil) return;

  for (let bullet of bullets) {
    const dx = bullet.x - player.x;
    const dy = bullet.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bullet.hitbox + player.hitbox) {
      if (secondLifeEnabled && !secondLifeUsed) {
        secondLifeUsed = true;
        player.hp = 50;
        player.invincibleUntil = frame + 120; // 2 sekundy nietykalności (przy 60 FPS)
        return;
      } else {
        saveHighscore(); // <--- DODAJ TO TUTAJ!
        gameState = "gameover";
        return;
      }
    }
  }
}



// Wywołuj tę funkcję w każdej klatce gry zamiast drawScore()

function drawGameOver() {
  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
  ctx.font = "20px Arial";
  ctx.fillText(`Przetrwałeś: ${Math.floor(score / 60)} sekund`, canvas.width / 2 - 100, canvas.height / 2 + 40);
  ctx.fillText(`Naciśnij ENTER, aby zagrać ponownie`, canvas.width / 2 - 150, canvas.height / 2 + 80);
}



function saveHighscore() {
  let highscores = JSON.parse(localStorage.getItem("highscores") || "[]");
  highscores.push({
    time: Math.floor(score / 60),
    dodged: dodgedBullets,
    hell: hellMode ? true : false,
    secondlife: secondLifeUsed ? true : false // zapisz info o użyciu second life
  });
  // Sortuj po ilości pocisków (malejąco), potem po czasie (malejąco)
  highscores.sort((a, b) => b.dodged - a.dodged || b.time - a.time);
  highscores = highscores.slice(0, 10);
  localStorage.setItem("highscores", JSON.stringify(highscores));
  renderHighscores();
}

function renderHighscores() {
  let highscores = JSON.parse(localStorage.getItem("highscores") || "[]");
  // Sortuj po ilości pocisków (malejąco), potem po czasie (malejąco)
  highscores.sort((a, b) => b.dodged - a.dodged || b.time - a.time);

  const ol = document.getElementById("highscores");
  ol.innerHTML = "";
  for (let i = 0; i < 10; i++) {
    const li = document.createElement("li");
    if (highscores[i]) {
      li.innerHTML =
        `<span class="score-pos">${i + 1}.</span>` +
        `<span class="score-dodged">pociski: ${highscores[i].dodged}</span>` +
        `<span class="score-time">${highscores[i].time}s</span>` +
        (highscores[i].secondlife ? `<span class="score-secondlife" title="Użyto drugiego życia">*</span>` : "");
      if (highscores[i].hell) li.classList.add("hellscore");
      if (highscores[i].secondlife) li.classList.add("secondlife");
    } else {
      li.innerHTML = `<span class="score-pos">${i + 1}.</span><span class="score-empty">---</span>`;
    }
    ol.appendChild(li);
  }
}
