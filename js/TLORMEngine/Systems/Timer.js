// DEPENDENCY: System.js

TLORMEngine.Systems.Timer = function(args) {
	args.type = 'Timer';
	TLORMEngine.Systems.System.call(this, args);
}
// inherit from normal system
TLORMEngine.Systems.Timer.extends(TLORMEngine.Systems.System);

TLORMEngine.Systems.Timer.prototype.componentsUsed = function() {
	var components = this.super.componentsUsed.call(this);
	components.Timer = true;
	return components;
};

TLORMEngine.Systems.Timer.prototype.update = function(screen, delta) {
	var entities = screen.getEntitiesByTypes(["Timer"]);
	for (var i = 0; i < entities.length; ++i) {
		var timer = entities[i].getComponentByType("Timer");
		timer.time_so_far += delta;
	}
};