
TLORM.QuickEntity.World = function(game, w, h) {
	return game.entity_manager.addEntity(
		new TLORM.Entity("world", [
			TLORM.Component.Render(1, '#000'),
		], 0, 0, w, h)
	);
};
