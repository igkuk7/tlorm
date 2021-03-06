
TLORM.QuickEntity.Grass = function(game, name, x, y, w, h) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Cell(),
			TLORM.Component.Render(1),
			TLORM.Component.Sprite("../../img/set_0.gif", 64, 192, 16, 16, 0, 0, 1, 1)
		], x, y, w, h)
	);
};
TLORM.QuickEntity.Camera = function(game, name, x, y, w, h, offset_x, offset_y) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Camera(offset_x, offset_y)
		], x, y, w, h)
	);
};
TLORM.QuickEntity.Player = function(game, name, x, y, w, h) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Cell(),
			TLORM.Component.Combat(1),
			TLORM.Component.Render(3,null, null, 0.75),
			TLORM.Component.Sprite("../../img/horsey_black.png", 0, 0, 288, 562, 0.18, -0.75, 1, 1.5),
			TLORM.Component.UserControllable(),
			//TLORM.Component.AI("Aggressive"),
			TLORM.Component.Physics(true, true)
		], x, y, w, h)
	);
};
TLORM.QuickEntity.Enemy = function(game, name, x, y, w, h, ai_type) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Cell(),
			TLORM.Component.Combat(2),
			TLORM.Component.Render(2),
			TLORM.Component.Sprite("../../img/horsey_white.png", 0, 0, 288, 562, 0.18, -0.75, 1, 1.5),
			TLORM.Component.AI(ai_type),
			TLORM.Component.Physics(true, true)
		], x, y, w, h)
	);
};
TLORM.QuickEntity.Wall = function(game, name, x, y, w, h) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Cell(),
			TLORM.Component.Render(1),
			TLORM.Component.Sprite("../../img/set_0.gif", 192, 192, 16, 16, 0, 0, 1, 1),
			TLORM.Component.Physics(true, false)
		], x, y, w, h)
	);
};
TLORM.QuickEntity.Level = function(game, level_file, name, colour, gw, gh, cw, ch) {
	var level = game.resource_manager.loadFile(level_file);
	var lines = level.split("\n");
	var gx = null;
	var gy = lines.length;
	var enemy_count = 0;
	var player_count = 0;
	for (var i=0; i<lines.length; i++) {
		var line = lines[i].split("|");
		if (line.length > gx) { gx = line.length; }
		for (var j=0; j<line.length; j++) {
			var cells = line[j].split(',');
			for (var k=0; k<cells.length; k++) {
				/* set the cells */
				switch (cells[k]) {
					case 'B':
						TLORM.QuickEntity.Wall(game, "Wall-"+j+"-"+i, j, i, gw, gh);
						break;
					case 'E':
						TLORM.QuickEntity.Grass(game, "Grass-"+j+"-"+i, j, i, gw, gh);
						TLORM.QuickEntity.Enemy(game, "Enemy"+(++enemy_count), j, i, gw, gh);
						break;
					case 'A':
						TLORM.QuickEntity.Grass(game, "Grass-"+j+"-"+i, j, i, gw, gh);
						TLORM.QuickEntity.Enemy(game, "Enemy"+(++enemy_count), j, i, gw, gh, 'Aggressive');
						break;
					case 'P':
						TLORM.QuickEntity.Grass(game, "Grass-"+j+"-"+i, j, i, gw, gh);
						TLORM.QuickEntity.Player(game, "Player"+(++player_count),  j, i, gw, gh);
						break;
					case ' ':
						TLORM.QuickEntity.Grass(game, "Grass-"+j+"-"+i, j, i, gw, gh);
						break;
					default:
						/* TODO: free movement */
						break;
				}
			}
		}
	}

	/* add the world and a camera */
	TLORM.QuickEntity.World(game, "World", "#AAACCA", gx, gy, gw, gh);
	return TLORM.QuickEntity.Camera(game, "Camera1", 0, 0, cw, ch, 0, 0 );
};
TLORM.QuickEntity.World = function(game, name, colour, gx, gy, gw, gh) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			//TLORM.Component.Render(colour),
			TLORM.Component.Grid(gx, gy, gw, gh)
		], 0, 0, gx*gw, gy*gh)
	);
};

/* system to map user input to the various components */
TLORM.System.UserInput = function() {
	return {
		type: 'UserInput',
		touch_event: null,
		touch_event: null,
		zoom_event: null,
		move_event: null,
		up_event: null,
		current_entity: null,
		init: function(game) {
			/* register control callbacks for player */
			var system = this;
			game.registerEvent("mousedown", function(event) { system.downHandler(event); } );
			game.registerEvent("mousemove", function(event) { system.moveHandler(event); } );
			game.registerEvent("mouseup", function(event) { system.upHandler(event); } );
			game.registerEvent("mouseout", function(event) { system.outHandler(event); } );
			game.registerEvent("touch", function(event) { system.clickHandler(event); } );
			/* TODO: mobile drag event */
			game.registerEvent("mousewheel", function(event) { system.wheelHandler(event); } );
			/* TODO: mobile zoom event */
		},
		downHandler: function(event) {
			this.down_event = event;
			this.up_event = null;
		},
		moveHandler: function(event) {
			this.move_event = event;
		},
		upHandler: function(event) {
			this.up_event = event;
		},
		outHandler: function(event) {
			this.down_event = null;
			this.move_event = null;
			this.up_event = null;
		},
		clickHandler: function(event) {
			this.touch_event = event;
		},
		wheelHandler: function(event) {
			this.zoom_event = event;
		},
		update: function(game) {
			var grid = game.entity_manager.getEntitiesByType('Grid')[0];
			var grid_data = grid.getComponentByType('Grid'); 
			
			var camera = game.entity_manager.getEntitiesByType('Camera')[0];
			var camera_data = camera.getComponentByType('Camera');
			
			/* check if an what event was triggered and apply the movement as required */
			var click_pos = this.cellClicked(game, camera, camera_data, grid, grid_data);
			var drag_pos  = this.mouseDrag(game, camera, camera_data, grid, grid_data);
			var zoomed_by = this.zoomedBy(game);
			if (click_pos) {
				var entities = game.entity_manager.getEntitiesByPosition(click_pos.x, click_pos.y);
				for (var i=0; i<entities.length; ++i) {
					var entity = entities[i];
					this.setControllable(entity);
					if (this.current_entity) {
						this.moveCurrentEntity(game, entity, click_pos);
					}
				}
				this.event = null;
			} else if (drag_pos) {
				var dx = drag_pos.to.x - drag_pos.from.x;
				var dy = drag_pos.to.y - drag_pos.from.y;
				
				camera_data.offset_x += dx;
				camera_data.offset_y += dy;
			} else if (zoomed_by != 0) {
				var delta = zoomed_by*5;
				grid_data.gw += zoomed_by*5;
				grid_data.gh += zoomed_by*5;
				grid_data.scale = grid_data.gw / grid_data.default_gh;
			}
		},
		moveCurrentEntity: function(game, entity, click_pos) {
			
			/* stop any current path movement */
			var movement = this.current_entity.getComponentByType('MovementPath');
			if (movement) {
				game.entity_manager.removeEntityComponent(this.current_entity, movement);
			}
			
			/* if enemy, follow it */
			if (entity && entity.getComponentByType('AI')) {
				if (this.current_entity) {
					var path = entity.getComponentByType('MovementPath');
					if (path) {
						game.entity_manager.addEntityComponent(this.current_entity, TLORM.Component.MovementPath(path.destination, path.steps[path.current_step-1]), 1);
					} else {
						game.entity_manager.addEntityComponent(this.current_entity, TLORM.Component.MovementPath({ x: entity.x, y: entity.y }, null, 1));
					}
				}
			} else {
				/* find path to move to */
				game.entity_manager.addEntityComponent(this.current_entity, TLORM.Component.MovementPath(click_pos));
			}
		},
		setControllable: function(entity) {
			var controllable = entity.getComponentByType('UserControllable');
			if (controllable) {
				if (this.current_entity) {
					var uc = this.current_entity.getComponentByType('UserControllable');
					uc.selected = false;
				}
				this.current_entity = entity;
				uc = this.current_entity.getComponentByType('UserControllable');
				uc.selected = true;
			}
		},
		gridPosition: function(game, camera, camera_data, grid, grid_data, event) {
			/* adjust event by camera offset */
			var game_x = event.offsetX - camera_data.offset_x;
			var game_y = event.offsetY - camera_data.offset_y;
			
			/* find position in grid to move player to */
			var grid_x = Math.floor( game_x / grid_data.gw ); 
			var grid_y = Math.floor( game_y / grid_data.gh );
			return { x: grid_x, y: grid_y };
		},
		screenPosition: function(game, event) {
			/* find position in grid to move player to */
			var grid_x = Math.floor( event.offsetX ); 
			var grid_y = Math.floor( event.offsetY );
			return { x: grid_x, y: grid_y };
		},
		cellClicked: function(game, camera, camera_data, grid, grid_data) {
			var event = null;
			if (this.down_event && this.up_event && !this.down_event.fake) {
				var down_pos = this.gridPosition(game, camera, camera_data, grid, grid_data, this.down_event);
				var up_pos   = this.gridPosition(game, camera, camera_data, grid, grid_data, this.up_event);
				if (down_pos.x === up_pos.x && down_pos.y === up_pos.y) {
					event = up_pos;
					this.down_event = null;
					this.up_event = null;
				}
			} else if (this.touch_event) {
				event = this.touch_event;
				this.touch_event = null;
			}
			
			return event;
		},
		mouseDrag: function(game, camera, camera_data, grid, grid_data) {
			var event = null;
			if (this.down_event) {
				if (this.move_event && !this.up_event) {
					var down_pos = this.screenPosition(game, this.down_event);
					var move_pos = this.screenPosition(game, this.move_event);
					if (down_pos.x != move_pos.x || down_pos.y != move_pos.y) {
						event = { from: down_pos, to: move_pos };
						this.down_event = this.move_event;
						this.down_event.fake = true;
					}
					this.move_event = null;
					
				} else if (this.up_event) {
					this.down_event = null;
					this.move_event = null;
					this.up_event = null;
				}
			}
			
			return event;
		},
		zoomedBy: function(game) {
			var delta = 0;
			
			if (this.zoom_event) {
				if (this.zoom_event.wheelDelta) {
					delta = this.zoom_event.wheelDelta / 120;
				} else if (this.zoom_event.detail) {
					delta = -this.zoom_event.detail / 3;
				}
				this.zoom_event = null;
			}
			
			return delta;
		}
	};
};


/* system to render components */
TLORM.System.Render = function(context, w, h) {
	
	return {
		type: 'Render',
		context: context,
		w: w,
		h: h,
		update: function(game) {
			
			/* clear everything */
			this.context.clearRect(0, 0, this.w, this.h);
			
			/* render everything within the cameras view */
			var camera = game.entity_manager.getEntitiesByType('Camera')[0];
			var camera_data = camera ? camera.getComponentByType('Camera') : null;
			
			if (camera) {
				/* save the context prior to moving for camera */
				this.context.save();
			
				/* translate context as required by camera */
				this.context.translate(camera_data.offset_x, camera_data.offset_y);
			}
			
			/* render the grid */
			var grid = game.entity_manager.getEntitiesByType('Grid')[0];
			var grid_data = null;
			var grid_w = 0;
			var grid_h = 0;
			if (grid) {
				grid_data   = grid.getComponentByType('Grid'); 
				grid_w = grid_data.gw; 
				grid_h = grid_data.gh;
				this.renderGrid(game, grid, grid_data, grid_w, grid_h);
			}
				
			/* Render paths */
			if (false) {
				this.renderPaths(game, grid, grid_w, grid_h);
			}
			
			/* get entities that need rendering, and sort them into layer */
			var render_layers = this.getRenderableEntities(game, grid);
			
			/* render entities on grid in layers */
			for (var i=0; i<render_layers.length; ++i) {
				for (var j=0; render_layers[i] && j<render_layers[i].length; ++j) {
				
					var entity = render_layers[i][j].entity;
					if (entity === grid) { continue; }
					var render = render_layers[i][j].render;
					var grid_x = entity.x*grid_w + 1;
					var grid_y = entity.y*grid_h + 1;
					
					this.renderEntity(game, entity, render, grid_data, grid_x, grid_y);
				}
			}

			if (camera) {
				/* restore the context */
				this.context.restore();
			}
		},
		renderGrid: function(game, grid, grid_data, grid_w, grid_h) {
			var grid_render = grid.getComponentByType('Render');
			this.context.clearRect(grid.x, grid.y, grid.w, grid.h);
			if (grid_render) {
				this.context.strokeStyle = grid_render.colour;
				this.context.strokeRect(grid.x, grid.y, grid.w, grid.h);
				this.context.beginPath();
				for (var i=0; i<grid_data.w; i++) {
					this.context.moveTo(i*grid_w, grid.y);
					this.context.lineTo(i*grid_w, grid.y+grid.h);
					for (var j=0; j<grid_data.h; j++) {
						this.context.moveTo(grid.x,        j*grid_h);
						this.context.lineTo(grid.x+grid.w, j*grid_h);
					}
				}
				this.context.stroke();
			}
		},
		renderPaths: function(game, grid_w, grid_h) {
			this.context.fillStyle = '#EEE';
			var entities = game.entity_manager.getEntitiesByType('MovementPath');
			for (var i=0; i<entities.length; ++i) {
				var entity = entities[i];
				var path = entity.getComponentByType('MovementPath');
				if (path) {
					for (var j=path.current_step; j<path.steps.length; ++j) {
						if (path.steps[j]) {
							var grid_x = path.steps[j].x*grid_w + 1;
							var grid_y = path.steps[j].y*grid_h + 1;
							this.context.fillRect(grid_x, grid_y, grid_w-1, grid_h-1);
						}
					}
				}
			}
		},
		getRenderableEntities: function(game, grid) {
			var entities = game.entity_manager.getEntitiesByType('Render');
			var render_layers = [];
			for (var i=0; i<entities.length; ++i) {
				var entity = entities[i];
				if (entity === grid) { continue; }
				var render = entity.getComponentByType('Render');
				if (render) {
					if (!render_layers[render.z]) render_layers[render.z] = [];
					render_layers[render.z].push({ entity: entity, render: render });
				}
			}
			return render_layers;
		},
		renderEntity: function(game, entity, render, grid_data, grid_x, grid_y) {
			if (render.colour) {
				this.context.fillStyle = render.colour;
				if (grid_data) {
					this.context.fillRect(grid_x, grid_y, grid_data.gw, grid_data.gh);
				} else {
					this.context.fillRect(entity.x, entity.y, entity.w, entity.h);
				}
			}
			
			var uc = entity.getComponentByType('UserControllable');
			if (uc && uc.selected && render.highlight_alpha) {
				this.context.globalAlpha = render.highlight_alpha;
			} else {
				this.context.globalAlpha = 1;
			}
			
			/* render any sprites */
			var sprite = entity.getComponentByType('Sprite');
			if (sprite) {
				
				var x = grid_x+(grid_data.gw*sprite.dx);
				var y = grid_y+(grid_data.gh*sprite.dy)
				var w = grid_data.gw*sprite.dw;
				var h = grid_data.gh*sprite.dh;
				this.context.drawImage(
					sprite.img,
					sprite.x, sprite.y, sprite.w, sprite.h,
					x,        y,        w,        h
				);
				
				/* if combat sprite that has been hit,  make it flash */
				var combat = entity.getComponentByType('Combat');
				if (combat && combat.been_hit) {
					var img_data = this.context.getImageData(x, y, w, h);
					
					/* increase red and decrease others for image */
					for (var i=0; i<h; ++i) {
						for (var j=0; j<w; ++j) {
							var pix_pos= (i+(j*w))*4;
							img_data.data[pix_pos+0] *= 3; /* more red */
							img_data.data[pix_pos+1] /= 3; /* less green */
							img_data.data[pix_pos+2] /= 3; /* less blue */
							
							if (img_data.data[pix_pos+0] > 255) {
								img_data.data[pix_pos+0] = 255;
							}
						}
					}
					
					this.context.putImageData(img_data, x, y);
				}
			}
			
			/* render any text */
			if (render.show_name) {
				var grid_x = entity.x*grid_w + 1;
				var grid_y = entity.y*grid_h + 1;
				this.context.fillText(entity.name, grid_x, grid_y+grid_h-2);
			}
		}
	};
};

TLORM.System.Combat = function() {
	return {
		type: 'Combat',
		update: function(game) {
			
			/* check for combat entities that are completely surrounded and 'kill' them */
			var entities = game.entity_manager.getEntitiesByType('Combat');
			for (var i=0; i<entities.length; ++i) {
				var entity = entities[i];
				if (this.surrounded(game, entity, entities)) {
					game.entity_manager.removeEntity(entity);
					entities.splice(i, 1);
				}
			}
		},
		surrounded: function(game, entity, entities) {
			
			var grid = game.entity_manager.getEntitiesByType('Grid')[0];
			var grid_data = grid.getComponentByType('Grid'); 
			
			/* check if entity is surrounded */
			var entity_combat = entity.getComponentByType('Combat');
			var surrounded_cells = {};
			surrounded_cells[(entity.x-1)+","+(entity.y)  ] = 1;
			surrounded_cells[(entity.x)  +","+(entity.y-1)] = 1;
			surrounded_cells[(entity.x+1)+","+(entity.y)  ] = 1;
			surrounded_cells[(entity.x)  +","+(entity.y+1)] = 1;
			
			/* edges count as surrounded */
			if (entity.x-1 < 0)            { surrounded_cells[(entity.x-1)+","+(entity.y)  ] = 2; }
			if (entity.x+1 >= grid_data.w) { surrounded_cells[(entity.x+1)+","+(entity.y)  ] = 2; }
			if (entity.y-1 < 0)            { surrounded_cells[(entity.x)+","+(entity.y-1)  ] = 2; }
			if (entity.y+1 >= grid_data.h) { surrounded_cells[(entity.x)+","+(entity.y+1)  ] = 2; }
			
			/* walls count as surrounded */
			var surroundings = entities.slice(0);
			var walls = game.entity_manager.getEntitiesByType('Physics');
			for (var i=0; i<walls.length; ++i) {
				var physics = walls[i].getComponentByType('Physics');
				if (physics && physics.can_collide) {
					surroundings.push(walls[i]);
				}
			}
			

			for (var i=0; i<surroundings.length; ++i) {
				var checking_entity        = surroundings[i];
				var checking_entity_combat = checking_entity.getComponentByType('Combat');
				if (surrounded_cells[checking_entity.x+","+checking_entity.y] && (!checking_entity_combat || checking_entity_combat.code != entity_combat.code)) {
					++surrounded_cells[checking_entity.x+","+checking_entity.y];
				}
			}
			
			/* if all cells are filled then entity is surrounded */
			for (var cell in surrounded_cells) {
				if (!surrounded_cells[cell] || surrounded_cells[cell] === 1) {
					entity_combat.been_hit = false;
					return false;
				}
			}
			entity_combat.been_hit = true;
			
			return true;
		}
	};
};

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
};window.onload = function() {
	var canvas = document.getElementById("tlorm_game_canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	var game = new TLORM.Game("Strategos", canvas);

	setup_world(game, canvas);
	game.start();
};

/* Game entities */
function setup_world(game, canvas) {
	var grid_w = 50;
	var grid_h = 50;
	var camera = TLORM.QuickEntity.Level(game, "levels/test1.txt", "World",
			"#AAACCA", grid_w, grid_h, canvas.width, canvas.height);

	/*
	 * TLORM.QuickEntity.World(game, "World", "#AAACCA", canvas.width,
	 * canvas.height, grid_x, grid_y);
	 * 
	 * var players = 4; var mid_w = Math.floor(grid_x/2)-Math.floor(players/2);
	 * for (var i=0; i<players; ++i) { TLORM.QuickEntity.Player(game,
	 * "Player"+(i+1), "#00F", "#44F", mid_w+(i*2), grid_y-1, grid_w, grid_h); }
	 * 
	 * var enemies = 2; mid_w = Math.floor(grid_x/2)-Math.floor(enemies/2); for
	 * (var i=0; i<enemies; ++i) { TLORM.QuickEntity.Enemy(game, "Enemy"+(i+1),
	 * "#F00", mid_w+(i*2), 0, grid_w, grid_h); }
	 * 
	 * for (var i=1; i<grid_x-1; i++) { for (var j=1; j<grid_y-1; ++j) { if
	 * (Math.random() < 0.25) { TLORM.QuickEntity.Wall(game, "Wall-"+i+"-"+j,
	 * "#456456", i, j, grid_w, grid_h); } } }
	 */

	game.system_manager.addSystem(new TLORM.System.AIInput());
	game.system_manager.addSystem(new TLORM.System.UserInput());
	game.system_manager.addSystem(new TLORM.System.Movement());
	game.system_manager.addSystem(new TLORM.System.Combat());
	game.system_manager.addSystem(new TLORM.System.CleanUp(0, 0, canvas.width,
			canvas.height));
	game.system_manager.addSystem(new TLORM.System.Render(game.canvasContext(),
			canvas.width, canvas.height));
}

TLORM.Component.MovementPath = function(destination, via, distance, step_delay) {
	
	return {
		type: 'MovementPath',
		steps: [],
		destination: destination,
		via: via,
		distance: distance || 0,
		current_step: -1,
		step_delay: step_delay || 2,
		current_step_delay: 0
	};
};

TLORM.Component.AITypes = ['Aggressive'];
TLORM.Component.AI = function(ai_type) {
	if (ai_type) {
		var found = false;
		for (var i=0; i<TLORM.Component.AITypes.length; i++) {
			if (TLORM.Component.AITypes[i] === ai_type) {
				found = true;
				break;
			}
		}
		if (!found) {
			throw "Invalid AI type: "+ai_type;
		}
	}
	
	return {
		type: 'AI',
		ai_type: ai_type,
		vision: 7,
		current_delay: 0 /* count of how long we've waited */
	};
};

TLORM.Component.Combat = function(code) {
	return {
		type: 'Combat',
		
		/* use codes to determine which combat effects which, so can't hurt yourself */
		code: code,
		/* TODO: add flags to determine Combat behaviour */
		been_hit: false,
		hit_animation: 0,
		hit_animation_limit: 10,
	};
};

TLORM.Component.Cell = function() {
	
	return {
		type: 'Cell'
	};
};

TLORM.Component.Camera = function(offset_x, offset_y) {
	
	return {
		type: 'Camera',
		offset_x: offset_x,
		offset_y: offset_y
	};
};

TLORM.Component.Movement = function(x, y, s, incremental) {
	
	return {
		type: 'Movement',
		x: x,
		y: y,
		s: s,
		incremental: incremental || false,
		prev_x: null,
		prev_y: null
	};
};

TLORM.Component.Grid = function(w, h, gw, gh) {
	
	return {
		type: 'Grid',
		w: w,
		h: h,
		gw: gw,
		gh: gh,
		default_gw: gw,
		default_gh: gh,
		scale: 1.0
	};
};

TLORM.Component.UserControllable = function() {
	return {
		type: 'UserControllable',
		/* no real data to go in this, perhaps in future can define control setup, for now assume mouse */
		selected: false
	};
};

TLORM.Component.Physics = function(can_collide, can_move) {
	return {
		type: 'Physics',
		can_collide: can_collide,
		can_move: can_move
		
		/* TODO, should probably put position, size, etc in this compoenent instead of entity */
	}
};