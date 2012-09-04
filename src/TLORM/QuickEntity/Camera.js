
TLORM.QuickEntity.Camera = function(game, name, x, y, z, fov, follow, dx, dy, dz) {
	
	var components = [
		TLORM.Component.Position(x, y, z, 1, 1 ,1),
		TLORM.Component.Camera(fov)
	];
	if (follow) {
		components.push(TLORM.Component.Follow(follow, dx, dy, dz));
	}
	return game.entity_manager.addEntity(new TLORM.Entity(name, components));
};