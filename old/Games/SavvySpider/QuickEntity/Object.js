
TLORM.QuickEntity.Object = function(game, name, colour, w, h, s, x1, y1, x2, y2) {
	var o = game.entity_manager.addEntity(
		new TLORM.Entity("name", [
			TLORM.Component.Render(1, colour),
		], x1, y1, w, h)
	);

	var cx = x1 - x2;
	var cy = y1 - y2;
	var steps = Math.ceil(Math.max(Math.abs(cx)/s, Math.abs(cy)/s)) || 1;
	var dx = -cx/steps;
	var dy = -cy/steps;

	game.entity_manager.addEntityComponent(
		o,
		TLORM.Component.Animation(
			steps,
			function(animation) {},
			function(animation, step) {
				game.entity_manager.addEntityComponent(
					o,
					TLORM.Component.Transform(dx, dy)
				);
			},
			function(animation) {
				game.entity_manager.removeEntity(o);
			}
		)
	);
};
