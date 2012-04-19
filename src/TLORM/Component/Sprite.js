

TLORM.Component.Sprite = function(src, x, y, w, h, dx, dy, dw, dh) {
	return {
		type: 'Sprite',
		src: src,
		x: x,
		y: y,
		w: w,
		h: h,
		dx: dx,
		dy: dy,
		dw: dw,
		dh: dh,
		img: null,
		init: function(game) {
			this.img = game.resource_manager.addImage(this.src);
		}
	};
};