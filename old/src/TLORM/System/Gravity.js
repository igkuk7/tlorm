

TLORM.System.Gravity = function(g) {
	return {
		type: 'Gravity',
		g: g || 10,
		init: function(game) {},
		update: function(game) {
			var mass_entities = this.getEntitiesWithMass(game);
		},
		getEntitiesWithMass: function(game) {
			return game.entity_manager.getEntitiesByType('Mass');
		},
	};
};