

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