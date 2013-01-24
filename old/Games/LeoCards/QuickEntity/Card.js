
TLORM.QuickEntity.Card = function(game, name, bg_colour, colour, value, x, y, w, h) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Render(1, colour, null, null, bg_colour),
			TLORM.Component.Card(value),
		], x, y, w, h)
	);
};
