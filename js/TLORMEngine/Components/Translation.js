// DEPENDENCY: Component.js

TLORMEngine.Components.Translation = function(args) {
	args.type = 'Translation';
	args.multiple = true;
	TLORMEngine.Components.Component.call(this, args);

	if (this.acceleration) {
		this.current_speed = 0;
	}
};

// inherit from normal component
TLORMEngine.Components.Translation.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Translation.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		x: { type: "number", default: null },
		y: { type: "number", default: null },
		speed: { type: "number", default: null },
		acceleration: { type: "number", default: null },
		move_middle: { type: "boolean", default: false },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};


TLORMEngine.Components.Translation.prototype.getSpeed = function () {
	if (this.acceleration) {
		if (this.current_speed < this.speed) {
			this.current_speed += this.acceleration;
			if (this.current_speed > this.speed) {
				this.current_speed = this.speed;
			}
		}
		return this.current_speed;
	} else {
		return this.speed;
	}
}