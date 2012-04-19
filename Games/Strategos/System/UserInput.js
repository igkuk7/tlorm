

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
