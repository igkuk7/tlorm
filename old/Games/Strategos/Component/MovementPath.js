

TLORM.Component.MovementPath = function(destination, via, distance, step_delay) {
	
	return {
		type: 'MovementPath',
		steps: [],
		destination: destination,
		via: via,
		distance: distance || 0,
		current_step: -1,
		step_delay: step_delay || 2,
		current_step_delay: 0
	};
};