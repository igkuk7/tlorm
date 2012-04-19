
TLORM.QuickEntity.Map = function(game, name, x, y, w, h, map) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Render3D(1),
			TLORM.Component.Map(map)
		], x, y, w, h)
	);
};