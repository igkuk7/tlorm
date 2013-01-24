

TLORM.Component.Render3D = function(z, fill_colour, stroke_colour, highlight_alpha, other_fill_colour) {
	return {
		type: 'Render3D',
		z: z,
		highlight_alpha: highlight_alpha,
		fill_colour: fill_colour,
		other_fill_colour: other_fill_colour,
		stroke_colour: stroke_colour,
		show_name: false
	};
};