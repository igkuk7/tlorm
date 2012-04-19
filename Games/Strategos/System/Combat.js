

TLORM.System.Combat = function() {
	var turn = 0;
	return {
		type: 'Combat',
		update: function(game) {
			
			/* check for combat entities that are completely surrounded and 'kill' them */
			var entities = game.entity_manager.getEntitiesByType('Combat');
			for (var i=0; i<entities.length; ++i) {
				var entity = entities[i];
				if (this.surrounded(game, entity, entities)) {
					game.entity_manager.removeEntity(entity);
					entities.splice(i, 1);
				}
			}
		},
		surrounded: function(game, entity, entities) {
			
			var grid = game.entity_manager.getEntitiesByType('Grid')[0];
			var grid_data = grid.getComponentByType('Grid'); 
			
			/* check if entity is surrounded */
			var entity_combat = entity.getComponentByType('Combat');
			var surrounded_cells = {};
			surrounded_cells[(entity.x-1)+","+(entity.y)  ] = 1;
			surrounded_cells[(entity.x)  +","+(entity.y-1)] = 1;
			surrounded_cells[(entity.x+1)+","+(entity.y)  ] = 1;
			surrounded_cells[(entity.x)  +","+(entity.y+1)] = 1;
			
			/* edges count as surrounded */
			if (entity.x-1 < 0)            { surrounded_cells[(entity.x-1)+","+(entity.y)  ] = 2; }
			if (entity.x+1 >= grid_data.w) { surrounded_cells[(entity.x+1)+","+(entity.y)  ] = 2; }
			if (entity.y-1 < 0)            { surrounded_cells[(entity.x)+","+(entity.y-1)  ] = 2; }
			if (entity.y+1 >= grid_data.h) { surrounded_cells[(entity.x)+","+(entity.y+1)  ] = 2; }
			
			/* walls count as surrounded */
			var surroundings = entities.slice(0);
			var walls = game.entity_manager.getEntitiesByType('Physics');
			for (var i=0; i<walls.length; ++i) {
				var physics = walls[i].getComponentByType('Physics');
				if (physics && physics.can_collide) {
					surroundings.push(walls[i]);
				}
			}
			

			for (var i=0; i<surroundings.length; ++i) {
				var checking_entity        = surroundings[i];
				var checking_entity_combat = checking_entity.getComponentByType('Combat');
				if (surrounded_cells[checking_entity.x+","+checking_entity.y] && (!checking_entity_combat || checking_entity_combat.code != entity_combat.code)) {
					++surrounded_cells[checking_entity.x+","+checking_entity.y];
				}
			}
			
			/* if all cells are filled then entity is surrounded */
			for (var cell in surrounded_cells) {
				if (!surrounded_cells[cell] || surrounded_cells[cell] === 1) {
					entity_combat.been_hit = false;
					return false;
				}
			}
			entity_combat.been_hit = true;
			
			return true;
		}
	};
};