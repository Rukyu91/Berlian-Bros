const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const el = document.getElementById("my-element");
if (el) el.innerText = "Halo!";

const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

const jumpSound = new Audio("assets/jump.wav");
const collectSound = new Audio("assets/collect.wav");

const playerImg = new Image();
playerImg.src = "assets/diamond.png";
const enemyImg = new Image();
enemyImg.src = "assets/enemy.png";

const player = {
  x: 50, y: 300, w: 40, h: 40,
  vx: 0, vy: 0,
  grounded: false,
  score: 0,
  lives: 3
};

const gravity = 0.5;
let damageCooldown = 0;

const platforms = [
  { x: 0, y: 360, w: 800, h: 40 },
  { x: 300, y: 280, w: 120, h: 20 },
  { x: 550, y: 200, w: 100, h: 20 },
];

const collectibles = [
  { x: 320, y: 250, w: 20, h: 20 },
  { x: 570, y: 170, w: 20, h: 20 }
];

const enemies = [
  { x: 400, y: 320, w: 40, h: 40, vx: 2 }
];

function loop() {
  requestAnimationFrame(loop);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gerakan
  player.vx = 0;
  if (keys["ArrowLeft"]) player.vx = -3;
  if (keys["ArrowRight"]) player.vx = 3;
  if (keys["Space"] && player.grounded) {
    player.vy = -10;
    player.grounded = false;
    jumpSound.play();
  }

  player.x += player.vx;
  player.vy += gravity;
  player.y += player.vy;

  // Platform
  player.grounded = false;
  platforms.forEach(p => {
    if (
      player.x < p.x + p.w &&
      player.x + player.w > p.x &&
      player.y + player.h > p.y &&
      player.y < p.y + p.h
    ) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.grounded = true;
    }
    ctx.fillStyle = "#222";
    ctx.fillRect(p.x, p.y, p.w, p.h);
  });

  // Koleksi
  collectibles.forEach((item, i) => {
    ctx.fillStyle = "yellow";
    ctx.fillRect(item.x, item.y, item.w, item.h);
    if (
      player.x < item.x + item.w &&
      player.x + player.w > item.x &&
      player.y < item.y + item.h &&
      player.y + player.h > item.y
    ) {
      collectibles.splice(i, 1);
      player.score += 10;
      collectSound.play();
    }
  });

  // Musuh
  enemies.forEach(enemy => {
    enemy.x += enemy.vx;
    if (enemy.x + enemy.w > canvas.width || enemy.x < 0) enemy.vx *= -1;
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.w, enemy.h);

    if (
      player.x < enemy.x + enemy.w &&
      player.x + player.w > enemy.x &&
      player.y < enemy.y + enemy.h &&
      player.y + player.h > enemy.y
    ) {
      if (damageCooldown <= 0) {
        player.lives -= 1;
        player.x = 50; player.y = 300;
        damageCooldown = 60;
      }
    }
  });

  if (damageCooldown > 0) damageCooldown--;

  // Player
  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);

  // HUD
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Skor: ${player.score}`, 10, 25);
  ctx.fillText(`Nyawa: ${player.lives}`, 10, 50);

  // Game Over
  if (player.lives <= 0) {
    alert("Game Over!");
    location.reload();
  }
}

playerImg.onload = loop;