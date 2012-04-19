

/* system to handle all movement */
TLORM.System.Movement = function() {
	return {
		type: 'Movement',
		update: function(game) {
			
			var grid = game.entity_manager.getEntitiesByType('Grid')[0];
			var grid_data = grid.getComponentByType('Grid'); 
			
			/* get entities to check for collisions */
			var physic_entities = game.entity_manager.getEntitiesByType('Physics');
			
			/* do any path movements */
			var entities = game.entity_manager.getEntitiesByType('MovementPath');
			for (var i=0; i<entities.length; ++i) {
				var entity = entities[i];
				var path = entity.getComponentByType('MovementPath');
				if (path) {
				
					/* first time round calculate the path */
					if (path.current_step === -1) {
						var steps = [];
						if (path.via) {
							var path_to_via  = this.find_shortest_path(game, grid_data, { x: entity.x, y: entity.y }, path.via, path.distance);
							var path_to_dest = this.find_shortest_path(game, grid_data,  path.via, path.destination, path.distance);
							steps = path_to_via.concat(path_to_dest.slice(1));
						} else {
							steps = this.find_shortest_path(game, grid_data, { x: entity.x, y: entity.y }, path.destination, path.distance);
						}
						
						path.steps = steps;
						path.current_step = 0;
						
						continue;
					}
					
					/* get next position */
					if (path.current_step_delay++ === path.step_delay) {
						path.current_step_delay = 0;
						if (path.steps[path.current_step]) {
							var old_x = entity.x;
							var old_y = entity.y;
							
							/* move the entity and check for collissions */
							entity.x = path.steps[path.current_step].x;
							entity.y = path.steps[path.current_step].y;
							var collides_with = this.checkForCollisions(entity, physic_entities);
							if (collides_with) {
								/* collides, stop here */
								entity.x = old_x;
								entity.y = old_y;
								path.steps.splice(path.current_step, path.steps.length-path.current_step);
							} else {
								/* no collision, continue on path */
								++path.current_step;
							}
						} else {
							path.current_step = 1;
							path.steps = [];
							game.entity_manager.removeEntityComponent(entity, path);
						}
					}
				}
			}
			
			
			/* find all entities and move them on the grid as required */
			var entities = game.entity_manager.getEntitiesByType('Movement');
			for (var i=0; i<entities.length; ++i) {
				var entity = entities[i];
				var movement = entity.getComponentByType('Movement');
				if (movement) {
					var stop_x = false;
					var stop_y = false;
					if (movement.incremental) {
						movement.prev_x = entity.x;
						movement.prev_y = entity.y;
						entity.x += movement.x;
						entity.y += movement.y;
						stop_x = stop_y = true;
					} else {
						if (entity.x < movement.x) {
							movement.prev_x = entity.x;
							entity.x += movement.s;
							if (entity.x >= movement.x) {
								stop_x = true;
								entity.x = movement.x;
							}
						} else if (entity.x > movement.x) {
							movement.prev_x = entity.x;
							entity.x -= movement.s;
							if (entity.x <= movement.x) {
								stop_x = true;
								entity.x = movement.x;
							}
						} else {
							stop_x = true;
						}
						if (entity.y < movement.y) {
							movement.prev_y = entity.y;
							entity.y += movement.s;
							if (entity.y >= movement.y) {
								stop_y = true;
								entity.y = movement.y;
							}
						} else if (entity.y > movement.y) {
							movement.prev_y = entity.y;
							entity.y -= movement.s;
							if (entity.y <= movement.y) {
								stop_y = true;
								entity.y = movement.y;
							}
						} else {
							stop_y = true;
						}
					}
					
					if (stop_x && stop_y) {
						game.entity_manager.removeEntityComponent(entity, movement);
					}
				}
			}
		},
		find_shortest_path: function(game, grid, start, end, distance) {
			var open_list = [];
			var open_list_by_pos = {};
			var closed_list = [];
			var closed_list_by_pos = {};
			var pos = { x: start.x, y: start.y, F: 0, G: 0, H: 0, parent: null };
			open_list.push(pos);
			open_list_by_pos[pos.x+","+pos.y] = pos;
			
			var found_end = false;
			while (open_list.length > 0) {
				open_list.sort(function (a,b) { return (b.F || 0) - (a.F || 0); } );
				
				pos = open_list.pop();
				closed_list.push(pos);
				closed_list_by_pos[pos.x+","+pos.y] = pos;
				
				if (pos.x === end.x && pos.y === end.y) {
					found_end = true;
					break;
				}
				
				var cells = this.get_adjacent_cells(game, grid, pos);
				for (var i = 0; i < cells.length; i++) {
					var cell = cells[i];
					if (!closed_list_by_pos[cell.x+","+cell.y]) {
						var travel_cost = ( pos.x != cell.x && pos.y != cell.y ? 14 : 10 );
						if (cell.x === end.x && cell.y === end.y) {
							travel_cost = 0;
						}
						
						if (!open_list_by_pos[cell.x+","+cell.y]) {
							cell.parent = pos;
							cell.G = travel_cost + pos.G;
							cell.H = ( Math.abs( end.x - cell.x ) + Math.abs( end.y - cell.y ) ) * 10;
							cell.F = cell.G + cell.H;
							open_list.push(cell);
							open_list_by_pos[cell.x+","+cell.y] = cell;
						} else {
							cell = open_list_by_pos[cell.x+","+cell.y];
							var G = travel_cost + pos.G;
							if (G < cell.G) {
								cell.G = G;
								cell.H = ( Math.abs( cell.x - start.x ) + Math.abs( cell.y - start.y ) ) * 10;
								cell.F = cell.G + cell.H;
								cell.parent = pos;
							}
						}
					}
				}
			}
			
			/* find the optimum path */
			if (found_end) {
				var shortest_path = [];
				pos = end;
				while (pos.x != start.x || pos.y != start.y) {
					shortest_path.unshift(pos);
					pos = closed_list_by_pos[pos.x+","+pos.y].parent;
				}
				
				return shortest_path;
			}
			
			/* no path */
			if (distance > 0) {
				for (var d=1; d<=distance; d++) {
					var destinations = [
						{ x: end.x+d, y: end.y },
						{ x: end.x,   y: end.y+d },
						{ x: end.x-d, y: end.y },
						{ x: end.x,   y: end.y-d },
					];
					for (var i=0; i<destinations.length; ++i) {
						var path = this.find_shortest_path(game, grid, start, destinations[i], 0);
						if (path.length > 0) {
							return path;
						}
					}
				}
			}
			return [];
		},
		get_adjacent_cells: function(game, grid, pos) {
			
			/* possible movement cells */
			var cells = [
				{ x: pos.x-1, y: pos.y },
				{ x: pos.x,   y: pos.y-1 },
				{ x: pos.x+1, y: pos.y },
				{ x: pos.x,   y: pos.y+1 }
			];
			
			/* check they are moveable */
			var available_cells = [];
			for (var i=0; i<cells.length; ++i) {
				if (cells[i].x < 0 || grid.w <= cells[i].x || cells[i].y < 0 || grid.h <= cells[i].y) {
					continue;
				}
				
				var cell_ok = true;
				var entities = game.entity_manager.getEntitiesByPosition(cells[i].x, cells[i].y);
				for (var j=0; j<entities.length; ++j) {
					var entity = entities[j];
					var cell = entity.getComponentByType('Cell');
					if (cell) {
						var physics = entity.getComponentByType('Physics');
						if (physics && physics.can_collide) {
							/* not allowed, skip this cell */
							cell_ok = false;
							continue;
						}
					}
				}
				if (cell_ok) {
					available_cells.push(cells[i]);
				}
			}
			
			return available_cells;
		},
		collides: function(entity_a, entity_b) {
			var physics_a = entity_a.getComponentByType('Physics');
			var physics_b = entity_b.getComponentByType('Physics');
			if ( ( ( physics_a && physics_a.can_collide ) || ( physics_b && physics_b.can_collide ) )
			     && entity_a.x === entity_b.x && entity_a.y === entity_b.y
			 ) {
				return true;
			}
			
			return false;
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