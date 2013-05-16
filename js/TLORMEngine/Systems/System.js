
/* nothing in main system */
TLORMEngine.Systems.System = function(args) {
	this.type = args.type || 'System';
};

TLORMEngine.Systems.System.prototype.componentsUsed = function() {
	return {};
};