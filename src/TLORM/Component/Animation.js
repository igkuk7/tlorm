

TLORM.Component.Animation = function(steps, on_start, on_step, on_end) {
	return {
		type: 'Animation',
		system: 'Animation',
		on_start: on_start,
		on_step: on_step,
		on_end: on_end,
		step: 0,
		steps: steps
	};
};