

TLORM.Component.Position = function(x, y, z, w, h, d) {
	return {
		type: 'Position',
		point: new TLORM.Math.Point(x, y, z),
		w: w,
		h: h,
		d: d
	};
};