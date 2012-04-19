

TLORM.System.Transformation = function(component_types) {
	return {
		type: 'Transformation',
		update: function(game) {
			
			var entities = this.getTransforms(game);
			for (var i=0; i<entities.length; ++i) {
				var entity = entities[i];
				var transform = entity.getComponentByType('Transform');
				
				if (transform.dx != null) {
					entity.x += transform.dx;
				}
				if (transform.dy != null) {
					entity.y += transform.dy;
				}
				if (transform.x != null) {
					entity.x = transform.x;
				}
				if (transform.y != null) {
					entity.y = transform.y;
				}
				if (transform.dw != null) {
					entity.w += transform.dw;
				}
				if (transform.dh != null) {
					entity.h += transform.dh;
				}
				if (transform.w != null) {
					entity.w = transform.w;
				}
				if (transform.h != null) {
					entity.h = transform.h;
				}
				
				game.entity_manager.removeEntityComponent(entity, transform);
			}
		},
		getTransforms: function(game) {
			return game.entity_manager.getEntitiesByType('Transform');
		}
	};
};