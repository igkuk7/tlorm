// DEPENDENCY: Component.js

TLORMEngine.Components.Data = function(args) {
	args.type = 'Data';
	TLORMEngine.Components.Component.call(this, args);
	
	// TODO: make this not dynamic so args schema parsing works
	this.data = {};
	for (var key in args) {
		if (key != 'type') {
			this.data[key] = args[key];
		}
	}
};

// inherit from normal component
TLORMEngine.Components.Data.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Data.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		// TODO: make this work
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};

TLORMEngine.Components.Data.prototype.getData = function(key) {
	return this.data[key];
};

TLORMEngine.Components.Data.prototype.setData = function(key, value) {
	this.data[key] = value;
};

TLORMEngine.Components.Data.prototype.addToData = function(key, value) {
	this.data[key] += value;
};

