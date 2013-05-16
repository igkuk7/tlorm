// DEPENDENCY: System.js

TLORMEngine.Systems.Particle = function(args) {
	args.type = 'Particle';
	TLORMEngine.Systems.System.call(this, args);
	this.delta_modifier = 50;
}

// inherit from normal system
TLORMEngine.Systems.Particle.extends(TLORMEngine.Systems.System);

TLORMEngine.Systems.Particle.prototype.componentsUsed = function() {
	var components = this.super.componentsUsed.call(this);
	components.Particles = true;

	return components;
};

TLORMEngine.Systems.Particle.prototype.update = function(screen, delta) {
	var entities = screen.getEntitiesByTypes(["Particles"]);
	for (var i = 0; i < entities.length; ++i) {
		var particles = entities[i].getComponentByType("Particles");
		particles.decayAll();
		particles.moveAll(delta*this.delta_modifier, delta*this.delta_modifier);
	}
};