
TLORM.QuickEntity.Player = function(game, name, x, y, w, h) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Cell(),
			TLORM.Component.Combat(1),
			TLORM.Component.Render(3,null, null, 0.75),
			TLORM.Component.Sprite("../../img/horsey_black.png", 0, 0, 288, 562, 0.18, -0.75, 1, 1.5),
			TLORM.Component.UserControllable(),
			//TLORM.Component.AI("Aggressive"),
			TLORM.Component.Physics(true, true)
		], x, y, w, h)
	);
};