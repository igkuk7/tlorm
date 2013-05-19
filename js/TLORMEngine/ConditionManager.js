TLORMEngine.ConditionManager = function() {
	this.conditions_by_name = {};
};


TLORMEngine.ConditionManager.prototype.addCondition = function(condition) {
	this.conditions_by_name[condition.name] = condition;
};

TLORMEngine.ConditionManager.prototype.check_conditions = function(entity, conditions) {
	var expected = conditions.length;
	var found = 0;
	for (var i=0; i<conditions.length; ++i) {
		if (!this.conditions_by_name[conditions[i]]) {
			throw "Unknown Condition: "+conditions[i];
		}
		if (this.conditions_by_name[conditions[i]].isTrue(entity)) {
			++found;
		}
	}

	return found == expected;
};