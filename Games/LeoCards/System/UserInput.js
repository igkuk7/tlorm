

/* system to map user input to the various components */
TLORM.System.UserInput = function() {
	return {
		type: 'UserInput',
		touch_event: null,
		init: function(game) {
			/* register control callbacks for player */
			var system = this;
			game.registerEvent("click", function(event) { system.clickHandler(event); return false; } );
			game.registerEvent("touch", function(event) { system.clickHandler(event); return false; } );
		},
		clickHandler: function(event) {
			this.touch_event = event;
		},
		update: function(game) {
			var card = this.cardClicked(game);
			if (card) {
				var card_data = card.getComponentByType('Card');
				var animation = card.getComponentByType('Animation');
				if (!card_data.face_up && !animation) {
					this.flipCard(game, card, card_data);
				}
			}
		},
		cardClicked: function(game) {
			if (this.touch_event) {
				var event = this.touch_event;
				this.touch_event = null;
				var entities = game.entity_manager.getEntitiesByType('Card');
				for (var i=0; i<entities.length; ++i) {
					if (   entities[i].x <= event.offsetX && event.offsetX <= entities[i].x + entities[i].w
					    && entities[i].y <= event.offsetY && event.offsetY <= entities[i].y + entities[i].h 
					) {
						return entities[i];
					}
				}
			}
			return null;
		},
		flipCard: function(game, card, card_data) {
			var size = { x: card.x, y: card.y, w: card.w, h: card.h };
			var steps = 5;
			var dx = Math.floor(card.w / steps);
			game.entity_manager.addEntityComponent(
				card,
				TLORM.Component.Animation(
					steps,
					function(animation) {},
					function(animation, step) {
						game.entity_manager.addEntityComponent(
							card,
							TLORM.Component.Transform(dx, null, -2*dx, null)
						);
					},
					function(animation) {
						game.entity_manager.addEntityComponent(
							card,
							TLORM.Component.Transform(null, null, null, null, size.x, size.y, size.w, size.h)
						);
						card_data.face_up = true;
					}
				)
			);
		}
	};
};
