

/* system to render components */
TLORM.System.Render = function(context, working_context, w, h) {
	
	return {
		type: 'Render',
		context: context,
		working_context: working_context,
		w: w,
		h: h,
		update: function(game) {
			
			var camera = game.entity_manager.getEntitiesByType('Camera')[0];
			
			/* clear everything */
			this.context.clearRect(0, 0, this.w, this.h);
			
			/* get entities that need rendering, and sort them into layer */
			var render_layers = this.getRenderableEntities(game, camera);
			
			/* render entities */
			for (var i=0; i<render_layers.length; ++i) {
				if (render_layers[i]) {
					for (var j=render_layers[i].max_index; j>=render_layers[i].min_index; --j) {
						if (render_layers[i].items[j]) {
							for (var k in render_layers[i].items[j]) {
								this.renderEntity(game, render_layers[i].items[j][k], camera);
							}
						}
					}
				}
			}
		},
		
		/* returns nested hashs keyed on render layer and then z coord */
		getRenderableEntities: function(game, camera) {
			var camera_position = (camera ? camera.getComponentByType('Position') : null);
			var z_cutoff = (camera_position ? camera_position.point.z : null);
			var y_cutoff = (camera_position ? camera_position.point.y : null);
						
			var entities = game.entity_manager.getEntitiesByType('Render');
			var render_layers = [];
			for (var i=0; i<entities.length; ++i) {
				var entity = entities[i];
				var render = entity.getComponentByType('Render');
				var position = entity.getComponentByType('Position');
				
				/* ignore things behind the camera */
				var end_z = position.point.z + position.d;
				var end_y = position.point.y + position.d;
				
				if (   render
				    && position
				    && (
					      (!z_cutoff && !y_cutoff)
				       || ( TLORM.Component.CameraType == 'H' && end_z > z_cutoff )
				       || ( TLORM.Component.CameraType == 'V' && end_y > y_cutoff )
				    )
				) {
					if (!z_cutoff && !y_cutoff) {
						if (!render_layers[render.z]) render_layers[render.z] = { min_index: 0, max_index: 0, items: [[]] };
						render_layers[render.z].items[0].push(entity);
					} else {
						if (!render_layers[render.z]) render_layers[render.z] = { min_index: 0, max_index: 0, items: [] };
						if ( TLORM.Component.CameraType == 'H' ) {
							if (!render_layers[render.z].items[end_z]) render_layers[render.z].items[end_z] = [];
							render_layers[render.z].items[end_z].push(entity);
							if (end_z < render_layers[render.z].min_index) {
								render_layers[render.z].min_index = end_z;
							}
							if (end_z > render_layers[render.z].max_index) {
								render_layers[render.z].max_index = end_z;
							}
						} else if ( TLORM.Component.CameraType == 'V' ) {
							if (!render_layers[render.z].items[end_y]) render_layers[render.z].items[end_y] = [];
							render_layers[render.z].items[end_y].push(entity);
							if (end_y < render_layers[render.z].min_index) {
								render_layers[render.z].min_index = end_y;
							}
							if (end_y > render_layers[render.z].max_index) {
								render_layers[render.z].max_index = end_y;
							}
						}
					}
				}
			}
			return render_layers;
		},
		renderEntity: function(game, entity, camera) {
			var render = entity.getComponentByType('Render');
			
			if (camera) {
				/* 3D: draw faces */
				var faces = this.getFaces(camera, entity);
				var texture = entity.getComponentByType('Texture');
				var image = entity.getComponentByType('Image');
				
				if (image) {
					this.context.fillStyle = this.context.createPattern(image.img, "no-repeat");
				} else if (texture) {
					this.context.fillStyle = this.context.createPattern(texture.img, "repeat");
					
					/* TODO: draw on working canvas, skew to fit each face and draw it */
					if (false) {
						this.working_context.save();
						this.working_context.fillStyle = this.working_context.createPattern(texture.img, "repeat");
						this.working_context.fill();
						this.working_context.restore();
					}
				} else {
					if (render.fill_colour) {
						this.context.fillStyle = render.fill_colour;
					}
					if (render.stroke_colour) {
						this.context.stokeStyle = render.stroke_colour;
					}
				}
				
				for (var i=0; i<faces.length; ++i) {
					this.context.beginPath();
					this.context.moveTo(faces[i][0].x, faces[i][0].y);
					for (var j=1; j<faces[i].length; ++j) {
						this.context.lineTo(faces[i][j].x, faces[i][j].y);
					}
					this.context.lineTo(faces[i][0].x, faces[i][0].y);
					this.context.closePath();
					
					if (render.stroke_colour) {
						this.context.stroke();
					}
					if (image || texture || render.fill_colour) {
						this.context.fill();
					}
					this.context.closePath();
				}
				
			} else {
				/* 2D */
				var position = entity.getComponentByType('Position');
				if (render.fill_colour) {
					this.context.fillStyle = render.fill_colour;
					this.context.fillRect(position.point.x, position.point.y, position.w, position.h);
				}
				if (render.stroke_colour) {
					this.context.stokeStyle = render.stroke_colour;
					this.context.strokeRect(position.point.x, position.point.y, position.w, position.h);
				}
			}
		},
		
		/* TODO: create faces as quadrilaterals and transform all points at once */
		getFaces: function(camera, entity) {
			var camera_position = camera.getComponentByType('Position');
			var position = entity.getComponentByType('Position');
			
			/* if still on screen but started before camera, move it up to camera */
			var old_z = position.point.z;
			var old_y = position.point.y;
			var old_d = position.d;
			if ( TLORM.Component.CameraType == 'H' && position.point.z <= camera_position.point.z) {
				position.d -= camera_position.point.z - position.point.z - 1;
				position.point.z = camera_position.point.z + 1;
			} else if ( TLORM.Component.CameraType == 'V' && position.point.y <= camera_position.point.y) {
				position.d -= camera_position.point.y - position.point.y - 1;
				position.point.y = camera_position.point.y + 1;
			}
			
			var faces = [
				/* front */
				[
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x,            position.point.y           , position.point.z           ),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y           , position.point.z           ),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z           ),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x,            position.point.y+position.h, position.point.z           ),
						camera, this.w, this.h
					)
				],
				/* right */
				[
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y           , position.point.z           ),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y           , position.point.z+position.d),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z+position.d),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z           ),
						camera, this.w, this.h
					)
				],
				/* back */
				[
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y           , position.point.z+position.d),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x           , position.point.y           , position.point.z+position.d),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x           , position.point.y+position.h, position.point.z+position.d),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z+position.d),
						camera, this.w, this.h
					)
				],
				/* left */
				[
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x           , position.point.y           , position.point.z           ),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x           , position.point.y           , position.point.z+position.d),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x           , position.point.y+position.h, position.point.z+position.d),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x           , position.point.y+position.h, position.point.z           ),
						camera, this.w, this.h
					)
				],
			];
			
			/* add top  */
			faces = faces.concat(this.getTopFaces(camera, entity));
			
			position.point.z = old_z;
			position.point.y = old_y;
			position.d = old_d;
			
			return faces;
		},
		getTopFaces: function(camera, entity) {
			var position = entity.getComponentByType('Position');
			var terrain = entity.getComponentByType('Terrain');
			
			/* if this is terrain then add "faces" to the top using height map */
			if (terrain && terrain.height_map.length > 2) {
				var faces = [];
				
				/* go through each point and join it to its two nearest points */
				var height_map_points = terrain.height_map;
				for (var i=0; i<height_map_points.length; ++i) {
					var nearest = height_map_points[i].nearest(height_map_points, 2);
					faces.push(
						[
							TLORM.CameraFunctions.point_on_screen(height_map_points[i], camera, this.w, this.h),
							TLORM.CameraFunctions.point_on_screen(nearest[0], camera, this.w, this.h),
							TLORM.CameraFunctions.point_on_screen(nearest[1], camera, this.w, this.h)
						]
					);
				}
				
				/* join the corner together via nearest point */
				var corners = [
					new TLORM.Math.Point(position.point.x           , position.point.y+position.h, position.point.z           ),
					new TLORM.Math.Point(position.point.x           , position.point.y+position.h, position.point.z+position.d),
					new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z+position.d),
					new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z           ),
				];
				for (var i=0; i<corners.length; ++i) {
					var nearest = corners[i].nearest(height_map_points, 1);
					faces.push(
						[
							TLORM.CameraFunctions.point_on_screen(corners[(i==0 ? corners.length-1 : i-1)], camera, this.w, this.h),
							TLORM.CameraFunctions.point_on_screen(nearest[0], camera, this.w, this.h),
							TLORM.CameraFunctions.point_on_screen(corners[i], camera, this.w, this.h)
						]
					);
				}
				
				return faces;
			} else {
				/* add normal top */
				return [
					[
						TLORM.CameraFunctions.point_on_screen(
							new TLORM.Math.Point(position.point.x           , position.point.y+position.h, position.point.z           ),
							camera, this.w, this.h
						),
						TLORM.CameraFunctions.point_on_screen(
							new TLORM.Math.Point(position.point.x           , position.point.y+position.h, position.point.z+position.d),
							camera, this.w, this.h
						),
						TLORM.CameraFunctions.point_on_screen(
							new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z+position.d),
							camera, this.w, this.h
						),
						TLORM.CameraFunctions.point_on_screen(
							new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z           ),
							camera, this.w, this.h
						)
					],
				];
			}
		}
	};
};