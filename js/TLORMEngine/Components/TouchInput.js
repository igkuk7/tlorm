// DEPENDENCY: Component.js

TLORMEngine.Components.TouchInput = function(args) {
	args.type = 'TouchInput';
	TLORMEngine.Components.Component.call(this, args);
	
	this.drag = args.drag || null;
};

// inherit from normal component
TLORMEngine.Components.TouchInput.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.TouchInput.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  { drag: { type: "TLORM_ANY_COMPONENT" }, touch: { type: "TLORM_ANY_COMPONENT" }, };
	return TLORMEngine.Utils.merge_objects(super_args, args);
};