

TLORM.Component.Image = function(src, x, y, w, h) {
	return {
		type: 'Image',
		src: src,
		x: x,
		y: y,
		w: w,
		h: h,
		img: null,
		init: function(game) {
			this.img = game.resource_manager.addImage(this.src);
		}
	};
};