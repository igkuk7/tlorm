
var game;

window.onload = function() {
	start_game();
};

function start_game(seed) {
	var canvas = document.getElementById("tlorm_game_canvas");
	if (game) { game.stop(); }
	game = new TLORM.Game("TLC", canvas);

	seed = seed || game.param('seed') || 1;
	var city = TLORM.QuickEntity.RandomCity(game, 0, 0, 51, 51, 10, 10, 5, 5, seed);
	game.setSize(city.w, city.h);
	game.system_manager.addSystem(new TLORM.System.Render(game.canvasContext(), canvas.width, canvas.height));
	game.start();
}