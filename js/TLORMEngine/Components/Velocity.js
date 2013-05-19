// DEPENDENCY: Component.js

TLORMEngine.Components.Velocity = function(args) {
	args.type = 'Velocity';
	args.multiple = true;
	TLORMEngine.Components.Component.call(this, args);

	// set current speeds so we can accelerate if needed
	this.cdx = this.dx;
	if (this.ax != null) {
		this.cdx = 0;
		this.constant = true;
	}
	this.cdy = this.dy;
	if (this.ay != null) {
		this.cdy = 0;
		this.constant = true;
	}
	this.cdz = this.dz;
	if (this.az != null) {
		this.cdz = 0;
		this.constant = true;
	}
	this.stopped = false;
};

// inherit from normal component
TLORMEngine.Components.Velocity.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Velocity.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		dx: { type: "number", default: null },
		dy: { type: "number", default: null },
		dz: { type: "number", default: null },
		ax: { type: "number", default: null },
		ay: { type: "number", default: null },
		az: { type: "number", default: null },
		constant: { type: "boolean", default: false },
		skip_delta: { type: "boolean", default: false },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};

TLORMEngine.Components.Velocity.prototype.getDX = function() {
	return this.cdx;
};
TLORMEngine.Components.Velocity.prototype.getDY = function() {
	return this.cdy;
};
TLORMEngine.Components.Velocity.prototype.getDZ = function() {
	return this.cdz;
};


TLORMEngine.Components.Velocity.prototype.accelerate = function() {
	if (this.stopped) {
		return;
	}
	if (this.ax != null) {
		this.cdx += this.ax;
		if ((this.cdx > 0 && this.cdx > this.dx) || (this.cdx < 0 && this.cdx < this.dx)) {
			this.cdx = this.dx;
			this.constant = false;
		}
	}
	if (this.ay != null) {
		this.cdy += this.ay;
		if ((this.cdx > 0 && this.cdy > this.dy) || (this.cdy < 0 && this.cdy < this.dy)) {
			this.cdy = this.dy;
			this.constant = false;
		}
	}
	if (this.az != null) {
		this.cdz += this.az;
		if ((this.cdz > 0 && this.cdz > this.dz) || (this.cdz < 0 && this.cdz < this.dz)) {
			this.cdz = this.dz;
			this.constant = false;
		}
	}
};

TLORMEngine.Components.Velocity.prototype.change = function(dx, dy, dz) {
	if (dx) {
		this.cdx += dx;
	}
	if (dy) {
		this.cdy += dy;
	}
	if (dz) {
		this.cdz += dz;
	}
};

TLORMEngine.Components.Velocity.prototype.increase = function(dx, dy, dz) {
	if (dx) {
		if (this.cdx > 0) {
			this.cdx += dx;
		} else if (this.cdx < 0) {
			this.cdx -= dx;
		}
	}
	if (dy) {
		if (this.cdy > 0) {
			this.cdy += dy;
		} else if (this.cdy < 0) {
			this.cdy -= dy;
		}
	}
	if (dz) {
		if (this.cdz > 0) {
			this.cdz += dz;
		} else if (this.cdz < 0) {
			this.cdz -= dz;
		}
	}
};

TLORMEngine.Components.Velocity.prototype.set = function(dx, dy, dz) {
	if (dx) {
		this.cdx = dx;
	}
	if (dy) {
		this.cdy = dy;
	}
	if (dz) {
		this.cdz = dz;
	}
};

TLORMEngine.Components.Velocity.prototype.stop = function() {
	this.cdx = 0;
	this.cdy = 0;
	this.cdz = 0;
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
};