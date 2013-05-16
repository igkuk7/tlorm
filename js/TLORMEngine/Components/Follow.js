// DEPENDENCY: Component.js

TLORMEngine.Components.Follow = function(args) {
	args.type = 'Follow';
	TLORMEngine.Components.Component.call(this, args);
};

// inherit from normal component
TLORMEngine.Components.Follow.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Follow.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		entity: { type: "string" },
		dx: { type: "number", default: 0 },
		dy: { type: "number", default: 0 },
		dz: { type: "number", default: 0 },
		move_middle: { type: "boolean", default: false },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};