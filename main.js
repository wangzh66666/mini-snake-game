const game = new SnakeGame();
const canvas = document.querySelector("#board");
const context = canvas.getContext("2d");
const score = document.querySelector("#score");
const message = document.querySelector("#message");
const cell = canvas.width / game.size;

function draw() {
  context.fillStyle = "#101a27";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#6ee7a0";
  game.snake.forEach(({ x, y }, index) => {
    context.globalAlpha = index === 0 ? 1 : 0.82;
    context.fillRect(x * cell + 2, y * cell + 2, cell - 4, cell - 4);
  });
  context.globalAlpha = 1;
  if (game.food) {
    context.fillStyle = "#ff647c";
    context.beginPath();
    context.arc((game.food.x + 0.5) * cell, (game.food.y + 0.5) * cell, cell * 0.36, 0, Math.PI * 2);
    context.fill();
  }
  score.textContent = game.score;
  message.textContent = {
    ready: "按方向键开始",
    playing: "使用方向键控制",
    over: "游戏结束，按方向键重新开始",
    won: "恭喜，你占满了整个棋盘！",
  }[game.status];
}

document.addEventListener("keydown", (event) => {
  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
    game.setDirection(event.key);
    draw();
  }
});
document.querySelector("#restart").addEventListener("click", () => {
  game.resetGame();
  draw();
});
setInterval(() => {
  game.tick();
  draw();
}, 120);
draw();
