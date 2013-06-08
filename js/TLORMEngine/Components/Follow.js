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
		dx: { type: "number", default: null },
		dy: { type: "number", default: null },
		dz: { type: "number", default: null },
		move_middle: { type: "boolean", default: false },
		fixed: { type: "boolean", default: false },
		invert: { type: "boolean", default: false },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};