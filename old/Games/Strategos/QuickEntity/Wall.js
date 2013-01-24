
TLORM.QuickEntity.Wall = function(game, name, x, y, w, h) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Cell(),
			TLORM.Component.Render(1),
			TLORM.Component.Sprite("../../img/set_0.gif", 192, 192, 16, 16, 0, 0, 1, 1),
			TLORM.Component.Physics(true, false)
		], x, y, w, h)
	);
};