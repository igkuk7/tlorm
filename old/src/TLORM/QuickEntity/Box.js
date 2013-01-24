
TLORM.QuickEntity.Box = function(game, name, x, y, z, w, h, d, col, image, collidable) {

	var components = [
		TLORM.Component.Position(x, y, z, w, h, d),
		TLORM.Component.Render(1, col),
	];
	if (image) {
		components.push(TLORM.Component.Texture(image, 0, 0, w, h));
	}
	if (collidable) {
		components.push(TLORM.Component.Collidable("box"));
	}
	
	return game.entity_manager.addEntity(new TLORM.Entity(name, components));
};