window.onload = function() {
	var canvas = document.getElementById("tlorm_game_canvas");
	var game = new TLORM.Game("Vampires", canvas);
	
	game.setSize(600,400);

	game.system_manager.addSystem(
		new TLORM.System.RenderRoom(
			game.canvasContext(),
			canvas.width, canvas.height,
			{ x: 300, y: 200, size: 10, speed: 5, target_x: 0, target_y: 0, spread: 10 },
			[
				{ x: 50,  y: 50,  w: 150, h: 30  },
				{ x: 350, y: 80,  w: 50,  h: 50 },
				{ x: 450, y: 350, w: 10,  h: 35  },
			],
			[
				{ x: 500, y: 100, w: 50,  h: 200 },
				{ x: 50,  y: 200, w: 100, h: 100 },
				{ x: 300, y: 20,  w: 200, h: 20 },
				{ x: 200, y: 370, w: 200, h: 20 },
			],
			[
				//{ x: 0,   y: 0,   size: 2, speed: 5, target_x: 600, target_y: 400, spread: 5 },
				{ x: 0,   y: 400, size: 2, speed: 5, target_x: 600, target_y: 0,   spread: 5 },
				//{ x: 600, y: 400, size: 2, speed: 5, target_x: 0,   target_y: 0,   spread: 5 },
				//{ x: 600, y: 0,   size: 2, speed: 5, target_x: 0,   target_y: 400, spread: 5 },
			]
		)
	);
	game.start();
};