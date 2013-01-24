
TLORM.QuickEntity.Spider = function(game, x, y, w, h) {
	return game.entity_manager.addEntity(
		new TLORM.Entity("spider", [
			TLORM.Component.Render(1, '#FF0'),
			TLORM.Component.UserControllable(),
		], x, y, w, h)
	);
};
