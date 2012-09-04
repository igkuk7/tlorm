
TLORM.QuickEntity.Grid = function(game, name, x_start, x_end, x_step, y_start, y_end, y_step, z_start, z_end, z_step) {
	for (var x=x_start; x<=x_end; x+=x_step) {
		for (var y=y_start; y<=y_end; y+=y_step) {
			for (var z=z_start; z<=z_end; z+=z_step) {
				game.entity_manager.addEntity(
					new TLORM.Entity(name, [
						TLORM.Component.Position(x, y, z, 1, 1, 1),
						TLORM.Component.Render(1, 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)'),
					])
				);
			}
		}
	}
};