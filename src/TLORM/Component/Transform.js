

TLORM.Component.Transform = function(dx, dy, dw, dh, x, y, w ,h) {
	return {
		type: 'Transform',
		system: 'Transformation',
		dx: dx,
		dy: dy,
		dw: dw,
		dh: dh,
		x: x,
		y: y,
		w: w,
		h: h
	};
};