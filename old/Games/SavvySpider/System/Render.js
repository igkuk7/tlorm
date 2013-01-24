

/* system to render everything */
TLORM.System.Render = function(context, w, h) {
	return {
		type: 'Render',
		context: context,
		w: w,
		h: h,
		update: function(game) {
			
			/* clear everything */
			this.context.clearRect(0, 0, this.w, this.h);
			
			/* render entities */
			var entities = this.getEntities(game);
			for (var i=0; i<entities.length; ++i) {
				this.renderEntity(entities[i]);
			}
		},
		renderEntity: function(entity) {
			var render = entity.getComponentByType('Render');
			this.context.fillStyle = render.fill_colour;
			this.context.fillRect(entity.x, entity.y, entity.w, entity.h);
		},
		getEntities: function(game) {
			return game.entity_manager.getEntitiesByType('Render');
		}
	};
};
