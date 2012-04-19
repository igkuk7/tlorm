
TLORM.QuickEntity.Card = function(game, name, colour, value, x, y, w, h) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Render(1, value, null, null, colour),
			TLORM.Component.Card(value),
		], x, y, w, h)
	);
};
TLORM.QuickEntity.RandomCards = function(game, name, cw, ch, sw, sh, colours) {
	
	/* calculate number of cards for given colours */
	var cards = colours.length * 2;
	var cols = largest_factor(cards);
	var rows = cards / cols;
	
	var colours_pool = colours.concat(colours);
	colours_pool.sort(function() { return 0.5 - Math.random(); });
	
	for (var i=0; i<cols; ++i) {
		for (var j=0; j<rows; ++j) {
			var x = sw+(cw+sw)*i;
			var y = sh+(ch+sh)*j;
			TLORM.QuickEntity.Card(game, "", "#CCC", colours_pool.pop(), x, y, cw, ch);
		}
	}
	
	return { w: (cols+1) * (cw+sw), h: (rows+1) * (ch+sh) };
};

function largest_factor(num) {
	for (var i=Math.floor(num/2); i > 0; --i) {
		var j = num / i;
		if ( j % 1 == 0 ) {
			return i;
		}
	}
}

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


/* system to render cards */
TLORM.System.RenderCards = function(context, w, h) {
	return {
		type: 'RenderCards',
		context: context,
		w: w,
		h: h,
		update: function(game) {
			
			/* clear everything */
			this.context.clearRect(0, 0, this.w, this.h);
			
			/* render cards */
			var cards = this.getCards(game);
			for (var i=0; i<cards.length; ++i) {
				this.renderCard(cards[i]);
			}
		},
		renderCard: function(card) {
			var render = card.getComponentByType('Render');
			
			var card_data = card.getComponentByType('Card');
			if (card_data.face_up) {
				this.context.fillStyle = render.fill_colour;
				/* TODO: draw value */
			} else {
				this.context.fillStyle = render.other_fill_colour;
			}
			this.context.fillRect(card.x, card.y, card.w, card.h);
		},
		getCards: function(game) {
			return game.entity_manager.getEntitiesByType('Card');
		}
	};
};

/* system to render tubes */
TLORM.System.Scoring = function() {
	return {
		type: 'Scoring',
		update: function(game) {

			/* cards */
			var cards_up = [];
			var cards = this.getCards(game);
			var to_match = cards.length;
			for (var i=0; i<cards.length; ++i) {
				var card_data = cards[i].getComponentByType('Card');
				var animation = cards[i].getComponentByType('Animation');
				if (card_data.matched) {
					--to_match;
				} else if (card_data.face_up && !animation) {
					cards_up.push({ card: cards[i], card_data: card_data });
				}
			}
			
			if (to_match == 0) {
				game.gameOver(true, "You did it!");
			}
			
			if (cards_up[0] && cards_up[1]) {
				if (cards_up[0].card_data.value == cards_up[1].card_data.value) {
					cards_up[0].card_data.matched = true;
					cards_up[1].card_data.matched = true;
				} else {
					for (var i=0; i<cards_up.length; ++i) {
						this.flipCard(game, cards_up[i].card, cards_up[i].card_data);
					}
				}
			}
		},
		getCards: function(game) {
			return game.entity_manager.getEntitiesByType('Card');
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
						card_data.face_up = false;
					}
				)
			);
		}
	};
};
window.onload = function() {
	var canvas = document.getElementById("tlorm_game_canvas");
	var game = new TLORM.Game("LeoDots", canvas);
	
	var cw = 100;
	var ch = 150;
	var sw = 10;
	var sh = 10;
	
	var size = TLORM.QuickEntity.RandomCards(game, "Random", cw, ch, sw, sh, ['#F00', '#0F0', '#00F' ]);
	game.setSize(size.w, size.h);

	game.system_manager.addSystem(new TLORM.System.RenderCards(game.canvasContext(), canvas.width, canvas.height));
	game.system_manager.addSystem(new TLORM.System.UserInput());
	game.system_manager.addSystem(new TLORM.System.Scoring());
	game.start();
};

TLORM.Component.Card = function(value) {
	return {
		type: 'Card',
		value: value,
		face_up: false,
		matched: false
	};
};