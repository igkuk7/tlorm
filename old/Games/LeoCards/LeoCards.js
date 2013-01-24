
/*
 * ./QuickEntity/Card.js
 */


TLORM.QuickEntity.Card = function(game, name, bg_colour, colour, value, x, y, w, h) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Render(1, colour, null, null, bg_colour),
			TLORM.Component.Card(value),
		], x, y, w, h)
	);
};

/*
 * ./QuickEntity/RandomCards.js
 */


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
			var details = colours_pool.pop();
			TLORM.QuickEntity.Card(game, "", "#CCC", details.colour, details.value, x, y, cw, ch);
		}
	}
	
	return { w: (cols+1) * (cw+sw), h: (rows+1) * (ch+sh) };
};

function largest_factor(num) {
	var factor = 1;
	var diff   = num - factor;
	for (var i=Math.floor(num/2); i > 0; --i) {
		var j = num / i;
		if ( j % 1 == 0 ) {
			var tmp_diff = Math.abs(i - j);
			if (tmp_diff < diff) {
				factor = i;
				diff  = tmp_diff;
			}
		}
	}
	return factor;
}

/*
 * ./System/UserInput.js
 */



/* system to map user input to the various components */
TLORM.System.UserInput = function() {
	return {
		type: 'UserInput',
		touch_event: null,
		init: function(game) {
			/* register control callbacks for player */
			var system = this;

			/* prevent default behaviour on mobiles */
			var touch_events = [ 'touchstart', 'touchchange', 'touchmove', 'touchend', 'touchcancel', 'gesturestart', 'gesturechange', 'gesturemove', 'gestureend' ];
			for (var i=0; i<touch_events.length; ++i) {
				game.registerEvent(touch_events[i], function(event) { event.preventDefault(); return false; } );
			}
			
			game.registerEvent("click", function(event) { system.clickHandler(event); event.preventDefault(); return false; } );
			game.registerEvent("touch", function(event) { system.clickHandler(event); event.preventDefault(); return false; } );
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

/*
 * ./System/RenderCards.js
 */



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
				this.context.fillRect(card.x, card.y, card.w, card.h);
				this.context.fillStyle = '#000';
				this.context.font = card.h+'px Arial';
				this.context.textAlign = 'center';
				this.context.fillText(card_data.value, card.x+(card.w/2), card.y+(card.h*0.85));

				if (card_data.matched) {
					this.context.strokeStyle = '#FFF';
					this.context.lineWidth   = 4;
					this.context.strokeRect(card.x, card.y, card.w, card.h);
				}



				/* render any sprites */
				var sprite = card.getComponentByType('Sprite');
				if (sprite) {
					var x = card.x+(card.w*sprite.dx);
					var y = card.y+(card.h*sprite.dy)
					var w = card.w*sprite.dw;
					var h = card.h*sprite.dh;
					this.context.drawImage(
						sprite.img,
						sprite.x, sprite.y, sprite.w, sprite.h,
						x,        y,        w,        h
					);
				}
			} else {
				this.context.fillStyle = render.other_fill_colour;
				this.context.fillRect(card.x, card.y, card.w, card.h);
			}
		},
		getCards: function(game) {
			return game.entity_manager.getEntitiesByType('Card');
		}
	};
};

/*
 * ./System/Scoring.js
 */



/* system to render tubes */
TLORM.System.Scoring = function() {
	var flip_back_wait = 5;
	return {
		type: 'Scoring',
		flipping_back: false,
		flip_back_step: 0,
		score: 0,
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
				game.gameOver(true, this.score);
			}
			
			if (this.flipping_back) {
				if (this.flip_back_step++ >= flip_back_wait) {
					for (var i=0; i<cards_up.length; ++i) {
						this.flipCard(game, cards_up[i].card, cards_up[i].card_data);
					}
					this.flipping_back = false;
					this.score -= 20;
				}
			} else {
				if (cards_up[0] && cards_up[1]) {
					if (cards_up[0].card_data.value == cards_up[1].card_data.value) {
						cards_up[0].card_data.matched = true;
						cards_up[1].card_data.matched = true;
						this.score += 100;
					} else {
						this.flipping_back = true;
						this.flip_back_step = 0;
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

/*
 * ./main.js
 */

var canvas;
var game;
var cw = 80;
var ch = 100;
var sw = 10;
var sh = 10;

var numbers = [
	{ colour: '#F00', value: 1 }, { colour: '#0F0', value: 2 },
	{ colour: '#00F', value: 3 }, { colour: '#FF0', value: 4 },
	{ colour: '#0FF', value: 5 }, { colour: '#F0F', value: 6 },
];
var letters = [
	{ colour: '#F00', value: 'A' }, { colour: '#0F0', value: 'B' },
	{ colour: '#00F', value: 'C' }, { colour: '#FF0', value: 'D' },
	{ colour: '#0FF', value: 'E' }, { colour: '#F0F', value: 'F' },
];

window.onload = function() {
	canvas = document.getElementById("tlorm_game_canvas");
	game = new TLORM.Game("LeoDots", canvas);
	game.onStop = function() { new_game(); }
	new_game();
};

function new_game() {
	game.reset();
	
	var choices = [];
	var type = game.param('type');
	if (type == 'numbers') {
		choices = numbers;
	} else if (type == 'letters') {
		choices = letters;
	} else {
		throw "Unknown type: "+type;
		return;
	}

	var num = game.param('num');
	if (num && num < choices.length) {
		choices.splice(num);
	}

	var size = TLORM.QuickEntity.RandomCards(game, "Random", cw, ch, sw, sh, choices);
	game.setSize(size.w, size.h);

	game.system_manager.addSystem(new TLORM.System.RenderCards(game.canvasContext(), canvas.width, canvas.height));
	game.system_manager.addSystem(new TLORM.System.UserInput());
	game.system_manager.addSystem(new TLORM.System.Scoring());
	game.start();
}

/*
 * ./Component/Card.js
 */



TLORM.Component.Card = function(value) {
	return {
		type: 'Card',
		value: value,
		face_up: false,
		matched: false
	};
};