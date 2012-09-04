

TLORM.Component.Follow = function(follow, dx, dy, dz) {
	return {
		type: 'Follow',
		follow: follow,
		dx: dx || 0,
		dy: dy || 0,
		dz: dz || 0,
	};
};