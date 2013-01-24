

TLORM.System.Debug = function(component_types) {
	return {
		type: 'Debug',
		component_types : component_types ,
		update: function(game) {
			
			/* debug info on all entities that have all the required component types, or all */
			var entities = [];
			if (!this.component_types) {
				entities = game.entity_manager.getEntities();
			}
			

			for (var i=0; i<entities.length; ++i) {
				console.log("Entity: "+entities[i].name);
			}
		}
	};
};