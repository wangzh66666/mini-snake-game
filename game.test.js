const test = require("node:test");
const assert = require("node:assert/strict");
const { SnakeGame, DIRECTIONS } = require("./game");

test("winning on the final free cell does not search forever", () => {
  const game = new SnakeGame(2, () => 0);
  game.snake = [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }];
  game.direction = DIRECTIONS.ArrowRight;
  game.nextDirection = DIRECTIONS.ArrowRight;
  game.food = { x: 1, y: 0 };
  game.status = "playing";

  game.tick();

  assert.equal(game.snake.length, 4);
  assert.equal(game.status, "won");
  assert.equal(game.food, null);
});

test("Up starts a ready game moving Up", () => {
  const game = new SnakeGame();
  game.setDirection("ArrowUp");
  assert.equal(game.status, "playing");
  assert.deepEqual(game.nextDirection, DIRECTIONS.ArrowUp);
  game.tick();
  assert.deepEqual(game.snake[0], { x: 10, y: 9 });
});

test("an opposite direction can start a finished game", () => {
  const game = new SnakeGame();
  game.direction = DIRECTIONS.ArrowDown;
  game.nextDirection = DIRECTIONS.ArrowDown;
  game.status = "over";
  assert.equal(game.setDirection("ArrowUp"), true);
  assert.deepEqual(game.nextDirection, DIRECTIONS.ArrowUp);
});
