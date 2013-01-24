
window.onload = function() {
	setup_game();
};

function setup_game() {
	var canvas = document.getElementById("tlorm_game_canvas");
	var game = new TLORM.Game("SavvySpider", canvas);
	
	/* Setup entities */
	var world = TLORM.QuickEntity.World(game, 500, 500);
	var spider = TLORM.QuickEntity.Spider(game, 10, 10, 20, 20);
	game.setSize(world.w, world.h);

	TLORM.QuickEntity.Object(game, "object1", "#F0F", 10, 10, 4, 50,  -50,  50, 600);
	TLORM.QuickEntity.Object(game, "object2", "#0FF", 20, 20, 5, 150, -50, 150, 600);
	TLORM.QuickEntity.Object(game, "object2", "#0FF", 20, 20, 5, 15,  -50, 450, 600);
	
	/* Setup systems */
	game.render_system_manager.addSystem(new TLORM.System.Render(game.canvasContext(), canvas.width, canvas.height));
	game.system_manager.addSystem(new TLORM.System.UserInput());
	
	/* start the game */
	game.start();
};

