// DEPENDENCY: Component.js

TLORMEngine.Components.Collision = function(args) {
	args.type = "Collision";
	args.multiple = true;
	TLORMEngine.Components.Component.call(this, args);
	
	// TODO: remove this when args validation is done
	if (this.resolution) {
		var found = false;
		for (var i=0; i<this.resolutions.length; ++i) {
			if (this.resolutions[i] == args.resolution) {
				found = true;
				break;
			}
		}
		if (!found) {
			TLORMEngine.Utils.error("Not a valid collision resolution '"+args.resolution+"'");
		}
	}
};

// inherit from normal component
TLORMEngine.Components.Collision.extends(TLORMEngine.Components.Component);

TLORMEngine.Components.Collision.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		group: { type: "string", default: "no_group" },
		groups: { type: "array", default: "no_groups" },
		oncollide: { type: "object", default: null },
		resolutions: { type: "object", default: [] },
		resolution: { enum: this.resolutions, default: "" },
		entity: { type: "string", default: "" },
		component: { type: "string" },
		component_args: { type: "object" },
		position: { type: "string", default: "" },
		function: { type: "string" },		
		function_args: { type: "array", default: [] },
		directions: { type: "array", default: [] },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};

TLORMEngine.Components.Collision.prototype.resolutions = [
	"stop", "bounce", "push", "destroy", "destroy_hit", "destroy_both", "destroy_hit_and_bounce", "edit_component", "add_component"
];


TLORMEngine.Components.Collision.prototype.hasGroups = function() {
	if (this.groups.toString() == "no_groups") {
		return false;
	}

	if (this.groups.length > 0) {
		return true;
	}

	return false;
};

TLORMEngine.Components.Collision.prototype.collides = function(collision) {
	if (this.groups.toString() == "no_groups") {
		return false;
	}


	// TODO: make groups lookups
	for (var i=0; i<this.groups.length; ++i) {
		if (this.groups[i] == collision.group) {
			return true;
		}
	}
	return false;
};

TLORMEngine.Components.Collision.prototype.collidingDirection = function(position) {
	if (this.directions.length > 0) {
		var direction = position.direction();
		if (direction == "") {
			return false;
		}

		// TODO: make directions lookups
		var valid_direction = false;
		for (var i=0; i<this.directions.length; ++i) {
			if (this.directions[i] == direction) {
				valid_direction = true;
				break;
			}
		}

		// if not a valid collision direction, can return false now
		if (!valid_direction) { 
			return false;
		}
	}

	return true;
};

