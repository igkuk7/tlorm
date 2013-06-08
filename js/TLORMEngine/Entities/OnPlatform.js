// DEPENDENCY: Entity.js

TLORMEngine.Entities.OnPlatform = function(args) {
	TLORMEngine.Entities.Entity.call(this, args);
};

// inherit from normal entity
TLORMEngine.Entities.OnPlatform.extends(TLORMEngine.Entities.Entity);

TLORMEngine.Entities.OnPlatform.prototype.init = function(args) {
	TLORMEngine.Entities.Entity.prototype.init.call(this, args);

	var game = args.game;

	// set components to make a platform
	this.addComponent(new TLORMEngine.Components.Position({ x: args.x, y: args.y, w: args.w, h: args.h }));
	this.addComponent(new TLORMEngine.Components.Render2D({ fill_colour: args.fill_colour, z: args.z }));
	this.addComponent(new TLORMEngine.Components.Render2D({ fill_colour: args.fill_colour, z: args.z }));
	this.addComponent(new TLORMEngine.Components.Gravity({ g: args.g || 2, }));
	this.addComponent(new TLORMEngine.Components.Velocity({ max_dx: args.max_dx || null }));
	this.addComponent(new TLORMEngine.Components.Acceleration({}));

	// setup some state data for collisions
	var data_component = this.getComponentByType("Data");
	if (data_component == null) {
		data_component = this.addComponent(new TLORMEngine.Components.Data({}));
	}
	data_component.setData("standing", false);
	data_component.setData("jumping", false);
	
	// create some common conditions
	if (!game.condition_manager.getCondition("is_standing")) {
		game.condition_manager.addCondition(new TLORMEngine.Conditions.Condition({
			name: "is_standing",
			type: "Data", function: "getData", function_args: ["standing"], check: "=", value: true,
		}));
	}
	if (!game.condition_manager.getCondition("not_standing")) {
		game.condition_manager.addCondition(new TLORMEngine.Conditions.Condition({
			name: "not_standing",
			type: "Data", function: "getData", function_args: ["standing"], check: "=", value: false,
		}));
	}
	if (!game.condition_manager.getCondition("is_jumping")) {
		game.condition_manager.addCondition(new TLORMEngine.Conditions.Condition({
			name: "is_jumping",
			type: "Data", function: "getData", function_args: ["jumping"], check: "=", value: true,
		}));
	}
	if (!game.condition_manager.getCondition("not_jumping")) {
		game.condition_manager.addCondition(new TLORMEngine.Conditions.Condition({
			name: "not_jumping",
			type: "Data", function: "getData", function_args: ["jumping"], check: "=", value: false,
		}));
	}
	if (!game.condition_manager.getCondition("has_landed")) {
		game.condition_manager.addCondition(new TLORMEngine.Conditions.Condition({
			name: "has_landed",
			type: "Position", function: "direction", function_args: [], check: "=", value: "down",
		}));
	}
	if (!game.condition_manager.getCondition("not_landed")) {
		game.condition_manager.addCondition(new TLORMEngine.Conditions.Condition({
			name: "not_landed",
			type: "Position", function: "direction", function_args: [], check: "!=", value: "down",
		}));
	}
	if (!game.condition_manager.getCondition("hit_head")) {
		game.condition_manager.addCondition(new TLORMEngine.Conditions.Condition({
			name: "hit_head",
			type: "Position", function: "direction", function_args: [], check: "=", value: "up",
		}));
	}

	// add collision handling
	this.addComponent(new TLORMEngine.Components.Collision({
		group: "on_platform", groups: [ "platform" ],
		resolutions: [
			{ // don't stop moving, but don't collide with things
				resolution: "push"
			},
			{ // stop moving when hit with head
				resolution: "push",
				conditions: [ "hit_head" ],
			},
			{ // stop moving when landed
				resolution: "push",
				conditions: [ "has_landed" ],
			},
			{ // no longer jumping if we have landed
				resolution: "edit_component", component: "Data", 
				function: "setData", function_args: [ "jumping", false ],
				conditions: [ "is_jumping", "has_landed" ],
			},
			{ // landed then standing
				resolution: "edit_component", component: "Data", 
				function: "setData", function_args: [ "standing", true ],
				conditions: [ "not_standing", "has_landed" ],
			}
		]
	}));
};