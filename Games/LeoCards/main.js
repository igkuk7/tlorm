window.onload = function() {
	var canvas = document.getElementById("tlorm_game_canvas");
	var game = new TLORM.Game("LeoDots", canvas);
	
	var cw = 100;
	var ch = 150;
	var sw = 10;
	var sh = 10;
	
	var size = TLORM.QuickEntity.RandomCards(game, "Random", cw, ch, sw, sh, ['#F00', '#0F0', '#00F' ]);
	game.setSize(size.w, size.h);

	game.system_manager.addSystem(new TLORM.System.RenderCards(game.canvasContext(), canvas.width, canvas.height));
	game.system_manager.addSystem(new TLORM.System.UserInput());
	game.system_manager.addSystem(new TLORM.System.Scoring());
	game.start();
};