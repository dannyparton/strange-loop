// Snake game made during Hacker School workshop with Mary Rose Cook

;(function() {
  // ========
  // Define game object
  // ========

  var Game = function() {
    var screen = document.getElementById("screen").getContext('2d');
    this.size = { x: screen.canvas.width, y: screen.canvas.height };
    this.center = { x: this.size.x / 2, y: this.size.y / 2 };

    this.boundary_thickness = 10;
    this.boundary = new Boundary(this);
    this.boundary.draw();
    this.snake = new Snake(new Head(this));
    this.food = new Food(this);
    // this.sprites = [new Head(this), new Food(this)]
    // this.collidables = [this.head, this.boundary.topbound, this.boundary.bottombound];

    var self = this;
    self.highrestimestamp = 0;
    self.redraw_freq = 80;
    var tick = function(timestamp) {
      if (timestamp === undefined) {
        self.update();
        self.draw(screen);
      } else if (timestamp - self.highrestimestamp > self.redraw_freq) {
        self.update();
        self.draw(screen);
        self.highrestimestamp = timestamp;
      };

      requestAnimationFrame(tick);
    };

    tick();
    // setInterval(function() {
    //   self.update();
    //   self.draw(screen);
    // }, 50);
  };

  Game.prototype = {
    update: function() {
      // reportCollisions(this.foods, this.snake);
      if (this.snake.alive) {
        reportCollisions([this.snake.head], [this.boundary.topbound]);
        reportCollisions([this.snake.head], [this.boundary.bottombound]);
        reportCollisions([this.snake.head], [this.boundary.leftbound]);
        reportCollisions([this.snake.head], [this.boundary.rightbound]);
        reportCollisions([this.snake.head], [this.food]);
  
        this.snake.update();
      }
    },

    draw: function(screen) {
      // if (this.tick_num % this.redraw_rate == 0) {
        screen.clearRect(this.boundary_thickness, this.boundary_thickness, this.size.x - this.boundary_thickness*2, this.size.y - this.boundary_thickness*2);
        if (this.snake.alive) {
          this.snake.head.draw(screen);
          // for (i = 0; i < this.snake.tail.leng
          this.food.draw(screen);
        };
      // };
    },

    regenFood: function() {
      // TODO
    },

    killSnake: function() {
      this.snake.alive = false;
      this.boundary.color = 'red';
      this.boundary.draw();
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
    // this.bounds = [
    //   [0, 0, game.size.x, game.boundary_thickness],
    //   [0, game.size.y - game.boundary_thickness, game.size.x, game.boundary_thickness],
    //   [0, 0, game.boundary_thickness, game.size.y],
    //   [game.size.x - game.boundary_thickness, 0, game.boundary_thickness, game.size.y],
    // ];
  };

  Boundary.prototype = {
    draw: function() {
      //for (i = 0; i < this.bounds.length; i++) {
        this.screen.fillStyle = this.color;
        // screen.fillRect.apply(screen, this.bounds[i]);
        drawRect(this.screen, this.topbound);
        drawRect(this.screen, this.bottombound)
        drawRect(this.screen, this.leftbound)
        drawRect(this.screen, this.rightbound)
      //}
    }
  };

  // ========
  // Snake classes
  // ========

  var Snake = function(head) {
    this.head = head;
    this.tail = [];
    this.alive = true;
  };

  Snake.prototype = {
    update: function() {
      this.head.update();
      // for (i = 0; i < this.tail.length; i++) {
      //   this.tail[i].update();
      // };
    },

    die: function() {
      this.head.die();
      // for (i = 0; i < this.tail.length; i++) {
      //   this.tail.splice(i, 1);
      // };
      this.boundary.color = 'red';
    }
  };

  var Head = function(game) {
    this.game = game;
    this.size = { x: 10, y: 10 };
    this.center = { x: this.game.center.x, y: game.center.y };
    this.direction = [0, 0];
    this.speed = 10;
    this.color = "black";
    this.keyboarder = new Keyboarder();
  };

  Head.prototype = {
    update: function() {
      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) && !(this.direction[0] === 1 && this.direction[1] === 0)) {
        this.direction = [-1, 0];
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) && !(this.direction[0] === -1 && this.direction[1] === 0)) {
        this.direction = [1, 0];
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.UP) && !(this.direction[0] === 0 && this.direction[1] === 1)) {
        this.direction = [0, -1];
      // } else if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        // this.direction = [0, -1] ? !(this.direction[0] === 0 && this.direction[1] === 1) : [0, 1];
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.DOWN) && !(this.direction[0] === 0 && this.direction[1] === -1)) {
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
      }
    }
  };

  var Food = function(game) {
    this.game = game;
    this.size = { x: 10, y: 10 };
    this.center = {
      x: (this.game.boundary_thickness / 2) + (Math.random() * (this.game.size.x - this.game.boundary_thickness)),
      y: (this.game.boundary_thickness / 2) + (Math.random() * (this.game.size.y - this.game.boundary_thickness))
    };
    this.color = "green";
  };

  Food.prototype = {
    draw: function(screen) {
      drawRect(screen, this);
    },

    collision: function() {
      this.regenFood();
    },

    regenFood: function() {
      this.center = {
        x: (this.game.boundary_thickness / 2) + (Math.random() * (this.game.size.x - this.game.boundary_thickness)),
        y: (this.game.boundary_thickness / 2) + (Math.random() * (this.game.size.y - this.game.boundary_thickness))
      };
    }
  };

  // ========
  // Collisions
  // ========

  var isColliding = function(b1, b2) {
    return !(
      b1 === b2 ||
        b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
        b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
        b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
        b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2
    );
  };

  var reportCollisions = function(collide_group_a, collide_group_b) {

    // var boundaries = [boundary.topbound, boundary.bottombound, boundary.leftbound, boundary.rightbound];
    // var collidables = sprites.concat(boundaries);
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

  var drawRect = function(screen, sprite) {
    // draw a rectangle for a sprite, given its center and size in x,y-coords
    screen.fillStyle = sprite.color;
    screen.fillRect(sprite.center.x - sprite.size.x / 2, sprite.center.y - sprite.size.y / 2,
                    sprite.size.x, sprite.size.y);
  };

  // ========
  // Keyboarder
  // ========

  var Keyboarder = function() {
    var keyState = {};
    window.addEventListener('keydown', function(e) {
      keyState[e.keyCode] = true;
    });

    window.addEventListener('keyup', function(e) {
      keyState[e.keyCode] = false;
    });

    this.isDown = function(keyCode) {
      return keyState[keyCode] == true;
    };

    this.KEYS = { LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32 };
  };

  // ========
  // Load game
  // ========

  window.addEventListener('load', function() {
    new Game();
  });
})();
