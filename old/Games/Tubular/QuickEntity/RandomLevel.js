

TLORM.QuickEntity.RandomLevelSolution = {};
TLORM.QuickEntity.RandomLevel = function(game,x, y, w, h, rows, cols, seed) {
	/* generate random mappings */
	var default_mapping = [];
	for (var j=0; j<cols; j++) {
		default_mapping.push(j);
	}
	var tube_rows = [];
	for (var i=0; i<rows; i++) {
		var mapping = default_mapping.slice();
		mapping.sort(function() { return 0.5 - Math.random(); });
		tube_rows.push(TLORM.QuickEntity.TubeRow(game, "Row"+(i+1), x, (h/2)+y+i*h, w*cols, h, cols, mapping, (Math.random() < 0)));
	}
	
	/* setup the container */
	var container_entity = TLORM.QuickEntity.TubeRowContainer(game, "RandomLevel", "RowContainer", x, y, w*cols, h*(rows+1), tube_rows, []);
	var container = container_entity.getComponentByType('TubeRowContainer');
	
	/* calculate positions to get a valid end configuration from the default position */
	container.calculatePositions();
	container.end = container.positions[rows].slice();
	
	/* mix up the rows */
	TLORM.QuickEntity.RandomLevelSolution = {};
	var mixes = Math.floor(rows*cols/2);
	for (var i=0; i<mixes; ++i) {
		var action = (Math.random() < 0.5 ? 'V' : 'H');
		var row = Math.floor(Math.random()*rows);
		var move = action+(row+1);
		if (TLORM.QuickEntity.RandomLevelSolution[move]) { continue; }
		var tube_row = tube_rows[row].getComponentByType('TubeRow');
		if (tube_row.fixed) { continue; }
		switch (action) {
			case 'V':
				tube_row.flipVertical();
				break;
			case 'H':
				tube_row.flipHorizontal();
				break;
			default:
				break;
		}
		TLORM.QuickEntity.RandomLevelSolution[move] = true;
	}
	container.calculatePositions();
	console.log(TLORM.QuickEntity.RandomLevelSolution);
	
	for (var i=0; i<container.end.length; ++i) {
		if (container.getPosition(-1, i) == container.end[i]) {
			container.filling[i] = true;
		} else {
			container.filling[i] = false;
		}
	}
	
	return container_entity;
};
