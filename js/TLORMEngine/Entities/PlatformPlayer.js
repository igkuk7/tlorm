// DEPENDENCY: OnPlatform.js

TLORMEngine.Entities.PlatformPlayer = function(game, args) {
	TLORMEngine.Entities.OnPlatform.call(this, game, args);
};

// inherit from onplatform entity
TLORMEngine.Entities.PlatformPlayer.extends(TLORMEngine.Entities.OnPlatform);

TLORMEngine.Entities.PlatformPlayer.prototype.init = function(args) {
	args.max_dx = args.max_dx || 10;
	TLORMEngine.Entities.OnPlatform.prototype.init.call(this, args);

	// inputs for movement and jumping
	this.addComponent(new TLORMEngine.Components.KeyInput({
		map: {
			pressed_32: [
				{ edit: true, type: "Acceleration", function: "set", function_args: [ null, -9 ], conditions: ["not_jumping", "is_standing"] },
				{ edit: true, type: "Data", function: "setData", function_args: ["jumping",  true ],  conditions: ["not_jumping", "is_standing"] },
				{ edit: true, type: "Data", function: "setData", function_args: ["standing", false ], conditions: ["is_jumping"] },
			],
			37: [ { edit: true, type: "Acceleration", function: "set", function_args: [ -1 ] } ],
			up_37: [
				{ edit: true, type: "Acceleration", function: "set", function_args: [ 0 ] },
				{ edit: true, type: "Velocity", function: "set", function_args: [ 0 ] }
			],
			39: [ { edit: true, type: "Acceleration", function: "set", function_args: [  1 ] } ],
			up_39: [
				{ edit: true, type: "Acceleration", function: "set", function_args: [ 0 ] },
				{ edit: true, type: "Velocity", function: "set", function_args: [ 0 ] }
			],
		}
	}));
}