

TLORM.Component.TubeRowContainer = function(rows, end, colours) {
	return {
		type: 'TubeRowContainer',
		rows: rows,
		colours: colours,
		positions: [],
		end: end,
		rows_being_flipped: 0,
		moves: 0,
		fills: 0,
		filling: {},
		swap: TLORM.Component._TubeRowContainer.swap,
		calculatePositions: TLORM.Component._TubeRowContainer.calculatePositions,
		getPosition: TLORM.Component._TubeRowContainer.getPosition,
		init: function(game) {
			this.calculatePositions();
		}
	};
};

/* functions to move the rows */
TLORM.Component._TubeRowContainer = {};
TLORM.Component._TubeRowContainer.swap = function(a, b) {
	var tmp = this.rows[a];
	this.rows[a] = this.rows[b];
	this.rows[b] = tmp;
};
TLORM.Component._TubeRowContainer.getPosition = function(row, col) {
	if (row < 0) {
		row = this.positions.length + row;
	}
	return this.positions[row][col];
};
TLORM.Component._TubeRowContainer.calculatePositions = function() {
	/* starting positions */
	var starting_positions = [];
	var tube_row = this.rows[0].getComponentByType('TubeRow');
	for (var i=0; i<tube_row.cols; ++i) {
		starting_positions.push(i);
	}
	var positions = [starting_positions];
	var current_position = starting_positions;
	for (var i=0; i<this.rows.length; ++i) {
		var next_position = [];
		var tube_row = this.rows[i].getComponentByType('TubeRow');
		for (var j=0; j<tube_row.mapping.length; ++j) {
			next_position[tube_row.mapping[j]] = current_position[j];
		}
		positions.push(next_position);
		current_position = next_position;
	}
	
	this.positions = positions;
	
	for (var i=0; i<this.end.length; ++i) {
		if (this.getPosition(-1, i) == this.end[i]) {
			this.filling[i] = true;
		} else {
			this.filling[i] = false;
		}
	}
};