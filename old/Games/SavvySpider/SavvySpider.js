
/*
 * ./QuickEntity/Spider.js
 */


TLORM.QuickEntity.Spider = function(game, x, y, w, h) {
	return game.entity_manager.addEntity(
		new TLORM.Entity("spider", [
			TLORM.Component.Render(1, '#FF0'),
			TLORM.Component.UserControllable(),
		], x, y, w, h)
	);
};

/*
 * ./QuickEntity/Object.js
 */


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

/*
 * ./QuickEntity/Level.js
 */


TLORM.QuickEntity.Level = function(game, name) {

	TLORM.QuickEntity.Object(game, "object1", "#F0F", 10, 10, 10, 50, -50, 50, 500);
};

/*
 * ./QuickEntity/World.js
 */


TLORM.QuickEntity.World = function(game, w, h) {
	return game.entity_manager.addEntity(
		new TLORM.Entity("world", [
			TLORM.Component.Render(1, '#000'),
		], 0, 0, w, h)
	);
};

/*
 * ./System/UserInput.js
 */



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

/*
 * ./System/Render.js
 */



/* system to render everything */
TLORM.System.Render = function(context, w, h) {
	return {
		type: 'Render',
		context: context,
		w: w,
		h: h,
		update: function(game) {
			
			/* clear everything */
			this.context.clearRect(0, 0, this.w, this.h);
			
			/* render entities */
			var entities = this.getEntities(game);
			for (var i=0; i<entities.length; ++i) {
				this.renderEntity(entities[i]);
			}
		},
		renderEntity: function(entity) {
			var render = entity.getComponentByType('Render');
			this.context.fillStyle = render.fill_colour;
			this.context.fillRect(entity.x, entity.y, entity.w, entity.h);
		},
		getEntities: function(game) {
			return game.entity_manager.getEntitiesByType('Render');
		}
	};
};

/*
 * ./main.js
 */


window.onload = function() {
	setup_game();
};

function setup_game() {
	var canvas = document.getElementById("tlorm_game_canvas");
	var game = new TLORM.Game("SavvySpider", canvas);
	
	/* Setup entities */
	var world = TLORM.QuickEntity.World(game, 500, 500);
	var spider = TLORM.QuickEntity.Spider(game, 10, 10, 20, 20);
	game.setSize(world.w, world.h);

	TLORM.QuickEntity.Object(game, "object1", "#F0F", 10, 10, 4, 50, -50, 50, 600);
	TLORM.QuickEntity.Object(game, "object2", "#0FF", 20, 20, 5, 150, -50, 150, 600);
	TLORM.QuickEntity.Object(game, "object2", "#0FF", 20, 20, 5, 15, -50, 450, 600);
	
	/* Setup systems */
	game.render_system_manager.addSystem(new TLORM.System.Render(game.canvasContext(), canvas.width, canvas.height));
	game.system_manager.addSystem(new TLORM.System.UserInput());
	
	/* start the game */
	game.start();
};


/*
 * ./Component/UserControllable.js
 */



TLORM.Component.UserControllable = function() {
	return {
		type: 'UserControllable',
		/* no real data to go in this, perhaps in future can define control setup, for now assume mouse */
	};
};
