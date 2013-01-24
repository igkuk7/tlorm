

TLORM.System.Collision = function() {
	return {
		type: 'Collision',
		update: function(game) {
			
			/* iterate over all entities which detect collision
			 * check for collisions
			 * trigger callback
			 */
			var detection_entities = this.getCollisionDetections(game);
			var collidable_entities = this.getCollidables(game);
			for (var i=0; i<detection_entities.length; ++i) {
				var detection = detection_entities[i].getComponentByType('CollisionDetection');
				for (var j=0; j<collidable_entities.length; ++j) {
					if (   detection_entities[i] != collidable_entities[j]
					    && this.collides(detection_entities[i], collidable_entities[j])
					) {
						detection.callback.call(detection,
							collidable_entities[j],
							detection_entities[i].direction()
						);
					}
				}
			}
		},
		getCollidables: function(game) {
			return game.entity_manager.getEntitiesByType('Collidable');
		},
		getCollisionDetections: function(game) {
			return game.entity_manager.getEntitiesByType('CollisionDetection');
		},
		collides: function(entity_a, entity_b) {
			var colliable_a = entity_a.getComponentByType('Collidable');
			var colliable_b = entity_b.getComponentByType('Collidable');
			if (!colliable_a && !colliable_b) {
				return false;
			}
			
			/* check if either is set to ignore */
			if (colliable_a.ignoreGroup(colliable_b.group) || colliable_b.ignoreGroup(colliable_a.group)) {
				return false;
			}
			
			var position_a = entity_a.getComponentByType('Position');
			var position_b = entity_b.getComponentByType('Position');
			
			/* check for collision */
			if (   position_a.point.x                <= position_b.point.x + position_b.w
			    && position_b.point.x                <= position_a.point.x + position_a.w
			    && position_a.point.y                <= position_b.point.y + position_b.h
			    && position_b.point.y                <= position_a.point.y + position_a.h
			    && position_a.point.z                <= position_b.point.z + position_b.d
			    && position_b.point.z                <= position_a.point.z + position_a.d
			) {
				return true;
			}
			
			return false;
		},
	};
};