

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