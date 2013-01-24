

TLORM.System.Animation = function(component_types) {
	return {
		type: 'Animation',
		update: function(game) {
			
			var entities = this.getAnimations(game);
			for (var i=0; i<entities.length; ++i) {
				var entity = entities[i];
				var animation = entity.getComponentByType('Animation');
				
				if (animation.step == 0) {
					animation.on_start(animation);
					++animation.step;
				} else if (animation.step >= animation.steps) {
					animation.on_end(animation);
					game.entity_manager.removeEntityComponent(entity, animation);
				} else {
					animation.on_step(animation, animation.step);
					++animation.step;
				}
			}
		},
		getAnimations: function(game) {
			return game.entity_manager.getEntitiesByType('Animation');
		}
	};
};