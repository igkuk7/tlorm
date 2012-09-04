

TLORM.Component.Texture = function(src) {
	return {
		type: 'Texture',
		src: src,
		img: null,
		canvas: null,
		init: function(game) {
			this.img = game.resource_manager.addImage(this.src);
			this.canvas = document.createElement('canvas');
		}
	};
};