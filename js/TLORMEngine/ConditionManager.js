TLORMEngine.ConditionManager = function() {
	this.conditions_by_name = {};
};


TLORMEngine.ConditionManager.prototype.addCondition = function(condition) {
	this.conditions_by_name[condition.name] = condition;
};

TLORMEngine.ConditionManager.prototype.getCondition = function(condition) {
	return this.conditions_by_name[condition] || null;
};

TLORMEngine.ConditionManager.prototype.check_conditions = function(entity, conditions) {
	var expected = conditions.length;
	var found = 0;
	for (var i=0; i<conditions.length; ++i) {
		var condition = this.getCondition(conditions[i]);
		if (!condition) {
			throw "Unknown Condition: "+conditions[i];
		}
		if (condition.isTrue(entity)) {
			++found;
		}
	}

	return found == expected;
};