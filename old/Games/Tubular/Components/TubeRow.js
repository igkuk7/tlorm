

TLORM.Component.TubeRow = function(cols, mapping, fixed) {
	return {
		type: 'TubeRow',
		cols: cols,
		mapping: mapping,
		fixed: fixed || false,
		tube_clicked: null,
		flipHorizontal: TLORM.Component._TubeRow.flipHorizontal,
		flipVertical: TLORM.Component._TubeRow.flipVertical,
		swapTubeEnds: TLORM.Component._TubeRow.swapTubeEnds,
		swapTubeStarts: TLORM.Component._TubeRow.swapTubeStarts
	};
};

/* functions to translate the mappings */
TLORM.Component._TubeRow = {};
TLORM.Component._TubeRow.flipHorizontal = function() {
	/* simply reverse the mapping order */
	var new_mapping = [];
	for (var i=0; i<this.cols; ++i) {
		new_mapping[i] = (this.cols-1)-this.mapping[this.cols-1-i];
	}
	this.mapping = new_mapping;
};
TLORM.Component._TubeRow.flipVertical = function() {
	/* simply slip the mapping */
	var new_mapping = [];
	for (var i=0; i<this.cols; ++i) {
		new_mapping[this.mapping[i]] = i;
	}
	this.mapping = new_mapping;
};
TLORM.Component._TubeRow.swapTubeStarts = function(a, b) {
	var tmp = this.mapping[a];
	this.mapping[a] = this.mapping[b];
	this.mapping[b] = tmp;
};
TLORM.Component._TubeRow.swapTubeEnds = function(a, b) {
	var start_a = -1;
	var start_b = -1;
	for (var i=0; i<this.cols; ++i) {
		if (this.mapping[i] == a) {
			start_a = i;
		}
		if (this.mapping[i] == b) {
			start_b = i;
		}
	}
	this.swapTubeStarts(start_a, start_b);
};