

/* system to cleanup entity that are destroyed or leave the defined area */
TLORM.System.CleanUp = function(x, y, w, h) {
	return {
		type: 'CleanUp',
		x: x,
		y: y,
		w: w,
		h: h,
		update: function(game) {
			
			/* get list of all entities */
			var entities = game.entity_manager.getEntities();
			
			/* Check if each entity has left the defined area */
			for (var i=0; i<entities.length; ++i) {
				var entity = entities[i];
				if (this.leftArea(entity)) {
					game.entity_manager.removeEntity(entity);
				}
			}
			
			/* if there are no more enemies then game is over */
			var enemies = game.entity_manager.getEntitiesByType('AI');
			if (enemies.length === 0) {
				game.gameOver(true);
			}
		},
		leftArea: function(entity) {
			/* TODO: use grid to determine if left screen */
			return false;
			if (   entity.x + entity.w < this.x || this.x + this.w < entity.x
				|| entity.y + entity.h < this.y || this.y + this.h < entity.y
			) {
				return true;
			} else {
				return false;
			}
		}
	}
};