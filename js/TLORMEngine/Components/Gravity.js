// DEPENDENCY: Component.js

TLORMEngine.Components.Gravity = function(args) {
	args.type = 'Gravity';
	TLORMEngine.Components.Component.call(this, args);
};

// inherit from normal component
TLORMEngine.Components.Gravity.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Gravity.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		g: { type: "number", default: 10 },
		terminal_velocity: { type: "number", default: 100 },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};