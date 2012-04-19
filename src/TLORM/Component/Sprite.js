

TLORM.Component.Sprite = function(src, x, y, w, h, dx, dy, dw, dh) {
	return {
		type: 'Sprite',
		src: src,
		x: x,
		y: y,
		w: w,
		h: h,
		dx: dx || 1,
		dy: dy || 1,
		dw: dw || 1,
		dh: dh || 1,
		img: null,
		init: function(game) {
			this.img = game.resource_manager.addImage(this.src);
		}
	};
};
