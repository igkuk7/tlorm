// DEPENDENCY: Component.js

TLORMEngine.Components.RenderData = function(args) {
	args.type = 'RenderData';
	TLORMEngine.Components.Component.call(this, args);
};

// inherit from normal component
TLORMEngine.Components.RenderData.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.RenderData.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		colour: { type: "string", default: "#000000" },
		x: { type: "number", default: null },
		y: { type: "number", default: null },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};