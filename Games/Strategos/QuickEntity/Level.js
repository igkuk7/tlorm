
TLORM.QuickEntity.Level = function(game, level_file, name, colour, gw, gh, cw, ch) {
	var level = game.resource_manager.loadFile(level_file);
	var lines = level.split("\n");
	var gx = null;
	var gy = lines.length;
	var enemy_count = 0;
	var player_count = 0;
	for (var i=0; i<lines.length; i++) {
		var line = lines[i].split("|");
		if (line.length > gx) { gx = line.length; }
		for (var j=0; j<line.length; j++) {
			var cells = line[j].split(',');
			for (var k=0; k<cells.length; k++) {
				/* set the cells */
				switch (cells[k]) {
					case 'B':
						TLORM.QuickEntity.Wall(game, "Wall-"+j+"-"+i, j, i, gw, gh);
						break;
					case 'E':
						TLORM.QuickEntity.Grass(game, "Grass-"+j+"-"+i, j, i, gw, gh);
						TLORM.QuickEntity.Enemy(game, "Enemy"+(++enemy_count), j, i, gw, gh);
						break;
					case 'A':
						TLORM.QuickEntity.Grass(game, "Grass-"+j+"-"+i, j, i, gw, gh);
						TLORM.QuickEntity.Enemy(game, "Enemy"+(++enemy_count), j, i, gw, gh, 'Aggressive');
						break;
					case 'P':
						TLORM.QuickEntity.Grass(game, "Grass-"+j+"-"+i, j, i, gw, gh);
						TLORM.QuickEntity.Player(game, "Player"+(++player_count),  j, i, gw, gh);
						break;
					case ' ':
						TLORM.QuickEntity.Grass(game, "Grass-"+j+"-"+i, j, i, gw, gh);
						break;
					default:
						/* TODO: free movement */
						break;
				}
			}
		}
	}

	/* add the world and a camera */
	TLORM.QuickEntity.World(game, "World", "#AAACCA", gx, gy, gw, gh);
	return TLORM.QuickEntity.Camera(game, "Camera1", 0, 0, cw, ch, 0, 0 );
};