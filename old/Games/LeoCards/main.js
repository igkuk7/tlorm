var canvas;
var game;
var cw = 80;
var ch = 100;
var sw = 10;
var sh = 10;

var numbers = [
	{ colour: '#F00', value: 1 }, { colour: '#0F0', value: 2 },
	{ colour: '#00F', value: 3 }, { colour: '#FF0', value: 4 },
	{ colour: '#0FF', value: 5 }, { colour: '#F0F', value: 6 },
];
var letters = [
	{ colour: '#F00', value: 'A' }, { colour: '#0F0', value: 'B' },
	{ colour: '#00F', value: 'C' }, { colour: '#FF0', value: 'D' },
	{ colour: '#0FF', value: 'E' }, { colour: '#F0F', value: 'F' },
];

window.onload = function() {
	canvas = document.getElementById("tlorm_game_canvas");
	game = new TLORM.Game("LeoDots", canvas);
	game.onStop = function() { new_game(); }
	new_game();
};

function new_game() {
	game.reset();
	
	var choices = [];
	var type = game.param('type');
	if (type == 'numbers') {
		choices = numbers;
	} else if (type == 'letters') {
		choices = letters;
	} else {
		throw "Unknown type: "+type;
		return;
	}

	var num = game.param('num');
	if (num && num < choices.length) {
		choices.splice(num);
	}

	var size = TLORM.QuickEntity.RandomCards(game, "Random", cw, ch, sw, sh, choices);
	game.setSize(size.w, size.h);

	game.system_manager.addSystem(new TLORM.System.RenderCards(game.canvasContext(), canvas.width, canvas.height));
	game.system_manager.addSystem(new TLORM.System.UserInput());
	game.system_manager.addSystem(new TLORM.System.Scoring());
	game.start();
}
