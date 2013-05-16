// DEPENDENCY: Component.js

TLORMEngine.Components.AddComponentsOnEntityDestroyed = function(args) {
	args.type = 'AddComponentsOnEntityDestroyed';
	TLORMEngine.Components.Component.call(this, args);

	this.entity = null;
};

// inherit from normal component
TLORMEngine.Components.AddComponentsOnEntityDestroyed.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.AddComponentsOnEntityDestroyed.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		components: { type: "object" },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};

TLORMEngine.Components.AddComponentsOnEntityDestroyed.prototype.entityDestroyed = function(game, entity) {
	// add the required components
	for (var i=0; i<this.components.length; ++i) {
		var component = this.components[i];
		game.entity_manager.addEntityComponent(new TLORMEngine.Components[component.type](component.args));
	}
};

TLORMEngine.Components.AddComponentsOnEntityDestroyed.prototype.entityIsDestroyed = function(game) {
	return false;
};