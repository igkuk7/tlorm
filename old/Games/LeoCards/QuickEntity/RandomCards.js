
TLORM.QuickEntity.RandomCards = function(game, name, cw, ch, sw, sh, colours) {
	
	/* calculate number of cards for given colours */
	var cards = colours.length * 2;
	var cols = largest_factor(cards);
	var rows = cards / cols;
	
	var colours_pool = colours.concat(colours);
	colours_pool.sort(function() { return 0.5 - Math.random(); });
	
	for (var i=0; i<cols; ++i) {
		for (var j=0; j<rows; ++j) {
			var x = sw+(cw+sw)*i;
			var y = sh+(ch+sh)*j;
			var details = colours_pool.pop();
			TLORM.QuickEntity.Card(game, "", "#CCC", details.colour, details.value, x, y, cw, ch);
		}
	}
	
	return { w: (cols+1) * (cw+sw), h: (rows+1) * (ch+sh) };
};

function largest_factor(num) {
	var factor = 1;
	var diff   = num - factor;
	for (var i=Math.floor(num/2); i > 0; --i) {
		var j = num / i;
		if ( j % 1 == 0 ) {
			var tmp_diff = Math.abs(i - j);
			if (tmp_diff < diff) {
				factor = i;
				diff  = tmp_diff;
			}
		}
	}
	return factor;
}
