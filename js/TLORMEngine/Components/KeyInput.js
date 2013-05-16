// DEPENDENCY: Component.js

TLORMEngine.Components.KeyInput = function(args) {
	args.type = 'KeyInput';
	TLORMEngine.Components.Component.call(this, args);
};

// inherit from normal component
TLORMEngine.Components.KeyInput.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.KeyInput.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		map: { type: "object", default: {} },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};
