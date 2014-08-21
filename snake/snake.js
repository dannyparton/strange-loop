// Snake game made during Hacker School workshop with Mary Rose Cook

;(function() {
  // ========
  // Define game object
  // ========

  var Game = function() {
    var screen = document.getElementById("screen").getContext('2d');
    this.size = { x: screen.canvas.width, y: screen.canvas.height };
    console.log(this.size.x)
    console.log(this.size.y)
    this.center = { x: this.size.x / 2, y: this.size.y / 2 };

    this.boundary_thickness = 10;
    this.boundary = new Boundary(this);
    this.sprites = [new Head(this)]
    // this.collidables = [this.head, this.boundary.topbound, this.boundary.bottombound];

    var self = this;
    var tick = function() {
      self.update();
      self.draw(screen);
      requestAnimationFrame(tick);
    };

    tick();
  };

  Game.prototype = {
    update: function() {
      reportCollisions(this.sprites, this.boundary);

      for (i = 0; i < this.sprites.length; i++) {
        this.sprites[i].update();
      }
    },

    draw: function(screen) {
      screen.clearRect(0, 0, this.size.x, this.size.y);
      this.boundary.draw(screen);

      for (i = 0; i < this.sprites.length; i++) {
        this.sprites[i].draw(screen);
      }
    },

    removeSprite: function(sprite) {
      var spriteIndex = this.sprites.indexOf(sprite);
      this.sprites.splice(spriteIndex, 1);
      if (spriteIndex === 0) {
        this.boundary.color = 'red';
      }
    }
  }


  // ========
  // Game boundaries
  // ========

  var Boundary = function(game) {
    this.game = game;
    this.color = "black";
    this.topbound = {
      center: { x: game.center.x, y: game.boundary_thickness / 2 },
      size: { x: game.size.x, y: game.boundary_thickness }
    };
    this.bottombound = {
      center: { x: game.center.x, y: game.size.y - game.boundary_thickness / 2 },
      size: { x: game.size.x, y: game.boundary_thickness }
    };
    this.leftbound = {
      center: { x: game.boundary_thickness / 2, y: game.center.y },
      size: { x: game.boundary_thickness, y: game.size.y }
    };
    this.rightbound = {
      center: { x: game.size.x - game.boundary_thickness / 2, y: game.center.y },
      size: { x: game.boundary_thickness, y: game.size.y }
    };
    // this.bounds = [
    //   [0, 0, game.size.x, game.boundary_thickness],
    //   [0, game.size.y - game.boundary_thickness, game.size.x, game.boundary_thickness],
    //   [0, 0, game.boundary_thickness, game.size.y],
    //   [game.size.x - game.boundary_thickness, 0, game.boundary_thickness, game.size.y],
    // ];
  };

  Boundary.prototype = {
    draw: function(screen) {
      //for (i = 0; i < this.bounds.length; i++) {
        screen.fillStyle = this.color;
        // screen.fillRect.apply(screen, this.bounds[i]);
        drawRect(screen, this.topbound);
        drawRect(screen, this.bottombound)
        drawRect(screen, this.leftbound)
        drawRect(screen, this.rightbound)
      //}
    }
  };

  // ========
  // Sprites
  // ========

  var Head = function(game) {
    this.game = game;
    this.size = { x: 10, y: 10 };
    this.center = { x: this.game.center.x, y: game.center.y };
    this.direction = [0, 0];
    this.speed = 2;
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

    collision: function() {
      this.game.removeSprite(this);
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

  var reportCollisions = function(sprites, boundary) {
    var boundaries = [boundary.topbound, boundary.bottombound, boundary.leftbound, boundary.rightbound];
    var collidables = sprites.concat(boundaries);
    var collidingPairs = [];
    for (var i = 0; i < collidables.length; i++) {
      for (var j = i + 1; j < collidables.length; j++) {
        if (isColliding(collidables[i], collidables[j])) {
          collidingPairs.push([collidables[i], collidables[j]]);
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
