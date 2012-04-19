
TLORM.QuickEntity.Camera = function(game, name, x, y, w, h, offset_x, offset_y) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Camera(offset_x, offset_y)
		], x, y, w, h)
	);
};