// Snake
// Originated from a Hacker School workshop with Mary Rose Cook

;(function() {
  // ========
  // Define game object
  // ========

  var Game = function() {
    var screen = document.getElementById("screen").getContext('2d');
    screen.font = "17px consolas";
    screen.textAlign = "center";
    this.size = { x: screen.canvas.width, y: screen.canvas.height };
    this.center = { x: this.size.x / 2, y: this.size.y / 2 };
    this.eatSound = document.getElementById('eat-sound');

    this.grid_size = 10;
    this.keyboarder = new Keyboarder();

    this.boundary_thickness = this.grid_size;
    this.boundary = new Boundary(this);
    this.boundary.draw();
    this.snake = new Snake(this, new Head(this));
    this.food = new Food(this);

    var self = this;
    self.highrestimestamp = 0;
    self.redraw_freq = 160;
    var tick = function(timestamp) {
      self.keyboarder.update_key_logs();

      if (timestamp === undefined) {
        self.update();
        self.draw(screen);
      } else if (timestamp - self.highrestimestamp > self.redraw_freq) {
        self.update();
        self.draw(screen);
        self.highrestimestamp = timestamp;
        self.keyboarder.reset_key_logs();
      };

      requestAnimationFrame(tick);
    };

    tick();
  };

  Game.prototype = {
    update: function() {
      if (this.snake.alive) {
        reportCollisions(this.snake.blocks, this.snake.blocks);
        reportCollisions(this.snake.blocks, [this.boundary.topbound]);
        reportCollisions(this.snake.blocks, [this.boundary.bottombound]);
        reportCollisions(this.snake.blocks, [this.boundary.leftbound]);
        reportCollisions(this.snake.blocks, [this.boundary.rightbound]);
        reportCollisions(this.snake.blocks, [this.food]);
  
        this.snake.update();
      }
    },

    draw: function(screen) {
      screen.clearRect(this.boundary_thickness, this.boundary_thickness, this.size.x - this.boundary_thickness*2, this.size.y - this.boundary_thickness*2);
      if (this.snake.alive) {
        this.food.draw(screen);
        for (i = 0; i < this.snake.blocks.length; i++ ) {
          this.snake.blocks[i].draw(screen);
        }
      } else {
      this.boundary.color = 'red';
      this.boundary.draw();
      screen.fillText("Game Over", this.center.x, this.center.y - 20)
      screen.fillText("(refresh page to restart)", this.center.x, this.center.y + 20)
      }
    },

    killSnake: function() {
      this.snake.alive = false;
    }
  }

  // ========
  // Game boundaries
  // ========

  var Bound = function(center, size) {
    this.center = center;
    this.size = size;
  };

  var Boundary = function(game) {
    this.game = game;
    this.screen = document.getElementById("screen").getContext('2d');
    this.color = "black";
    this.topbound = new Bound(
      { x: game.center.x, y: game.boundary_thickness / 2 },
      { x: game.size.x, y: game.boundary_thickness }
    );
    this.bottombound = new Bound(
      { x: game.center.x, y: game.size.y - game.boundary_thickness / 2 },
      { x: game.size.x, y: game.boundary_thickness }
    );
    this.leftbound = new Bound(
      { x: game.boundary_thickness / 2, y: game.center.y },
      { x: game.boundary_thickness, y: game.size.y }
    );
    this.rightbound = new Bound(
      { x: game.size.x - game.boundary_thickness / 2, y: game.center.y },
      { x: game.boundary_thickness, y: game.size.y }
    );
  };

  Boundary.prototype = {
    draw: function() {
      this.screen.fillStyle = this.color;
      drawRect(this.screen, this.topbound);
      drawRect(this.screen, this.bottombound);
      drawRect(this.screen, this.leftbound);
      drawRect(this.screen, this.rightbound)
    }
  };

  // ========
  // Sprite classes
  // ========

  // Snake

  var Snake = function(game, head) {
    this.game = game;
    this.blocks = [head];
    this.prev_positions = [{ x: this.blocks[0].center.x, y: this.blocks[0].center.y}];
    this.alive = true;
  };

  Snake.prototype = {
    update: function() {
      this.blocks[0].update();

      for (i = 1; i < this.blocks.length; i++) {
        this.blocks[i].update(this.prev_positions[i-1]);
      };

      for (i = 0; i < this.blocks.length; i++) {
        this.prev_positions[i] = { x: this.blocks[i].center.x, y: this.blocks[i].center.y};
      };
    },

    addTailBlock: function() {
      this.blocks.push(new TailBlock({ x: this.blocks[this.blocks.length - 1].center.x, y: this.blocks[this.blocks.length - 1].center.y }));

      // Play sound
      this.game.eatSound.load();
      this.game.eatSound.play();

      // Increase game speed as snake grows
      if (this.game.redraw_freq > 70) {
        this.game.redraw_freq = 160 * Math.pow(0.988, this.blocks.length - 1);
      }
    }
  };

  // Head

  var Head = function(game) {
    this.game = game;
    this.size = { x: 10, y: 10 };
    this.center = { x: this.game.center.x, y: game.center.y };
    this.direction = [0, 0];
    this.speed = 10;
    this.color = "black";
  };

  Head.prototype = {
    update: function() {
      if (this.game.keyboarder.key_logs.LEFT && !(this.direction[0] === 1 && this.direction[1] === 0)) {
        this.direction = [-1, 0];
      } else if (this.game.keyboarder.key_logs.RIGHT && !(this.direction[0] === -1 && this.direction[1] === 0)) {
        this.direction = [1, 0];
      } else if (this.game.keyboarder.key_logs.UP && !(this.direction[0] === 0 && this.direction[1] === 1)) {
        this.direction = [0, -1];
      } else if (this.game.keyboarder.key_logs.DOWN && !(this.direction[0] === 0 && this.direction[1] === -1)) {
        this.direction = [0, 1];
      };

      this.center.x = this.center.x + this.direction[0] * this.speed
      this.center.y = this.center.y + this.direction[1] * this.speed
    },

    draw: function(screen) {
      drawRect(screen, this);
    },

    collision: function(collided_with) {
      if (collided_with instanceof Bound) {
        this.game.killSnake();
      } else if (collided_with instanceof TailBlock) {
        this.game.killSnake();
      } else if (collided_with instanceof Food) {
        this.game.snake.addTailBlock();
      }
    }
  };

  // TailBlock

  var TailBlock = function(center) {
    this.size = { x: 10, y: 10 };
    this.center = center;
  };

  TailBlock.prototype = {
    draw: function(screen) {
      drawRect(screen, this);
    },

    update: function(center) {
      this.center = center;
    }
  };

  // Food

  var Food = function(game) {
    this.game = game;
    this.size = { x: 10, y: 10 };
    this.center = null;
    this.regenPosition();
    this.color = "green";
  };

  Food.prototype = {
    draw: function(screen) {
      drawRect(screen, this);
    },

    collision: function() {
      this.regenPosition();
    },

    regenPosition: function() {
      this.center = {
        x: (this.game.grid_size / 2) + this.game.boundary_thickness + (Math.floor(Math.random() * (this.game.size.x - 2*this.game.boundary_thickness) / this.game.grid_size)) * this.game.grid_size,
        y: (this.game.grid_size / 2) + this.game.boundary_thickness + (Math.floor(Math.random() * (this.game.size.y - 2*this.game.boundary_thickness) / this.game.grid_size)) * this.game.grid_size
      };
    }
  };

  // ========
  // Collisions
  // ========

  var isColliding = function(b1, b2) {
    return !(
      b1 === b2 ||
        b1.center.x - 0.1 + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
        b1.center.y - 0.1 + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
        b1.center.x + 0.1 - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
        b1.center.y + 0.1 - b1.size.y / 2 > b2.center.y + b2.size.y / 2
    );
  };

  var reportCollisions = function(collide_group_a, collide_group_b) {

    var collidingPairs = [];
    for (var i = 0; i < collide_group_a.length; i++) {
      for (var j = 0; j < collide_group_b.length; j++) {
        if (isColliding(collide_group_a[i], collide_group_b[j])) {
          collidingPairs.push([collide_group_a[i], collide_group_b[j]]);
        }
      }
    }

    for (var i = 0; i < collidingPairs.length; i++) {
      if (collidingPairs[i][0].collision !== undefined) {
        collidingPairs[i][0].collision(collidingPairs[i][1]);
      }

      if (collidingPairs[i][1].collision !== undefined) {
        collidingPairs[i][1].collision(collidingPairs[i][0]);
      }
    }
  };

  // ========
  // Draw functions
  // ========

  var drawRect = function(screen, rect_obj) {
    // draw a rectangle for a sprite, given its center and size in x,y-coords
    screen.fillStyle = rect_obj.color;
    screen.fillRect(rect_obj.center.x - rect_obj.size.x / 2, rect_obj.center.y - rect_obj.size.y / 2,
                    rect_obj.size.x, rect_obj.size.y);
  };

  // ========
  // Keyboarder
  // ========

  var Keyboarder = function(game) {
    var keyState = {};

    window.addEventListener('keydown', function(e) {
      keyState[e.keyCode] = true;
    });

    window.addEventListener('keyup', function(e) {
      keyState[e.keyCode] = false;
    });

    self = this;
    this.key_logs = { 'LEFT': false, 'RIGHT': false, 'UP': false, 'DOWN': false };
    this.isDown = function(keyCode) {
      return keyState[keyCode] == true;
    };

    this.KEYS = { LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40 };

    this.update_key_logs = function() {
      for (key in self.KEYS) {
        if (self.isDown(self.KEYS[key])) {
          self.key_logs[key] = true;
        }
      }
    };

    this.reset_key_logs = function() {
      self.key_logs = { 'LEFT': false, 'RIGHT': false, 'UP': false, 'DOWN': false }; 
    }
  };

  // ========
  // Load game
  // ========

  window.addEventListener('load', function() {
    new Game();
  });
})();
