// DEPENDENCY: Component.js

TLORMEngine.Components.Particles = function(args) {
	args.type = 'Particles';
	TLORMEngine.Components.Component.call(this, args);

	this.particles = [];
};

// inherit from normal component
TLORMEngine.Components.Particles.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Particles.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		count: { type: "number", default: 10 },
		min_life: { type: "number", default: 5 },
		max_life: { type: "number", default: 10 },
		min_speed_x: { type: "number", default: -2 },
		max_speed_x: { type: "number", default: 2 },
		min_speed_y: { type: "number", default: -2 },
		max_speed_y: { type: "number", default: 2 },
		min_size: { type: "number", default: 1 },
		max_size: { type: "number", default: 5 },
		decay: { type: "number", default: 1 },
		infinite: { type: "boolean", default: false },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};

TLORMEngine.Components.Particles.prototype.init = function(reset) {
	if (reset) {
		for (var i=0; i<this.count; ++i) {
			this.particles.push(this.createParticle());
		}
	}
};

TLORMEngine.Components.Particles.prototype.createParticle = function() {
	return {
		x: 0, y: 0,
		life: this.min_life+(Math.random()*(this.max_life-this.min_life)),
		speed_x: this.min_speed_x+(Math.random()*this.max_speed_x*2),
		speed_y: this.min_speed_y+(Math.random()*this.max_speed_y*2),
		size: this.min_size+(Math.random()*(this.max_size-this.min_size)),
	};
};

TLORMEngine.Components.Particles.prototype.decayAll = function() {
	var particles = [];
	for (var i=0; i<this.particles.length; ++i) {
		var particle = this.particles[i];
		particle.life -= this.decay;
		if (particle.life > 0) {
			particles.push(particle);
		}
	}

	if (this.infinite) {
		for (var i=particles.length; i<this.count; ++i) {
			particles.push(this.createParticle());
		}
	}

	this.particles = particles;
};

TLORMEngine.Components.Particles.prototype.moveAll = function(dx, dy) {
	var particles = [];
	for (var i=0; i<this.particles.length; ++i) {
		var particle = this.particles[i];
		particle.x += particle.speed_x*dx;
		particle.y += particle.speed_y*dy;
	}
};
