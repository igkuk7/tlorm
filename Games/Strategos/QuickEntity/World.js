
TLORM.QuickEntity.World = function(game, name, colour, gx, gy, gw, gh) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			//TLORM.Component.Render(colour),
			TLORM.Component.Grid(gx, gy, gw, gh)
		], 0, 0, gx*gw, gy*gh)
	);
};