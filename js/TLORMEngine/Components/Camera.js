// DEPENDENCY: Component.js

TLORMEngine.Components.Camera = function(args) {
	args.type = 'Camera';
	TLORMEngine.Components.Component.call(this, args);
};

// inherit from normal component
TLORMEngine.Components.Camera.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Camera.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		fov: { type: "number", default: 0 },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};