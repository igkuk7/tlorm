
var game;
window.onload = function() {
	var canvas = document.getElementById("tlorm_game_canvas");
	game = new TLORM.Game("Tubular", canvas);
	var menus = new TLORM.GameMenu(game, 'TubularMenu.json');
	game.onStop = function() {
		game.reset();
		menus.reset();
		menus.show();
	};
	menus.show();
};

function show_level() {
	var container_entities = game.entity_manager.getEntitiesByType('TubeRowContainer');
	if (container_entities.length == 0) return;
	var container = container_entities[0].getComponentByType('TubeRowContainer');
	if (!container) return;
	var string = "";
	for (var i=0; i<container.rows.length; ++i) {
		var tube_row = container.rows[i].getComponentByType('TubeRow');
		for (var j=0; j<tube_row.mapping.length; ++j) {
			string += tube_row.mapping[j];
		}
		if (container.rows[i].fixed) {
			string += "F";
		}
		string += "\n";
	}
	string += "E=";
	for (var i=0; i<container.end.length; ++i) {
		string += container.end[i];
	}
	string += "\n";
	
	window.open('data:text/plain;charset=utf-8,'+escape(string),'_blank');
}