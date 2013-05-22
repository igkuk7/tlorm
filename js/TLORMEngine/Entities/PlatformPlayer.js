// DEPENDENCY: OnPlatform.js

TLORMEngine.Entities.PlatformPlayer = function(game, args) {
	TLORMEngine.Entities.OnPlatform.call(this, game, args);
};

// inherit from onplatform entity
TLORMEngine.Entities.PlatformPlayer.extends(TLORMEngine.Entities.OnPlatform);

TLORMEngine.Entities.PlatformPlayer.prototype.init = function(args) {
	TLORMEngine.Entities.OnPlatform.prototype.init.call(this, args);

	// inputs for movement and jumping
	this.addComponent(new TLORMEngine.Components.KeyInput({
		map: {
			pressed_32: [
				{ type: "Velocity", args: { dy: -40, ay: -5 }, conditions: ["not_jumping", "is_standing"] },
				{ edit: true, type: "Data", function: "setData", function_args: ["jumping",  true ],  conditions: ["not_jumping", "is_standing"] },
				{ edit: true, type: "Data", function: "setData", function_args: ["falling",  true ],  conditions: ["is_jumping"] },
				{ edit: true, type: "Data", function: "setData", function_args: ["standing", false ], conditions: ["is_jumping"] },
			],
			37: [ { type: "Velocity", args: { dx: -5 } } ],
			39: [ { type: "Velocity", args: { dx: 5 } } ],
		}
	}));
}