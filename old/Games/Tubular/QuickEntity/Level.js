
TLORM.QuickEntity.Level = function(game, level_file, x, y, w, h) {
	var level = game.resource_manager.loadFile(level_file);
	var lines = level.split("\n");
	var cols = 0;
	var rows = 0;
	var tube_rows = [];
	var end = [];
	var mixes = [];
	for (var i=0; i<lines.length; i++) {
		var line = lines[i];
		if (line.indexOf("=") === -1) {
			var fixed = false;
			var line_length = line.length;
			if (line.substr(line_length-1,1) === 'F') {
				fixed = true;
				--line_length;
			}
			if (line_length > cols) { cols = line_length; }
			var mapping = [];
			for (var j=0; j<line_length; j++) {
				mapping.push(line.substr(j,1)-1);
			}
			tube_rows.push(TLORM.QuickEntity.TubeRow(game, "Row"+(i+1), x, (h/2)+y+i*h, w*cols, h, cols, mapping, fixed));
		} else if (line.indexOf("E=") != -1) {
			var end_line = line.substr(2);
			for (var j=0; j<end_line.length; j++) {
				end.push(end_line.substr(j,1)-1);
			}
		} else if (line.indexOf("M=") != -1) {
			var mix_line = line.substr(2);
			mixes = mix_line.split(',');
		}
	}
	rows = tube_rows.length;
	
	/* mix up the rows */
	for (var i=0; i<mixes.length; ++i) {
		var action = mixes[i].substr(0,1);
		var row = mixes[i].substr(1,1) - 1;
		switch (action) {
			case 'V':
				tube_rows[row].getComponentByType('TubeRow').flipVertical();
				break;
			case 'H':
				tube_rows[row].getComponentByType('TubeRow').flipHorizontal();
				break;
			default:
				break;
		}
	}
	
	/* 1 extra row for the desired end */
	return TLORM.QuickEntity.TubeRowContainer(game, level_file, "RowContainer", x, y, w*cols, h*(rows+1), tube_rows, end);
};