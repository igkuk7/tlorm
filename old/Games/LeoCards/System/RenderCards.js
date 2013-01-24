

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
