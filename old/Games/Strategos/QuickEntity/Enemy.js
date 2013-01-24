
TLORM.QuickEntity.Enemy = function(game, name, x, y, w, h, ai_type) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Cell(),
			TLORM.Component.Combat(2),
			TLORM.Component.Render(2),
			TLORM.Component.Sprite("../../img/horsey_white.png", 0, 0, 288, 562, 0.18, -0.75, 1, 1.5),
			TLORM.Component.AI(ai_type),
			TLORM.Component.Physics(true, true)
		], x, y, w, h)
	);
};