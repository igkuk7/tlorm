// DEPENDENCY: Component.js

TLORMEngine.Components.Velocity = function(args) {
	args.type = 'Velocity';
	TLORMEngine.Components.Component.call(this, args);
	this.checkMax();
};

// inherit from normal component
TLORMEngine.Components.Velocity.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Velocity.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		dx: { type: "number", default: 0 },
		dy: { type: "number", default: 0 },
		dz: { type: "number", default: null },
		max_dx: { type: "number", default: null },
		max_dy: { type: "number", default: null },
		max_dz: { type: "number", default: null },
		constant: { type: "boolean", default: false },
		skip_delta: { type: "boolean", default: false },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};

TLORMEngine.Components.Velocity.prototype.getDX = function() {
	return this.dx;
};
TLORMEngine.Components.Velocity.prototype.getDY = function() {
	return this.dy;
};
TLORMEngine.Components.Velocity.prototype.getDZ = function() {
	return this.dz;
};

TLORMEngine.Components.Velocity.prototype.checkMax = function() {
	if (this.max_dx != null) {
		if (this.dx > 0 && this.dx > this.max_dx) {
			this.dx = this.max_dx;
		} else 
		if (this.dx < 0 && this.dx < -this.max_dx) {
			this.dx = -this.max_dx;
		}
	}
	if (this.max_dy != null) {
		if (this.dy > 0 && this.dy > this.max_dy) {
			this.dy = this.max_dy;
		} else 
		if (this.dy < 0 && this.dy < -this.max_dy) {
			this.dy = -this.max_dy;
		}
	}
	if (this.max_dz != null) {
		if (this.dz > 0 && this.dz > this.max_dz) {
			this.dz = this.max_dz;
		} else 
		if (this.dz < 0 && this.dz < -this.max_dz) {
			this.dz = -this.max_dz;
		}
	}
};

TLORMEngine.Components.Velocity.prototype.change = function(dx, dy, dz) {
	if (dx != null && dx != undefined) {
		this.dx += dx;
	}
	if (dy != null && dy != undefined) {
		this.dy += dy;
	}
	if (dz != null && dz != undefined) {
		this.dz += dz;
	}
	this.checkMax();
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
	this.checkMax();
};

TLORMEngine.Components.Velocity.prototype.set = function(dx, dy, dz) {
	if (dx != null && dx != undefined) {
		this.dx = dx;
	}
	if (dy != null && dy != undefined) {
		this.dy = dy;
	}
	if (dz != null && dz != undefined) {
		this.dz = dz;
	}
	this.checkMax();
};

TLORMEngine.Components.Velocity.prototype.stop = function() {
	this.dx = 0;
	this.dy = 0;
	this.dz = 0;
	this.stopped = true;
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
	this.checkMax();
};