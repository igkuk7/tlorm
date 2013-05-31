// DEPENDENCY: Component.js

TLORMEngine.Components.Acceleration = function(args) {
	args.type = 'Acceleration';
	TLORMEngine.Components.Component.call(this, args);
};

// inherit from normal component
TLORMEngine.Components.Acceleration.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Acceleration.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		dx: { type: "number", default: 0 },
		dy: { type: "number", default: 0 },
		dz: { type: "number", default: null },
		skip_delta: { type: "boolean", default: false },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};

TLORMEngine.Components.Acceleration.prototype.getDX = function() {
	return this.dx;
};
TLORMEngine.Components.Acceleration.prototype.getDY = function() {
	return this.dy;
};
TLORMEngine.Components.Acceleration.prototype.getDZ = function() {
	return this.dz;
};

TLORMEngine.Components.Acceleration.prototype.change = function(dx, dy, dz) {
	if (dx != null && dx != undefined) {
		this.dx += dx;
	}
	if (dy != null && dy != undefined) {
		this.dy += dy;
	}
	if (dz != null && dz != undefined) {
		this.dz += dz;
	}
};

TLORMEngine.Components.Acceleration.prototype.increase = function(dx, dy, dz) {
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

TLORMEngine.Components.Acceleration.prototype.set = function(dx, dy, dz) {
	if (dx != null && dx != undefined) {
		this.dx = dx;
	}
	if (dy != null && dy != undefined) {
		this.dy = dy;
	}
	if (dz != null && dz != undefined) {
		this.dz = dz;
	}
};

TLORMEngine.Components.Acceleration.prototype.stop = function() {
	this.dx = 0;
	this.dy = 0;
	this.dz = 0;
	this.stopped = true;
};