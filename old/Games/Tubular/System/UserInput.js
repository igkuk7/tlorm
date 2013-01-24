

/* system to map user input to the various components */
TLORM.System.UserInput = function() {
	return {
		type: 'UserInput',
		touch_event: null,
		init: function(game) {
			/* register control callbacks for player */
			var system = this;
			game.registerEvent("click", function(event) { system.clickHandler(event); } );
			game.registerEvent("touch", function(event) { system.clickHandler(event); } );
		},
		clickHandler: function(event) {
			this.touch_event = event;
		},
		update: function(game) {
			
			/* check if an what event was triggered and apply the movement as required */
			if (this.touch_event) {
				
				/* get tube container */
				var container_entity = (game.entity_manager.getEntitiesByType('TubeRowContainer'))[0];
				var container = container_entity.getComponentByType('TubeRowContainer');
				
				/* handle any clicks to tubes */
				this.tubeClicked(game, container_entity, container);
				this.touch_event = null;
			}
		},
		startClicked: function(game, container_entity, container) {
			return null;
			if (this.touch_event) {
				var event = this.touch_event;
				var tube_row = container.rows[0].getComponentByType('TubeRow');
				if (   container_entity.x <= event.offsetX && event.offsetX <= container_entity.x + container_entity.w
				    && container_entity.y <= event.offsetY && event.offsetY <= container_entity.y + container.rows[0].h / 2
				) {
					/* which position was clicked? */
					var tube_w = container_entity.w / tube_row.cols;
					var position = Math.floor((event.offsetX - container_entity.x) / tube_w);
					return position;
				}
			}
			return -1;
		},
		tubeClicked: function(game, container_entity, container) {
			if (this.touch_event) {
				var event = this.touch_event;
				var entities = game.entity_manager.getEntitiesByType('TubeRow');
				for (var i=0; i<entities.length; ++i) {
					var entity = entities[i];
					if (   entity.x <= event.offsetX && event.offsetX <= entity.x + entity.w
					    && entity.y <= event.offsetY && event.offsetY <= entity.y + entity.h 
					) {
						/* Click at edges or near middle? */
						var threshold = 100;
						if (   entity.x <= event.offsetX && event.offsetX <= entity.x + threshold
						    || entity.x + entity.w - threshold <= event.offsetX && event.offsetX <= entity.x + + entity.w
						) {
							entity.edge_click = true;
						}
						
						/* which tube was clicked */
						var tube_row = entity.getComponentByType('TubeRow');
						var tube_w = entity.w / tube_row.cols;
						var tube_pos = Math.floor( (event.offsetX - entity.x) / tube_w );
						if (tube_row.tube_clicked != null) {
							if (tube_row.tube_clicked != tube_pos) {
								tube_row.swapTubeEnds(tube_row.tube_clicked, tube_pos);
								container.calculatePositions();
							}
							tube_row.tube_clicked = null
						} else {
							tube_row.tube_clicked = tube_pos;
						}
						
						return null; //return entity;
					}
				}
			}
			return null;
		},
		horizontalTubeFlip: function(game, container, tube, tube_row) {
			var size = { x: tube.x, y: tube.y, w: tube.w, h: tube.h };
			var dx = Math.floor(tube.w / 10);
			game.entity_manager.addEntityComponent(
				tube,
				TLORM.Component.Animation(
					10,
					function(animation) {},
					function(animation, step) {
						game.entity_manager.addEntityComponent(
							tube,
							TLORM.Component.Transform(dx, null, -2*dx, null)
						);
					},
					function(animation) {
						game.entity_manager.addEntityComponent(
							tube,
							TLORM.Component.Transform(null, null, null, null, size.x, size.y, size.w, size.h)
						);
						tube_row.flipHorizontal();
						container.calculatePositions();
						--container.rows_being_flipped;
					}
				)
			);
			++container.rows_being_flipped;
		},
		verticalTubeFlip: function(game, container, tube, tube_row) {
			var size = { x: tube.x, y: tube.y, w: tube.w, h: tube.h };
			var dy = Math.floor(tube.h / 10);
			game.entity_manager.addEntityComponent(
				tube,
				TLORM.Component.Animation(
					10,
					function(animation) {},
					function(animation, step) {
						game.entity_manager.addEntityComponent(
							tube,
							TLORM.Component.Transform(null, dy, null, -2*dy)
						);
					},
					function(animation) {
						game.entity_manager.addEntityComponent(
							tube,
							TLORM.Component.Transform(null, null, null, null, size.x, size.y, size.w, size.h)
						);
						tube_row.flipVertical();
						container.calculatePositions();
						--container.rows_being_flipped;
					}
				)
			);
			++container.rows_being_flipped;
		}
	};
};
