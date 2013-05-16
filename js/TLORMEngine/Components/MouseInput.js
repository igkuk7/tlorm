// DEPENDENCY: Component.js

TLORMEngine.Components.MouseInput = function(args) {
	args.type = 'MouseInput';
	TLORMEngine.Components.Component.call(this, args);
	
	this.move = args.move || null;
};

// inherit from normal component
TLORMEngine.Components.MouseInput.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.MouseInput.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  { move: { type: "TLORM_ANY_COMPONENT" }, click: { type: "TLORM_ANY_COMPONENT" }, };
	return TLORMEngine.Utils.merge_objects(super_args, args);
};