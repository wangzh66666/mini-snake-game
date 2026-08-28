(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.SnakeGame = api.SnakeGame;
})(typeof globalThis === "undefined" ? this : globalThis, function () {
  const DIRECTIONS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  };

  class SnakeGame {
    constructor(size = 20, random = Math.random) {
      this.size = size;
      this.random = random;
      this.resetGame();
    }

    resetGame() {
      const middle = Math.floor(this.size / 2);
      this.snake = [{ x: middle, y: middle }];
      this.direction = DIRECTIONS.ArrowRight;
      this.nextDirection = DIRECTIONS.ArrowRight;
      this.food = null;
      this.score = 0;
      this.status = "ready";
    }

    startGame(direction) {
      // Reset first: resetGame must not overwrite the direction chosen to start.
      if (this.status !== "playing") this.resetGame();
      if (direction) {
        this.direction = direction;
        this.nextDirection = direction;
      }
      this.status = "playing";
      this.createFood();
    }

    setDirection(key) {
      const requested = DIRECTIONS[key];
      if (!requested) return false;

      if (this.status !== "playing") {
        this.startGame(requested);
        return true;
      }

      const isOpposite =
        requested.x + this.direction.x === 0 &&
        requested.y + this.direction.y === 0;
      if (!isOpposite) this.nextDirection = requested;
      return !isOpposite;
    }

    createFood() {
      const occupied = new Set(this.snake.map(({ x, y }) => `${x},${y}`));
      const freeCells = [];
      for (let y = 0; y < this.size; y += 1) {
        for (let x = 0; x < this.size; x += 1) {
          if (!occupied.has(`${x},${y}`)) freeCells.push({ x, y });
        }
      }

      // A full board is a win, not a reason to retry random positions forever.
      if (freeCells.length === 0) {
        this.food = null;
        this.status = "won";
        return null;
      }

      this.food = freeCells[Math.floor(this.random() * freeCells.length)];
      return this.food;
    }

    tick() {
      if (this.status !== "playing") return;
      this.direction = this.nextDirection;
      const head = {
        x: this.snake[0].x + this.direction.x,
        y: this.snake[0].y + this.direction.y,
      };
      const hitWall = head.x < 0 || head.y < 0 || head.x >= this.size || head.y >= this.size;
      const ate = this.food && head.x === this.food.x && head.y === this.food.y;
      // The tail vacates its cell unless the snake is growing this tick.
      const body = ate ? this.snake : this.snake.slice(0, -1);
      const hitSelf = body.some(({ x, y }) => x === head.x && y === head.y);
      if (hitWall || hitSelf) {
        this.status = "over";
        return;
      }

      this.snake.unshift(head);
      if (ate) {
        this.score += 1;
        this.createFood();
      } else {
        this.snake.pop();
      }
    }
  }

  return { SnakeGame, DIRECTIONS };
});
