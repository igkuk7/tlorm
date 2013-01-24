
window.onload = function() {
	setup_game();
};

function setup_game() {
	var canvas = document.getElementById("tlorm_game_canvas");
	var game = new TLORM.Game("foo", canvas);
	
	/* Setup entities */
	
	/* Setup systems */
	
	/* start the game */
	game.start();
};

