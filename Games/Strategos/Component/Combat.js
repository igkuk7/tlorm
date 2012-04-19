

TLORM.Component.Combat = function(code) {
	return {
		type: 'Combat',
		
		/* use codes to determine which combat effects which, so can't hurt yourself */
		code: code,
		/* TODO: add flags to determine Combat behaviour */
		been_hit: false,
		hit_animation: 0,
		hit_animation_limit: 10,
	};
};