

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
