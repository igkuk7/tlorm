

TLORM.Component.AITypes = ['Aggressive'];
TLORM.Component.AI = function(ai_type) {
	if (ai_type) {
		var found = false;
		for (var i=0; i<TLORM.Component.AITypes.length; i++) {
			if (TLORM.Component.AITypes[i] === ai_type) {
				found = true;
				break;
			}
		}
		if (!found) {
			throw "Invalid AI type: "+ai_type;
		}
	}
	
	return {
		type: 'AI',
		ai_type: ai_type,
		vision: 7,
		current_delay: 0 /* count of how long we've waited */
	};
};