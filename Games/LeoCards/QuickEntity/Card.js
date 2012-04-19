
TLORM.QuickEntity.Card = function(game, name, colour, value, x, y, w, h) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Render(1, value, null, null, colour),
			TLORM.Component.Card(value),
		], x, y, w, h)
	);
};