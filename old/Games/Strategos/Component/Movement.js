

TLORM.Component.Movement = function(x, y, s, incremental) {
	
	return {
		type: 'Movement',
		x: x,
		y: y,
		s: s,
		incremental: incremental || false,
		prev_x: null,
		prev_y: null
	};
};