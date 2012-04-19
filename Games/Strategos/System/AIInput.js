

/* system to generate AI input for various components */
TLORM.System.AIInput = function() {
	var delay = 30;
	var path_step_delay = 5;
	return {
		type: 'AIInput',
		update: function(game) {
			var grid = game.entity_manager.getEntitiesByType('Grid')[0];
			var grid_data = grid.getComponentByType('Grid'); 
			
			/* get list of controllable entities */
			var entities = game.entity_manager.getEntitiesByType('AI');
			
			/* adjust each entity according to its AI */
			for (var i=0; i<entities.length; ++i) {
				var entity = entities[i];
				
				/* move them to a random location, if not already moving */
				var movement = entity.getComponentByType('MovementPath');
				if (!movement) {
					var ai = entity.getComponentByType('AI');
					if (ai.current_delay <= delay) {
						ai.current_delay += Math.random();
						continue;
					}
					ai.current_delay = 0;
					if (ai.ai_type === "Aggressive") {
						if (Math.random() < 0.5) {
							var enemy = this.findNearestEnemy(game, entity, ai);
							if (enemy) {
								this.moveToEnemy(game, entity, ai, enemy);
							}
						} else {
							this.randomMovement(game, entity, ai, grid_data);
						}
					} else {
						this.randomMovement(game, entity, ai, grid_data);
					}
				}
			}
		},
		findNearestEnemy: function(game, entity, ai) {
			var enemies = game.entity_manager.getEntitiesByType('Combat');
			var combat = entity.getComponentByType('Combat');
			var nearest = null;
			var nearest_dist = 999999;
			var nearest_surrounded = 0;
			for (var i=0; i<enemies.length; ++i) {
				var enemy = enemies[i];
				var enemy_combat = enemy.getComponentByType('Combat');
				if (combat.code === enemy_combat.code) { continue; }
				
				var dx = entity.x-enemy.x;
				var dy = entity.y-enemy.y;
				var dist = Math.sqrt(dx*dx + dy*dy);
				
				if (ai.vision < dist) { continue; }
				
				/* get surrounding entities, remove any with same combat */
				var surrounded = this.getSurroundingCells(game, enemy);
				var offensive_surrounded = [];
				for (var j=0; j<surrounded.length; ++j) {
					var surrounded_combat = surrounded[j].getComponentByType('Combat');
					if (!surrounded_combat || ( surrounded_combat.code != enemy_combat.code && surrounded_combat.code === combat.code ) ) {
						offensive_surrounded.push(surrounded);
					}
				}
				
				if (nearest === null) {
					nearest = enemy;
					nearest_dist = dist;
					nearest_surrounded = offensive_surrounded.length;
				} else if (     offensive_surrounded.length > nearest_surrounded
						   || ( offensive_surrounded.length === nearest_surrounded && dist < nearest_dist ) ) {
					nearest = enemy;
					nearest_dist = dist;
					nearest_surrounded = offensive_surrounded.length;
				}
			}
			
			/* ignore if next to player */
			if (nearest_dist === 1) {
				nearest = null;
			}
			
			return nearest;
		},
		moveToEnemy: function(game, entity, ai, enemy) {
			game.entity_manager.addEntityComponent(entity, TLORM.Component.MovementPath({ x: enemy.x, y: enemy.y }, null, 3, path_step_delay));
		},
		randomMovement: function(game, entity, ai, grid_data) {
			
			/* generate a random path */
			var pos = null;
			var good_pos = false;
			while (!good_pos) {
				pos = { x: Math.floor(Math.random()*grid_data.w) , y: Math.floor(Math.random()*grid_data.h) };
				good_pos = true;
				var pos_entities = game.entity_manager.getEntitiesByPosition(pos.x, pos.y);
				for (var i=0; i<pos_entities.length; i++) {
					var pos_entity = pos_entities[i];
					var cell = pos_entity.getComponentByType('Cell');
					if (cell) {
						var physics = pos_entity.getComponentByType('Physics');
						if (physics  && physics.can_collide) {
							good_pos = false;
						}
					}
				}
			}
			game.entity_manager.addEntityComponent(entity, TLORM.Component.MovementPath(pos, null, 1, path_step_delay));
		},
		getSurroundingCells: function(game, enemy) {
			
			/* possible cells */
			var cells = [
				{ x: enemy.x-1, y: enemy.y },
				{ x: enemy.x,   y: enemy.y-1 },
				{ x: enemy.x+1, y: enemy.y },
				{ x: enemy.x,   y: enemy.y+1 }
			];
			
			/* check they are occupied */
			var available_cells = [];
			for (var i=0; i<cells.length; ++i) {
				var entities = game.entity_manager.getEntitiesByPosition(cells[i].x, cells[i].y);
				for (var j=0; j<entities.length; ++j) {
					var entity = entities[j];
					var cell = entity.getComponentByType('Cell');
					if (cell) {
						var physics = entity.getComponentByType('Physics');
						if (physics && physics.can_collide) {
							available_cells.push(entity);
						}
					}
				}
			}
			
			return available_cells;
		}
	};
};