

/* system to map user input to the various components */
TLORM.System.UserInput = function() {
	var s = 20;
	return {
		type: 'UserInput',
		touch_event: null,
		init: function(game) {
			/* register control callbacks for player */
			var system = this;
			game.registerEvent("touch", function(event) { system.clickHandler(event); } );
			game.registerEvent("click", function(event) { system.clickHandler(event); } );
		},
		clickHandler: function(event) {
			this.touch_event = event;
		},
		update: function(game) {
			if (this.touch_event) {
				var user = game.entity_manager.getEntitiesByType('UserControllable')[0];
				var moving = user.getComponentByType('Animation');
				if (moving) {
					game.entity_manager.removeEntityComponent(user, moving);
				}
				this.moveEntity(
					game, user,
					{
						x: Math.floor( this.touch_event.offsetX - user.w / 2 ),
						y: Math.floor( this.touch_event.offsetY - user.h / 2 )
					}
				);
				this.touch_event = null;
			}
		},
		moveEntity: function(game, entity, position) {
			var cx = entity.x - position.x;
			var cy = entity.y - position.y;
			var steps = Math.ceil(Math.max(Math.abs(cx)/s, Math.abs(cy)/s)) || 1;
			var dx = -cx/steps;
			var dy = -cy/steps;
			game.entity_manager.addEntityComponent(
				entity,
				TLORM.Component.Animation(
					steps,
					function(animation) {},
					function(animation, step) {
						game.entity_manager.addEntityComponent(
							entity,
							TLORM.Component.Transform(dx, dy)
						);
					},
					function(animation) {
						game.entity_manager.addEntityComponent(
							entity,
							TLORM.Component.Transform(null, null, null, null, position.x, position.y)
						);
					}
				)
			);
		},
	};
};
