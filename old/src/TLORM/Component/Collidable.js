

TLORM.Component.Collidable = function(group, ignore_groups) {
	return {
		type: 'Collidable',
		system: 'Collision',
		group: group,
		ignore_groups: TLORM.Utility.arrayToLookupHash(ignore_groups || []),
		ignoreGroup: function(group) {
			return ( this.ignore_groups[group] ? true : false );
		}
	};
};

