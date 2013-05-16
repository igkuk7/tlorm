// DEPENDENCY: Component.js

TLORMEngine.Components.Velocity = function(args) {
	args.type = 'Velocity';
	args.multiple = true;
	TLORMEngine.Components.Component.call(this, args);
};

// inherit from normal component
TLORMEngine.Components.Velocity.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Velocity.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		dx: { type: "number", default: null },
		dy: { type: "number", default: null },
		dz: { type: "number", default: null },
		constant: { type: "boolean", default: false },
		skip_delta: { type: "boolean", default: false },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};

TLORMEngine.Components.Velocity.prototype.increase = function(dx, dy, dz) {
	if (dx) {
		if (this.dx > 0) {
			this.dx += dx;
		} else if (this.dx < 0) {
			this.dx -= dx;
		}
	}
	if (dy) {
		if (this.dy > 0) {
			this.dy += dy;
		} else if (this.dy < 0) {
			this.dy -= dy;
		}
	}
	if (dz) {
		if (this.dz > 0) {
			this.dz += dz;
		} else if (this.dz < 0) {
			this.dz -= dz;
		}
	}
};

TLORMEngine.Components.Velocity.prototype.set = function(dx, dy, dz) {
	if (dx) {
		this.dx = dx;
	}
	if (dy) {
		this.dy = dy;
	}
	if (dz) {
		this.dz = dz;
	}
};

TLORMEngine.Components.Velocity.prototype.setRandom = function(min_x, max_x, min_y, max_y, min_z, max_z) {
	if (min_x && max_x) {
		this.dx = TLORMEngine.Utils.random_number_in_range(min_x, max_x);
	}
	if (min_y && max_y) {
		this.dy = TLORMEngine.Utils.random_number_in_range(min_y, max_y);
	}
	if (min_z && max_z) {
		this.dz = TLORMEngine.Utils.random_number_in_range(min_z, max_z);
	}
};