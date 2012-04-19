
TLORM.QuickEntity.TubeRowContainer = function(game, level_file, name, x, y, w, h, rows, end) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(level_file, [
			TLORM.Component.Render(1, null, '#000'),
			TLORM.Component.TubeRowContainer(rows, end, ['#F00', '#0F0', '#00F', '#FF0', '#0FF', '#B4B', '#BB4', '#4BB', '#44B', '#B44', '#4B4' ])
		], x, y, w, h)
	);
};