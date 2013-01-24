
TLORM.QuickEntity.Terrain = function(game, name, x, y, z, w, h, d, col, height_map) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Position(x, y, z, w, h, d),
			TLORM.Component.Render(1, col),
			TLORM.Component.Terrain(height_map),
		])
	);
};