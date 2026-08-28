"use strict";

const canvas = document.querySelector("#game-board");
const context = canvas.getContext("2d");
const scoreElement = document.querySelector("#score");
const highScoreElement = document.querySelector("#high-score");
const statusElement = document.querySelector("#status-text");
const overlay = document.querySelector("#game-overlay");
const overlayLabel = document.querySelector("#overlay-label");
const overlayTitle = document.querySelector("#overlay-title");
const overlayMessage = document.querySelector("#overlay-message");
const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");
const pauseIcon = document.querySelector("#pause-icon");
const pauseLabel = document.querySelector("#pause-label");

const GRID_SIZE = 20;
const CELL_SIZE = canvas.width / GRID_SIZE;
const START_SPEED = 145;
const MIN_SPEED = 70;

let snake;
let food;
let direction;
let nextDirection;
let score;
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;
let timerId = null;
let state = "ready";

const directionMap = {
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
};

function resetGame() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = { ...direction };
  score = 0;
  food = createFood();
  updateScores();
  draw();
}

// 随机生成食物，并确保食物不会出现在蛇身上。
function createFood() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake?.some(segment => segment.x === position.x && segment.y === position.y));
  return position;
}

function startGame() {
  clearTimeout(timerId);
  resetGame();
  state = "playing";
  overlay.classList.add("hidden");
  pauseButton.disabled = false;
  updateStatus("游戏进行中");
  scheduleTick();
}

function scheduleTick() {
  clearTimeout(timerId);
  if (state !== "playing") return;
  const speed = Math.max(MIN_SPEED, START_SPEED - Math.floor(score / 30) * 8);
  timerId = setTimeout(gameTick, speed);
}

// 每一帧先计算新蛇头，再依次处理进食、自身碰撞和撞墙。
function gameTick() {
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const ateFood = head.x === food.x && head.y === food.y;
  const bodyToCheck = ateFood ? snake : snake.slice(0, -1);
  const hitWall = head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
  const hitSelf = bodyToCheck.some(segment => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(head);
  if (ateFood) {
    score += 10;
    food = createFood();
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snakeHighScore", String(highScore));
    }
    updateScores();
  } else {
    snake.pop();
  }

  draw();
  scheduleTick();
}

function endGame() {
  state = "over";
  clearTimeout(timerId);
  pauseButton.disabled = true;
  updateStatus("游戏结束");
  overlayLabel.textContent = "本局得分 " + score;
  overlayTitle.textContent = "游戏结束";
  overlayMessage.innerHTML = "别灰心，再试一次！<br>最高纪录：" + highScore;
  startButton.innerHTML = "再来一局 <span>→</span>";
  overlay.classList.remove("hidden");
}

function togglePause() {
  if (state === "playing") {
    state = "paused";
    clearTimeout(timerId);
    pauseIcon.textContent = "▶";
    pauseLabel.textContent = "继续";
    updateStatus("已暂停");
  } else if (state === "paused") {
    state = "playing";
    pauseIcon.textContent = "Ⅱ";
    pauseLabel.textContent = "暂停";
    updateStatus("游戏进行中");
    scheduleTick();
  }
}

// 禁止在同一移动周期内反向操作，避免蛇头直接撞向身体。
function changeDirection(newDirection) {
  if (newDirection.x + direction.x === 0 && newDirection.y + direction.y === 0) return;
  nextDirection = newDirection;
  if (state === "ready" || state === "over") startGame();
}

function updateScores() {
  scoreElement.textContent = String(score).padStart(3, "0");
  highScoreElement.textContent = String(highScore).padStart(3, "0");
}

function updateStatus(text) { statusElement.textContent = text; }

function draw() {
  context.fillStyle = "#e7efdc";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制轻量网格，使移动单位更容易辨认。
  context.strokeStyle = "rgba(62, 91, 67, 0.07)";
  context.lineWidth = 1;
  for (let i = 1; i < GRID_SIZE; i += 1) {
    const offset = i * CELL_SIZE;
    context.beginPath(); context.moveTo(offset, 0); context.lineTo(offset, canvas.height); context.stroke();
    context.beginPath(); context.moveTo(0, offset); context.lineTo(canvas.width, offset); context.stroke();
  }

  context.fillStyle = "#f26d4b";
  context.beginPath();
  context.arc((food.x + .5) * CELL_SIZE, (food.y + .5) * CELL_SIZE, CELL_SIZE * .34, 0, Math.PI * 2);
  context.fill();

  snake.forEach((segment, index) => {
    const gap = 2;
    context.fillStyle = index === 0 ? "#183e2a" : "#3d7651";
    context.beginPath();
    context.roundRect(segment.x * CELL_SIZE + gap, segment.y * CELL_SIZE + gap, CELL_SIZE - gap * 2, CELL_SIZE - gap * 2, index === 0 ? 7 : 5);
    context.fill();
  });
}

document.addEventListener("keydown", event => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (directionMap[key]) {
    event.preventDefault();
    changeDirection(directionMap[key]);
  } else if (event.code === "Space") {
    event.preventDefault();
    togglePause();
  }
});

document.querySelectorAll("[data-direction]").forEach(button => {
  button.addEventListener("click", () => changeDirection(directionMap[`Arrow${button.dataset.direction[0].toUpperCase()}${button.dataset.direction.slice(1)}`]));
});
startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);

highScoreElement.textContent = String(highScore).padStart(3, "0");
resetGame();
