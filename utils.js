function detectCollisions() {
  if (performance.now() < invincibleUntilMs) return;

  for (let bullet of bullets) {
    const dx = bullet.x - player.x;
    const dy = bullet.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bullet.hitbox + player.hitbox) {
      if (secondLifeEnabled && !secondLifeUsed) {
        secondLifeUsed = true;
        player.hp = 50;
        player.invincibleUntil = frame + 120;
        return;
      } else {
        // NIE ustawiaj gameState tutaj!
        player.hp = 0; // wymuś śmierć, obsłuży to gameLoop
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
  // Poprawka: użyj endTime i startTime
  let czas = (typeof endTime !== "undefined" && endTime > 0)
    ? Math.floor((endTime - startTime) / 1000)
    : Math.floor((performance.now() - startTime) / 1000);
  ctx.fillText(`Przetrwałeś: ${czas} sekund`, canvas.width / 2 - 100, canvas.height / 2 + 40);
  ctx.fillText(`Naciśnij ENTER, aby zagrać ponownie`, canvas.width / 2 - 150, canvas.height / 2 + 80);
}



function saveHighscore(playerName = "") {
  let highscores = JSON.parse(localStorage.getItem("highscores") || "[]");
  let czas = (typeof endTime !== "undefined" && endTime > 0)
    ? Math.floor((endTime - startTime) / 1000)
    : Math.floor((performance.now() - startTime) / 1000);
  highscores.push({
    name: playerName || "Anonim",
    time: czas,
    dodged: dodgedBullets,
    hell: hellMode ? true : false,
    secondlife: secondLifeUsed ? true : false
  });
  highscores.sort((a, b) => b.dodged - a.dodged || b.time - a.time);
  highscores = highscores.slice(0, 5);
  localStorage.setItem("highscores", JSON.stringify(highscores));
  renderHighscores();
}

function renderHighscores() {
  let highscores = JSON.parse(localStorage.getItem("highscores") || "[]");
  highscores.sort((a, b) => b.dodged - a.dodged || b.time - a.time);

  const ol = document.getElementById("highscores");
  ol.innerHTML = "";
  for (let i = 0; i < 5; i++) { // tylko top 5
    const li = document.createElement("li");
    if (highscores[i]) {
      li.innerHTML =
        `<div class="score-row1">
           <span class="score-pos">${i + 1}.</span>
           <span class="score-name">${highscores[i].name || "Anonim"}</span>
         </div>
         <div class="score-row2">
           <span class="score-dodged">pociski: ${highscores[i].dodged}</span>
           <span class="score-time">czas: ${highscores[i].time}s</span>
           ${highscores[i].secondlife ? `<span class="score-secondlife" title="Użyto drugiego życia">*</span>` : ""}
         </div>`;
      if (highscores[i].hell) li.classList.add("hellscore");
      if (highscores[i].secondlife) li.classList.add("secondlife");
    } else {
      li.innerHTML = `<div class="score-row1"><span class="score-pos">${i + 1}.</span><span class="score-empty">---</span></div>`;
    }
    ol.appendChild(li);
  }
}
