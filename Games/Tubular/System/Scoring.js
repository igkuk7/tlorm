

/* system to render tubes */
TLORM.System.Scoring = function() {
	var scores = [];
	return {
		type: 'Scoring',
		update: function(game) {

			/* get tube container */
			var container_entity = (game.entity_manager.getEntitiesByType('TubeRowContainer'))[0];
			var container = container_entity.getComponentByType('TubeRowContainer');
			
			/* update score based on moves */
			scores[container_entity.name] = container.rows.length * container.end.length * 100 - ( container.moves * 50 ) - ( container.fills * 25 );
			
			/* check if game is over */
			if (container.rows_being_flipped == 0) {
				var misses = container.end.length;
				for (var i=0; i<container.end.length; ++i) {
					if (container.filling[container.end[i]] && container.end[i] === container.getPosition(-1, i)) {
						--misses;
					}
				}
				if (misses === 0) {
					game.gameOver(true, scores[container_entity.name]);
				}
			}
		}
	};
};
