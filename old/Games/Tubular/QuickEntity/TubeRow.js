
TLORM.QuickEntity.TubeRow = function(game, name, x, y, w, h, cols, mapping, fixed) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Render(1, '#CCC', '#000'),
			TLORM.Component.TubeRow(cols, mapping, fixed)
		], x, y, w, h)
	);
};