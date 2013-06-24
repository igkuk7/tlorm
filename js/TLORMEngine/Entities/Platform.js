// DEPENDENCY: Entity.js

TLORMEngine.Entities.Platform = function(args) {
	TLORMEngine.Entities.Entity.call(this, args);
};

// inherit from normal entity
TLORMEngine.Entities.Platform.extends(TLORMEngine.Entities.Entity);

TLORMEngine.Entities.Platform.prototype.init = function(args) {
	TLORMEngine.Entities.Entity.prototype.init.call(this, args);

	// set components to make a platform
	this.addComponent(new TLORMEngine.Components.Position({ x: args.x, y: args.y, w: args.w, h: args.h }));
	this.addComponent(new TLORMEngine.Components.Render2D({ fill_colour: args.fill_colour, z: args.z }));
	this.addComponent(new TLORMEngine.Components.Collision({ group: "platform", groups: [] }));
	this.addComponent(new TLORMEngine.Components.Friction({ friction: 5 }));
};