
var game;

window.onload = function() {
	start_game();
};

function start_game(seed) {
	var canvas = document.getElementById("tlorm_game_canvas");
	if (game) { game.stop(); }
	game = new TLORM.Game("FPS Test", canvas);

	var map = [
	 [0,0,0,0,0,0,0,0,9,9],
	 [0,0,6,0,0,0,0,0,0,0],
	 [0,7,0,0,1,0,0,5,5,0],
	 [0,0,1,1,1,0,0,0,0,0],
	 [0,0,0,0,1,2,0,0,0,0],
	 [0,0,0,0,0,0,2,0,0,0],
	 [0,0,0,0,0,2,3,2,0,0],
	 [0,0,0,0,0,0,2,0,0,0],
	 [0,2,2,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0,0],
	];
	var main_map = TLORM.QuickEntity.Map(game, "map1", 0, 0, 300, 300, map);
	var mini_map = TLORM.QuickEntity.MiniMap(game, "map1", 245, 245, 50, 50, map);
	game.setSize(main_map.w, main_map.h);
	game.system_manager.addSystem(new TLORM.System.Render3D(game.canvasContext(), canvas.width, canvas.height));
	game.system_manager.addSystem(new TLORM.System.Render(game.canvasContext(), canvas.width, canvas.height));
	game.start();
}