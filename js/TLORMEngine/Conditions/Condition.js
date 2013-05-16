
TLORMEngine.Conditions.Condition = function(args) {
	this.name = args.name;
	this.setArgs(args);
};

TLORMEngine.Conditions.Condition.prototype.args_schema = function () {
	return {
		type: { type: "string", default: "" },
		function: { type: "string" },		
		function_args: { type: "array", default: [] },
		check: { type: "string", default: "" },
		value: { type: "string", default: "" },
	};
}
TLORMEngine.Conditions.Condition.prototype.setArgs = function(args) {
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

TLORMEngine.Conditions.Condition.prototype.isTrue = function(entity) {
	var component = entity.getComponentByType(this.type);
	var test_value = component[this.function].apply(component, this.function_args);
	var value = this.value;
	return this.checkValues(this.check, value, test_value);

};

TLORMEngine.Conditions.Condition.prototype.checkValues = function(check, desired, actual) {
	if (check == "<") {
		return actual < desired;
	} else if (check == ">") {
		return actual > desired;
	} else if (check == "<=") {
		return actual <= desired;
	} else if (check == ">=") {
		return actual >= desired;
	} else if (check == "=") {
		return actual == desired;
	}
};