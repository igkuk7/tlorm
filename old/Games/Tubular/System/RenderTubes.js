

/* system to render tubes */
TLORM.System.RenderTubes = function(context, w, h) {
	var tube_line_width = 15;
	var tube_flip_h_steps = 10;
	var tube_flip_v_steps = 10;
	return {
		type: 'RenderTubes',
		context: context,
		w: w,
		h: h,
		update: function(game) {
			
			/* clear everything */
			this.context.clearRect(0, 0, this.w, this.h);
			
			/* get tube container */
			var container_entity = (game.entity_manager.getEntitiesByType('TubeRowContainer'))[0];
			var container = container_entity.getComponentByType('TubeRowContainer');
			
			/* draw it down the page */
			var default_tube_w = 0;
			var default_tube_h = 0;
			var end_h = container_entity.h;
			for (var i=0; i<container.rows.length; ++i) {
				var entity = container.rows[i];
				var tube_row = entity.getComponentByType('TubeRow');

				this.renderRow(container, entity, tube_row);

				var tube_w = entity.w / tube_row.cols;
				var tube_h = entity.h;
				
				/* render the mapping */
				for (var j=0; j<tube_row.cols; ++j) {
					if (tube_row.tube_clicked != null && tube_row.tube_clicked == tube_row.mapping[j]) {
						this.context.lineWidth = tube_line_width;
						this.renderRowPaths(container, entity, tube_row.mapping, i, j, tube_w, tube_h, true, true);
					} else {
						this.context.lineWidth = tube_line_width;
						this.renderRowPaths(container, entity, tube_row.mapping, i, j, tube_w, tube_h, true);
					}
					this.context.lineWidth = tube_line_width - 3;
					this.renderRowPaths(container, entity, tube_row.mapping, i, j, tube_w, tube_h);
				}
				
				/* set defaults only if entity is not transforming */
				if (!entity.getComponentByType('Transform') && !entity.getComponentByType('Animation')) {
					default_tube_w = tube_w;
					default_tube_h = tube_h;
				}
			}

			/* render start */
			this.renderStart(container_entity.x, container_entity.y, default_tube_w, default_tube_h, container);
			
			/* render desired end */
			this.renderDesiredEnd(container_entity.x, end_h-(default_tube_h/2), default_tube_w, default_tube_h, container);
			
			/* render container over everything */
			this.renderContainer(container_entity);
			
		},
		renderContainer: function(entity) {
			var render = entity.getComponentByType('Render');
			if (render.fill_colour) {
				this.context.fillStyle = render.fill_colour;
				this.context.fillRect(entity.x, entity.y, entity.w, entity.h);
			}
			if (render.stroke_colour) {
				this.context.lineWidth = 1;
				this.context.strokeStyle = render.stroke_colour;
				this.context.strokeRect(entity.x, entity.y, entity.w, entity.h);
			}
		},
		renderRow: function(container, entity, tube_row) {
			var render = entity.getComponentByType('Render');
			if (render.fill_colour) {
				this.context.fillStyle = ( tube_row.fixed ? '#444' : render.fill_colour );
				this.context.fillRect(entity.x, entity.y, entity.w, entity.h);
			}
			if (render.stroke_colour) {
				this.context.lineWidth = 1;
				this.context.strokeStyle = render.stroke_colour;
				this.context.strokeRect(entity.x, entity.y, entity.w, entity.h);
			}
		},
		renderRowPaths: function(container, entity,  mapping, row, col, tube_w, tube_h, outline, clicked) {
			var dir_w  = tube_w / 100;
			var dir_h  = entity.h / 1.1; 

			/* get the position to colour */
			if (outline) {
				if (clicked) {
					this.context.strokeStyle = '#0FF';
				} else {
					this.context.strokeStyle = '#000';
				}
			} else {
				var pos = container.getPosition(row, col);
				if (container.filling[pos] && container.rows_being_flipped == 0) {
					this.context.strokeStyle = container.colours[pos];
				} else {
					this.context.strokeStyle = '#FFF';
				}
			}
			
			/* figure out direction for horizontal curve */
			var dir = 1;
			if (col === mapping[col]) {
				dir = 0;
			} else if (col > mapping[col]) {
				dir = -1;
			}
			
			/* render the path */
			this.context.beginPath();
			this.context.moveTo(entity.x + ((col+0.5)*tube_w), entity.y-1);
			if (dir === 0) {
				this.context.lineTo(
					entity.x + ((mapping[col]+0.5)*tube_w),
					entity.y + entity.h + 1
				);
			} else {
				this.context.bezierCurveTo(
					entity.x + ((col+0.5)*tube_w) + (dir*dir_w),
					entity.y + dir_h,
					entity.x + ((mapping[col]+0.5)*tube_w) - (dir*dir_w),
					entity.y + entity.h - dir_h,
					entity.x + ((mapping[col]+0.5)*tube_w),
					entity.y + entity.h + 1
				);
			}
			this.context.stroke();
		},
		renderDesiredEnd: function(x, y, tube_w, tube_h, container) {
			for (var i=0; i<container.end.length; ++i) {
				
				/* set the colour */
				this.context.lineWidth = 1;
				this.context.strokeStyle = '#000';
				this.context.fillStyle = container.colours[container.end[i]];
				
				/* colour as squares */
				this.context.fillRect(x+(i*tube_w), y, tube_w, tube_h/2);
				this.context.strokeRect(x+(i*tube_w), y, tube_w, tube_h/2);
			}
		},
		renderStart: function(x, y, tube_w, tube_h, container) {
			for (var i=0; i<container.end.length; ++i) {
				
				/* set the colour */
				this.context.lineWidth = 1;
				this.context.strokeStyle = '#000';
				this.context.fillStyle = container.colours[i];
				
				/* colour as squares */
				this.context.fillRect(x+(i*tube_w), y, tube_w, tube_h/2);
				this.context.strokeRect(x+(i*tube_w), y, tube_w, tube_h/2);
			}
		}
	};
};