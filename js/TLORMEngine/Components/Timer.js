// DEPENDENCY: Component.js

TLORMEngine.Components.Timer = function(args) {
	args.type = 'Timer';
	TLORMEngine.Components.Component.call(this, args);

	this.time_so_far = 0;
};

// inherit from normal component
TLORMEngine.Components.Timer.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Timer.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		time: { type: "number" },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};

TLORMEngine.Components.Timer.prototype.init = function(reset) {
	if (reset) {
		this.time_so_far = 0;
	}
};

TLORMEngine.Components.Timer.prototype.addTime = function(delta) {
	this.time_so_far = delta;
};

TLORMEngine.Components.Timer.prototype.done = function(delta) {
	return this.time_so_far >= this.time;
};