
/* just type in main component */
TLORMEngine.Components.Component = function(args) {
	this.type = args.type || 'Component';
	this.multiple = args.multiple || false;

	this.setArgs(args);
};

TLORMEngine.Components.Component.prototype.args_schema = function () {
	return {
	};
}
TLORMEngine.Components.Component.prototype.setArgs = function(args) {
	var args_schema = this.args_schema();
	for ( var key in args_schema ) {
		if (args[key] != undefined) {
			// TODO: some kind of validation here
			this[key] = args[key];
		} else if (args_schema[key].default != undefined) {
			this[key] = args_schema[key].default;
		}
	}
};

TLORMEngine.Components.Component.prototype.init = function(reset) {
};

TLORMEngine.Components.Component.prototype.entityDestroyed = function(game, entity) {
};

TLORMEngine.Components.Component.prototype.entityIsDestroyed = function(game) {
	return true;
};