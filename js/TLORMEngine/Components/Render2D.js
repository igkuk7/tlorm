// DEPENDENCY: Component.js

TLORMEngine.Components.Render2D = function(args) {
	args.type = 'Render2D';
	TLORMEngine.Components.Component.call(this, args);
};

// inherit from normal component
TLORMEngine.Components.Render2D.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Render2D.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		fill_colour: { type: "string" },
		stroke_colour: { type: "string" },
		show_name: { type: "boolean" },
		z: { type: "number", default: 5 },
		as_line: { type: "boolean", default: false },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};