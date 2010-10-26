/**
* Some code to encapsulate the scoreboard
*/

function Scoreboard(element) {
	this.element = $(element);
	
	this.addPlayer = function(player) {
		this.element.find("ol").append('<li id="' + player.name + '"><label>' + player.name + ':</label> <strong class="score">0</strong></li>');
	}
	
	this.setScore = function(player, score) {
		$("#"+player.name+" .score").text(score);
	}
	
	this.highlight = function(player) {
		$("#"+player.name).addClass("highlighted");
	}
	
	this.restore = function() {
		this.element.find(".highlighted").removeClass("highlighted");
	}
	
	this.reset = function() {
		this.restore();
		this.element.first("ol").empty();
	}
	
}
