// DEPENDENCY: Component.js

TLORMEngine.Components.Friction = function(args) {
	args.type = 'Friction';
	TLORMEngine.Components.Component.call(this, args);
};

// inherit from normal component
TLORMEngine.Components.Friction.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Friction.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		friction: { type: "number", default: 10 },
		terminal_velocity: { type: "number", default: 100 },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};