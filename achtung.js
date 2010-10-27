
function Round(game, players) {
	self = this;
	
	this.game = game;
	this.initialPlayers = players;
	this.remainingPlayers = players.length;
	
	this.players = {};
	$.each(players, function(i, player) {
		self.players[player.id] = player;
	});
	
	this.snakes = {};
	
	this.initSnakes = function() {
		$.each(this.players, function(i, player) {
			var snake = new Snake(self, player);
			self.snakes[i] = snake;
			snake.randomizePosition();
			snake.draw();
		});
	}
	
	this.handleKeyEvent = function(evt) {
		if (this.snakes[evt.snake]) {
			if (evt.type == E_KEY_DOWN)
				this.snakes[evt.snake].startTurning(evt.direction);
			else if (evt.type == E_KEY_UP)
				this.snakes[evt.snake].stopTurning();
		}
	}
	
	this.start = function() {
		$.each(this.snakes, function(i, snake) {
			snake.start();
		});
	}
	
	this.snakeDied = function(snake) {
		// Remove correct element from active snakes
		var id = snake.player.id;
		delete this.snakes[id];
		delete this.players[id];
		this.remainingPlayers--;
		
		// Update scoreboard
		this.game.grantPoint(this.players);
		
		// Check for winner
		if (this.remainingPlayers == 1) {
			var winnerSnake;
			$.each(this.snakes, function(i, snake){ winnerSnake = snake });
			
			// Stop remaining snake
			winnerSnake.isAlive = false;
			
			// Highlight winner
			this.game.scoreboard.highlight(winnerSnake.player);
			
			// Notify game
			this.game.endRound();
		}
	}
	
	// Initialize
	this.initSnakes();
}

function Game(scoreboard) {
	var self = this;
	
	// Define which snakes are controlled left and right by which keyCodes (see: #handleKeyDown)
	this.keyEvents = keyEvents();
	
	// Make sure game and scoreboard are aquainted
	this.scoreboard = scoreboard;
	this.scoreboard.game = this;
	
	// Hold the current round
	this.currentRound = null;
	
	// inProgress-switches
	this.roundInProgress = false;
	this.gameInProgress = false;
	
	// Keeping track of scores and participating players
	this.scores = {};
	this.players = {};
	
	this.initialize = function(numberOfPlayers) {
		for (var i=0; i < numberOfPlayers; i++) {};
	}
	
	/**
	 * Initial handler for key presses. Passes on the logic to currentRound.
	 */
	this.handleKeyDown = function(event) {
		// alert(event.keyCode);
		
		if (this.roundInProgress) {
			this.handleKeyEvent(event, E_KEY_DOWN);
		}
		else if (this.gameInProgress && event.keyCode == KEY_SPACE) {
			// Waiting for round to start
			this.startRound();
		}
		else if (!this.gameInProgress) {
			if (event.keyCode == KEY_SPACE) {
				// Waiting for game to start
				this.start();
			}
			else if (this.keyEvents[event.keyCode]) {
				var n = this.keyEvents[event.keyCode].snake;
				this.togglePlayer(n);
			}
		}
	}
	
	this.togglePlayer = function(n) {
		if (this.players[n])
			delete this.players[n];
		else
			this.addPlayer(n);
	}
	
	this.handleKeyUp = function(event) {
		if (this.roundInProgress) {
			this.handleKeyEvent(event, E_KEY_UP);
		}
	}
	
	this.handleKeyEvent = function(event, type) {
		if (this.keyEvents[event.keyCode]) {
			var e = this.keyEvents[event.keyCode];
			e.type = type;
			this.currentRound.handleKeyEvent(e);
		}
	}
	
	/**
	 * Callback from currentRound to update global scoreboard each time a snake dies.
	 */
	this.grantPoint = function(players) {
		for (var key in players) {
			self.scores[players[key].id]++;
		}	
		self.scoreboard.update();
	}
	
	/**
	 * Pre-game logic for adding players.
	 */
	this.addPlayer = function(n) {
		if (!this.gameInProgress) {
			var player = {id: n, name: "Player " + n, color: COLORS[n]};
			
			// Push to player array
			this.players[n] = player;
		
			// Add to scoreboard
			this.scoreboard.addPlayer(player);
		}
		else {
			alert("Tried to add a player while in-game. This should not happen.");
		}
	}
	
	/**
	 * Start new set of rounds.
	 */
	this.start = function() {
		this.gameInProgress = true;
		this.resetScore();
		this.startRound();
	}
	
	/**
	 * Starts a new round.
	 */
	this.startRound = function() {
		this.roundInProgress = true;
		this.scoreboard.restore();
		
		this.currentRound = new Round(this, this.players);
		setTimeout(function(){
			self.currentRound.start();
		}, 1500);
	}
	
	this.endRound = function() {
		this.roundInProgress = false;
		
		// Maek fix logic for next round etc.
		// alert("GAME OVER! " + this.snakes[0].player.name + " WONZ!");
	}
	
	/**
	 * Resets score and scoreboard.
	 */
	this.resetScore = function() {
		// Set each score to zero
		for (var i = 0; i < this.players.length; i++)
			this.scores[this.players[i].id] = 0;
		
		this.scoreboard.update();
	}
	
}

function Snake(round, player, startX, startY, startDirection) {
	var self = this;
	
	this.isAlive = true;
	
	this.round = round;
	this.player = player;
	this.color = this.player.color;
	
	// Some optional fields (should be set by randomizePosition)
	this.x = startX;
	this.y = startY;
	this.direction = startDirection;
	
	// Turn control
	this.turnLock = false;
	this.turning = false;
	this.turnTimer = null;
	
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
	
	this.startTurning = function(direction) {
		if (!this.turnLock || (this.turning && this.turning != direction)) {
			this.turning = direction;
			this.turn();
		}
	}
	this.stopTurning = function() {
		this.turning = null;
		this.turnLock = false;
		
		clearTimeout(this.turnTimer);
	}
	this.turn = function() {
		if (!this.turnLock) {
			this.direction = this.direction + this.turning * TURN_RATIO * Math.PI;
			this.turnLock = true;
			
			this.turnTimer = setTimeout(function(){
				self.turnLock = false;
				if (self.turning)
					self.turn();
			}, TURN_FREQ);
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
			time = HOLE_FREQ + Math.random() * HOLE_FREQ_VARIANCE - HOLE_FREQ_VARIANCE / 2;
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
				
				// Perform the drawing
				this.draw();
			}
			
			// Move again
			var s = this;
			setTimeout(function(){ s.move() }, TICK);
		}
	}
	
	this.draw = function() {
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
		this.round.snakeDied(this);
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
    HOLE_FREQ_VARIANCE = 1500,
    HOLE_SIZE = 5 * TICK,
	HOLE_SIZE_VARIANCE = 2 * TICK;

var LEFT = -1,
    RIGHT = 1;

var KEY_SPACE = 32,
	KEY_LEFT = 37,
	KEY_DOWN = 40,
	KEY_L_CTRL = 17,
	KEY_L_ALT = 18,
	KEY_M = 77,
	KEY_COMMA = 188,
	KEY_MULTIPLY = 106,
	KEY_MINUS = 109,
	KEY_1 = 49,
	KEY_Q = 81;

var	E_KEY_DOWN = 1,
    E_KEY_UP = 2;

var COLORS = {
	1: "#900",
	2: "#099",
	3: "#990",
	4: "#090",
	5: "#909"
}

function keyEvents() {
	var e = {};
	
	e[KEY_1] = 			{snake: 1, direction: LEFT};
	e[KEY_Q] = 			{snake: 1, direction: RIGHT};
	
	e[KEY_L_CTRL] = 	{snake: 2, direction: LEFT};
	e[KEY_L_ALT] = 		{snake: 2, direction: RIGHT};
	
	e[KEY_M] = 			{snake: 3, direction: LEFT};
	e[KEY_COMMA] = 		{snake: 3, direction: RIGHT};
	
	e[KEY_LEFT] = 		{snake: 4, direction: LEFT};
	e[KEY_DOWN] = 		{snake: 4, direction: RIGHT};
	
	e[KEY_MULTIPLY] = 	{snake: 5, direction: LEFT};
	e[KEY_MINUS] = 		{snake: 5, direction: RIGHT};
	
	return e;
}
