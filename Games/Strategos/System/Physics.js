

/* system to perform an physics logic, e.g. collisions */
TLORM.System.Physics = function(context) {
	return {
		type: 'Physics',
		context: context,
		update: function(game) {
			
			/* find entities that have physics */
			var entities = game.entity_manager.getEntitiesByType('Physics');
			
			/* check for collisions between entities */
			var checked = {};
			for (var i=0; i<entities.length; ++i) {
				var entity_a = entities[i];
				var entity_b;
				while (entity_b = this.checkForCollisions(entity_a, entities)) {
					var physics_a = entity_a.getComponentByType('Physics');
					var physics_b = entity_b.getComponentByType('Physics');
					
					if (physics_a && physics_a.can_collide && physics_b && physics_b.can_collide) {

						/* if moving on a path, move each moving object back to previous point and truncate path */
						var path_a = entity_a.getComponentByType('MovementPath');
						var path_b = entity_b.getComponentByType('MovementPath');
						if (path_a) {
							path_a.steps.splice(path_a.current_step, path_a.steps.length-path_a.current_step);
						}
						if (path_b) {
							path_b.steps.splice(path_b.current_step, path_b.steps.length-path_b.current_step);
						}
						
						/* move each back along their paths until they don't collide */
						var moved = false;
						for (var i=1; i<20; ++i) {
							if (path_a) {
								var step = path_a.current_step-i;
								if (step >= 0) {
									entity_a.x = path_a.steps[step].x;
									entity_a.y = path_a.steps[step].y;
								}
							}
							if (!this.checkForCollisions(entity_a, entities)) {
								moved = true;
								break;
							}
							if (path_b) {
								var step = path_b.current_step-i;
								if (step >= 0) {
									entity_b.x = path_b.steps[step].x;
									entity_b.y = path_b.steps[step].y;
								}
							}
							if (!this.checkForCollisions(entity_b, entities)) {
								moved = true;
								break;
							}
						}
						
						if (!moved) { "Unable to avoid collision"; }
						
						continue;
						
						/* for now just stop any movement */
						var movement_a = entity_a.getComponentByType('Movement');
						var movement_b = entity_b.getComponentByType('Movement');
						if (movement_a) {
							game.entity_manager.removeEntityComponent(entity_a, movement_a);
						}
						if (movement_b) {
							game.entity_manager.removeEntityComponent(entity_b, movement_b);
						}
						
						/* make sure they don't overlap */
						this.avoidOverlaps(entity_a, entity_b, entities);
					}
				}
			}
		},
		collides: function(entity_a, entity_b) {
			if ( entity_a.x === entity_b.x && entity_a.y === entity_b.y ) {
				return true;
			}
			
			return false;
		},
		avoidOverlaps: function(entity_a, entity_b, entities) {
			var physics_a = entity_a.getComponentByType('Physics');
			var physics_b = entity_b.getComponentByType('Physics');
			var movement_a = entity_a.getComponentByType('Movement');
			var movement_b = entity_b.getComponentByType('Movement');
			
			var moving_entity = ( (movement_a || physics_a.can_move) ? entity_a : entity_b );
			var static_entity = ( moving_entity === entity_a          ? entity_b : entity_a );

			/* move to nearest edge that doesn't cause another collision */
			var x1_diff = (static_entity.x - moving_entity.x);
			var x2_diff = (moving_entity.x - static_entity.x);
			var y1_diff = (static_entity.y - moving_entity.y);
			var y2_diff = (moving_entity.y - static_entity.y);
			
			/* create list of preferred changes */
			var preferred = [x1_diff, x2_diff, y1_diff, y2_diff];
			preferred.sort();
			
			var moved = false;
			for (var i=0; i<preferred.length; ++i) {
				var original_x = moving_entity.x;
				var original_y = moving_entity.y;
				
				/* move accordingly */
				switch (preferred[i]) {
					case x1_diff:
						moving_entity.x = static_entity.x + 1;
						break;
					case x2_diff:
						moving_entity.x = static_entity.x - 1;
						break;
					case y1_diff:
						moving_entity.y = static_entity.y + 1;
						break;
					case y2_diff:
						moving_entity.y = static_entity.y - 1;
						break;
					default:
						break;
				}
				
				/* check for collision */
				var colliding_entity = this.checkForCollisions(moving_entity, entities);
				if (colliding_entity) {
					moving_entity.x = original_x;
					moving_entity.y = original_y;
				} else {
					moved = true;
					break;
				}
			}
			
			if (!moved) {
				throw "Fatal Error: Unable to avoid overlap";
			}
		},
		checkForCollisions: function(entity, entities) {
			for (var i=0; i<entities.length; ++i) {
				if (entities[i] === entity) continue;
				
				if (this.collides(entity, entities[i])) {
					return entities[i];
				}
			}
			return null;
		}
	};
};