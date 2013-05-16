// DEPENDENCY: Component.js

TLORMEngine.Components.Rotation = function(args) {
	args.type = 'Rotation';
	args.multiple = true;
	TLORMEngine.Components.Component.call(this, args);
};

// inherit from normal component
TLORMEngine.Components.Rotation.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Rotation.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		dx: { type: "number", default: 0 },
		dy: { type: "number", default: 0 },
		dz: { type: "number", default: 0 },
		constant: { type: "boolean", default: false },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};