const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

const playerImg = new Image();
playerImg.src = "assets/diamond.png";
const enemyImg = new Image();
enemyImg.src = "assets/enemy.png";
const itemImg = new Image();
itemImg.src = "assets/scales.png";

const jumpSound = new Audio("sounds/jump.wav");
const collectSound = new Audio("sounds/collect.wav");
const stepSound = new Audio("sounds/step.wav");
const bgMusic = new Audio("sounds/bg_music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;
bgMusic.play();

const player = {
  x: 100, y: 300,
  w: 40, h: 40,
  vx: 0, vy: 0,
  grounded: false,
  score: 0,
  lives: 3
};

const gravity = 0.6;
const platforms = [
  { x: 0, y: 360, w: 800, h: 40 },
  { x: 300, y: 280, w: 120, h: 20 },
  { x: 550, y: 200, w: 100, h: 20 }
];

const collectibles = [
  { x: 320, y: 250, w: 24, h: 24 },
  { x: 570, y: 170, w: 24, h: 24 }
];

const enemies = [
  { x: 400, y: 320, w: 40, h: 40, vx: 2 }
];

let damageCooldown = 0;

function loop() {
  requestAnimationFrame(loop);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.vx = 0;
  if (keys["ArrowLeft"]) {
    player.vx = -4;
    stepSound.play();
  }
  if (keys["ArrowRight"]) {
    player.vx = 4;
    stepSound.play();
  }

  if (keys["Space"] && player.grounded) {
    player.vy = -12;
    player.grounded = false;
    jumpSound.play();
  }

  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  // Batasan agar tidak keluar frame
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.min(canvas.height - player.h, player.y);

  // Platform collision
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
    ctx.fillStyle = "#444";
    ctx.fillRect(p.x, p.y, p.w, p.h);
  });

  // Collectibles
  collectibles.forEach((item, i) => {
    ctx.drawImage(itemImg, item.x, item.y, item.w, item.h);
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

  // Enemies
  enemies.forEach(enemy => {
    enemy.x += enemy.vx;
    if (enemy.x < 0 || enemy.x + enemy.w > canvas.width) enemy.vx *= -1;
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.w, enemy.h);

    if (
      player.x < enemy.x + enemy.w &&
      player.x + player.w > enemy.x &&
      player.y < enemy.y + enemy.h &&
      player.y + player.h > enemy.y
    ) {
      if (damageCooldown <= 0) {
        player.lives--;
        damageCooldown = 60;
        player.x = 100;
        player.y = 300;
      }
    }
  });

  if (damageCooldown > 0) damageCooldown--;

  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);

  // HUD
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Skor: ${player.score}`, 20, 30);
  ctx.fillText(`Nyawa: ${player.lives}`, 20, 60);

  // Game Over
  if (player.lives <= 0) {
    alert("Game Over!");
    location.reload();
  }
}

playerImg.onload = loop;