// DEPENDENCY: System.js

TLORMEngine.Systems.Sound = function(args) {
	args.type = 'Sound';
	TLORMEngine.Systems.System.call(this, args);
}
// inherit from normal system
TLORMEngine.Systems.Sound.extends(TLORMEngine.Systems.System);

TLORMEngine.Systems.Sound.prototype.componentsUsed = function() {
	var components = this.super.componentsUsed.call(this);
	components.Sound = true;
	return components;
};

TLORMEngine.Systems.Sound.prototype.init = function(screen, reset) {
	// load the sound
}

TLORMEngine.Systems.Sound.prototype.update = function(screen, delta) {
	var entities = screen.getEntitiesByTypes(["Sound"]);
	for (var i = 0; i < entities.length; ++i) {
		var sound = entities[i].getComponentByType("Sound");
		if (sound.needsPlaying()) {
			sound.play(screen);
		}
		if (sound.needsRemoving()) {
			screen.removeEntityComponent(entities[i], sound);
		}
	}
};