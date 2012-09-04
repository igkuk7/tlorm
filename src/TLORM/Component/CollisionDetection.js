

TLORM.Component.CollisionDetection = function(group, callback) {
	return {
		type: 'CollisionDetection',
		system: 'Collision',
		group: group,
		callback: callback,
	};
};