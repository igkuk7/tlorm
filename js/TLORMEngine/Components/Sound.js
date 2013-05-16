// DEPENDENCY: Component.js

TLORMEngine.Components.Sound = function(args) {
	args.type = 'Sound';
	TLORMEngine.Components.Component.call(this, args);

	this.playing = false;
	this.play_count = 0;
};

// inherit from normal component
TLORMEngine.Components.Sound.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Sound.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		src: { type: "string" },
		loop: { type: "boolean", default: false },
		volume: { type: "double", default: 0.5 },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};

TLORMEngine.Components.Sound.prototype.play = function (screen) {
	if (this.playing) {
		return;
	}
	++this.play_count;
	this.playing = true;
	var sound = screen.resource_manager.getSound(this.src);
	var self = this;
	sound.addEventListener("ended", function() { self.stop(); }, false);
	sound.load(); // needed for chrome to play a sound more than once
	sound.volume = this.volume || 0.5;
	sound.play();
};

TLORMEngine.Components.Sound.prototype.stop = function () {
	this.playing = false;
};

TLORMEngine.Components.Sound.prototype.needsRemoving = function () {
	return !this.playing && !this.loop && this.play_count > 0;
};

TLORMEngine.Components.Sound.prototype.needsPlaying = function () {
	return true;
};

