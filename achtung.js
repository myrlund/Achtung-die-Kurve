
function Game(scoreboard) {
	this.keyEvents = {
		37: {snake: 0, direction: LEFT},
		40: {snake: 0, direction: RIGHT}
	}
	
	this.scoreboard = scoreboard;
	
	// Per game
	this.inProgress = false;
	this.snakes = [];
	this.scores = [];
	
	// Per round
	this.loserStack = new Array();
	
	this.handleKeyDown = function(event) {
		if (this.keyEvents[event.keyCode]) {
			var e = this.keyEvents[event.keyCode];
			if (this.snakes[e.snake]) {
				this.snakes[e.snake].turn(e.direction);
			}
		}
	}
	
	this.addPlayer = function(player) {
		player.id = this.snakes.length - 1;
		this.snakes.push(new Snake(this, player));
		
		// Update scoreboard
		this.scoreboard.addPlayer(player);
	}
	
	this.start = function() {
		this.totalPlayers = this.snakes.length;
		for (var i = 0; i < this.totalPlayers; i++)
			this.scores[this.snakes[i].player.id] = 0;
		this.startRound();
	}
	
	this.startRound = function() {
		this.inProgress = true;
		
		// Initialize snakes
		for (var i = 0; i < this.snakes.length; i++) {
			this.snakes[i].randomizePosition();
			this.snakes[i].start();
		}
	}
	
	this.endRound = function() {
		this.inProgress = false;
		
		// Stop remaining snake
		this.snakes[0].isAlive = false;
		
		// Maek fix logic for next round etc.
		// alert("GAME OVER! " + this.snakes[0].player.name + " WONZ!");
	}
	
	this.snakeDied = function(snake) {
		// Remove correct element from active snakes
		for (var i = 0; i < this.snakes.length; i++) {
			if (this.snakes[i] == snake) {
				var s = this.snakes.splice(i, 1)[0];
				break;
			}
		}
		
		// Push to loser stack
		this.loserStack.push(snake);
		
		// Update scoreboard
		for (var i = 0; i < this.snakes.length; i++) {
			var s = this.snakes[i];
			this.scores[s.player.id]++;
			this.scoreboard.setScore(s.player, this.scores[s.player.id]);
		}
		
		// Check for winner
		if (this.snakes.length == 1) {
			this.scoreboard.highlight(this.snakes[0])
			this.endRound();
		}
	}
}

function Snake(game, player, startX, startY, startDirection) {
	this.isAlive = true;
	
	this.game = game;
	this.player = player;
	this.color = this.player.color;
	
	// Some optional fields (should be set by randomizePosition)
	this.x = startX;
	this.y = startY;
	this.direction = startDirection;
	
	this.randomizePosition = function() {
		var x = Math.random() * (WIDTH - 100) + 50,
		    y = Math.random() * (HEIGHT - 100) + 50,
		    direction = Math.random() * Math.PI * 2;
		this.x = x;
		this.y = y;
		this.direction = direction;
	}
	
	// Calculates next position coordinates
	this.nextX = function() {
		return this.x + SPEED * Math.cos(this.direction);
	}
	this.nextY = function() {
		return this.y + SPEED * Math.sin(this.direction);
	}
	
	this.turn = function(direction) {
		if (!this.turnLock) {
			this.direction = this.direction + direction * TURN_RATIO * Math.PI;
			this.turnLock = true;
			var self = this;
			setTimeout(function(){ self.turnLock = false; }, TURN_FREQ);
		}
	}
	
	this.start = function() {
		var self = this;
		this.move();
		setTimeout(function(){self.toggleHoleGeneration()}, HOLE_FREQ);
	}
	
	this.toggleHoleGeneration = function() {
		var time, self = this;
		if (this.isMakingHole) 
			time = HOLE_FREQ + Math.random() * HOLE_FREQ_VARIANCE - HOLE_SIZE_VARIANCE / 2;
		else
			time = HOLE_SIZE + Math.random() * HOLE_SIZE_VARIANCE - HOLE_SIZE_VARIANCE / 2;
		
		this.isMakingHole = ! this.isMakingHole;
		setTimeout(function(){self.toggleHoleGeneration()}, time);
	}
	
	this.move = function() {
		// Check that player is indeed able to move
		if (this.isAlive) {
			if (this.isMakingHole) {
				this.x = this.nextX();
				this.y = this.nextY();
			}
			else {
				// Check for collision before painting
				this.checkForCollision(this.nextX(), this.nextY());
			
				// Perform move
				ctx.strokeStyle = this.color;
				ctx.lineWidth = LINE_WIDTH;
			
				ctx.beginPath();
				ctx.moveTo(this.x, this.y);
				this.x = this.nextX();
				this.y = this.nextY();
				ctx.lineTo(this.x, this.y);
				ctx.stroke();
				ctx.closePath();
			}
			
			// Move again
			var s = this;
			setTimeout(function(){ s.move() }, TICK);
		}
	}
	
	/**
	 * Checks for collisions, either when moving out of bounds, or into other snakes
	 */
	this.checkForCollision = function(x, y) {
		// First, check for out of bounds
		if (x < 0 || x > WIDTH || y < 0 || y > HEIGHT) {
			this.died();
		}
		// Now check for collisions with others
		else {
			var imgd = ctx.getImageData(x, y, 1, 1); // Check only one pixel
			
			var pix = imgd.data;
			for (var i = 0, n = pix.length; i < n; i++) {
				// If there exists a color (ie. alpha value > 0) we have a collision
				if (pix[i+3] > 0) {
					this.died();
				}
			}
			
			// Elsewise, there is no collision
			return false;
		}
	}
	
	/**
	 * Logic for when the snake dies.
	 */
	this.died = function() {
		this.isAlive = false;
		
		// Notify game
		this.game.snakeDied(this);
	}
	
	this.handleKeyDown = function(evt) {
		alert(evt);
		
	}
}

/**
 * Constants
 */

var TICK = 30;
var SPEED = 2.0;
var LINE_WIDTH = 4;

var TURN_RATIO = 0.1,
    TURN_FREQ = 100;

var HOLE_FREQ = 2000,
    HOLE_FREQ_VARIANCE = 500,
    HOLE_SIZE = 5 * TICK,
	HOLE_SIZE_VARIANCE = 2 * TICK;

var LEFT = -1,
    RIGHT = 1;
