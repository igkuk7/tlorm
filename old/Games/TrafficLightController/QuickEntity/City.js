
TLORM.QuickEntity.City = function(game, name, x, y, w, h, map, map_w) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Render(1),
			TLORM.Component.City(map, map_w)
		], x, y, w, h)
	);
};