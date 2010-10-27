/**
* Some code to encapsulate the scoreboard
*/

function Scoreboard(element) {
	this.element = $(element);
	this.game = null;
	
	/**
	 * Adds a player to the scoreboard. Typically run per game.
	 */
	this.addPlayer = function(player) {
		// Remove placeholder
		this.element.find("li.placeholder").remove();
		
		// Add player
		this.element.find("ol").append('<li style="color: ' + player.color + ';" id="score-player-' + player.id + '">' +
									     '<label>' + player.name + ':</label> ' +
										 '<strong class="score">0</strong>' +
									   '</li>');
	}
	
	/**
	 * Empties scoreboard of all player entries. Typically run per game.
	 */
	this.reset = function() {
		this.element.find("ol").empty();
	}
	
	/**
	 * Highlights row for player. Typically the winner of a round.
	 */
	this.highlight = function(player) {
		this._player(player).addClass("highlighted");
	}
	
	/**
	 * Removes highligts. Typically run per round.
	 */
	this.restore = function() {
		this.element.find(".highlighted").removeClass("highlighted");
	}
	
	/**
	 * Updates all shown scores based on game scores.
	 */
	this.update = function() {
		for (var i in this.game.scores) {
			this._player(i).find(".score").text(this.game.scores[i]);
		}
	}
	
	// DEPRECATED METHODS
	
	/**
	 * Sets the score for a given player. DEPRECATED: Use update directly instead.
	 */
	this.setScore = function(player, score) {
		console.log("WARNING: Scoreboard#setScore is deprecated. Use #update instead.");
		
		this._player(player).find(".score").text(score);
	}
	
	// HELPER METHODS
	
	/**
	 * Returns <li> for given player or player id.
	 */
	this._player = function(player) {
		if (player.id) player = player.id;
		return $("#score-player-"+player);
	}
	
}
