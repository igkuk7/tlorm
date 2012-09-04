
TLORM.Utility = {
	arrayToLookupHash: function(array) {
		var hash = {};
		for (var i=0; i<array.length; ++i) {
			hash[array[i]] = true;
		}
		return hash;
	}
};