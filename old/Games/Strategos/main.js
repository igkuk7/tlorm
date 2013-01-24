window.onload = function() {
	var canvas = document.getElementById("tlorm_game_canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	var game = new TLORM.Game("Strategos", canvas);

	setup_world(game, canvas);
	game.start();
};

/* Game entities */
function setup_world(game, canvas) {
	var grid_w = 50;
	var grid_h = 50;
	var camera = TLORM.QuickEntity.Level(game, "levels/test1.txt", "World",
			"#AAACCA", grid_w, grid_h, canvas.width, canvas.height);

	/*
	 * TLORM.QuickEntity.World(game, "World", "#AAACCA", canvas.width,
	 * canvas.height, grid_x, grid_y);
	 * 
	 * var players = 4; var mid_w = Math.floor(grid_x/2)-Math.floor(players/2);
	 * for (var i=0; i<players; ++i) { TLORM.QuickEntity.Player(game,
	 * "Player"+(i+1), "#00F", "#44F", mid_w+(i*2), grid_y-1, grid_w, grid_h); }
	 * 
	 * var enemies = 2; mid_w = Math.floor(grid_x/2)-Math.floor(enemies/2); for
	 * (var i=0; i<enemies; ++i) { TLORM.QuickEntity.Enemy(game, "Enemy"+(i+1),
	 * "#F00", mid_w+(i*2), 0, grid_w, grid_h); }
	 * 
	 * for (var i=1; i<grid_x-1; i++) { for (var j=1; j<grid_y-1; ++j) { if
	 * (Math.random() < 0.25) { TLORM.QuickEntity.Wall(game, "Wall-"+i+"-"+j,
	 * "#456456", i, j, grid_w, grid_h); } } }
	 */

	game.system_manager.addSystem(new TLORM.System.AIInput());
	game.system_manager.addSystem(new TLORM.System.UserInput());
	game.system_manager.addSystem(new TLORM.System.Movement());
	game.system_manager.addSystem(new TLORM.System.Combat());
	game.system_manager.addSystem(new TLORM.System.CleanUp(0, 0, canvas.width,
			canvas.height));
	game.system_manager.addSystem(new TLORM.System.Render(game.canvasContext(),
			canvas.width, canvas.height));
}