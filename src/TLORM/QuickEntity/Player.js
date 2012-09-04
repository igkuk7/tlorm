
TLORM.QuickEntity.Player = function(game, name, x, y, z, w, h, d, col, collission_callback) {
	var components = [
		TLORM.Component.Position(x, y, z, w, h, d),
		TLORM.Component.Render(2, col),
		TLORM.Component.Collidable("player"),
		TLORM.Component.CollisionDetection("box", collission_callback),
	];
	
	return game.entity_manager.addEntity(new TLORM.Entity(name, components));
};