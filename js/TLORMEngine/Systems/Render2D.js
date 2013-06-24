// DEPENDENCY: System.js

/* system to render components */
TLORMEngine.Systems.Render2D = function(args) {
	args.type = 'Render2D';
	TLORMEngine.Systems.System.call(this, args);

	// track current screen position for determines whether to render
	this.position = null;
}

// inherit from normal system
TLORMEngine.Systems.Render2D.extends(TLORMEngine.Systems.System);

TLORMEngine.Systems.Render2D.prototype.componentsUsed = function() {
	var components = this.super.componentsUsed.call(this);
	components.Render2D = true;
	components.Position = true;
	components.RenderData = true;
	components.Data = true;
	components.Particles = true;

	return components;
};

TLORMEngine.Systems.Render2D.prototype.moveContextToCamera = function(context, camera) {
	var camera_position = camera.getComponentByType("Position");
	context.translate(camera_position.x, camera_position.y);
	this.position = {
		x: camera_position.x,    y: -camera_position.y,
		w: context.canvas.width, h: context.canvas.height
	};
};

TLORMEngine.Systems.Render2D.prototype.setContextPosition = function(context) {
	this.position = {
		x: 0,                    y: 0,
		w: context.canvas.width, h: context.canvas.height
	};
};


TLORMEngine.Systems.Render2D.prototype.onScreen = function(position) {
	if (this.position == null) {
		return true;
	}
	return position.collides(this.position);
};

TLORMEngine.Systems.Render2D.prototype.render = function(screen, context) {
	// check for a camera and move context accordingly
	var cameras = screen.getEntitiesByTypes(["Camera", "Position"]);
	if (cameras.length > 1) {
		throw "Can have at most one camera";
	}
	var camera = cameras[0];
	if (camera) {
		context.save();
		this.moveContextToCamera(context, camera);
	} else {
		this.setContextPosition(context);
	}

	// order each loop by z
	var entities = screen.getEntitiesByTypes(["Render2D", "Position"]);
	entities.sort( function(a, b) { return a.getComponentByType("Render2D").z - b.getComponentByType("Render2D").z });
	var count = 0;
	for (var i = 0; i < entities.length; ++i) {
		var rendered = this.renderEntity(entities[i], context);
		if (rendered) {
			++count;
		}
	}
	
	var entities = screen.getEntitiesByTypes(["RenderData", "Data"]);
	for (var i = 0; i < entities.length; ++i) {
		this.renderEntityData(entities[i], context);
	}
	
	var entities = screen.getEntitiesByTypes(["Render2D", "Position", "Particles"]);
	entities.sort( function(a, b) { return a.getComponentByType("Render2D").z - b.getComponentByType("Render2D").z });
	for (var i = 0; i < entities.length; ++i) {
		this.renderParticles(entities[i], context);
	}

	if (camera) {
		context.restore();
	}
};

TLORMEngine.Systems.Render2D.prototype.renderEntity = function(entity, context) {
	var render = entity.getComponentByType("Render2D");
	var position = entity.getComponentByType("Position");

	if (!this.onScreen(position)) {
		return false;
	}

	if (render.fill_colour) {
		context.fillStyle = render.fill_colour;
		if (!render.as_line) {
			context.fillRect(position.x, position.y, position.w, position.h);
		}
	}
	if (render.stroke_colour) {
		context.stokeStyle = render.stroke_colour;
		if (render.as_line) {
			context.beginPath();
			context.moveTo(position.x, position.y);
			context.lineTo(position.x+position.w, position.y+position.h);
			context.stroke();
		} else {
			context.strokeRect(position.x, position.y, position.w, position.h);
		}
	}
	if (render.show_name) {
		context.font = "normal 12px Verdana";
		context.textBaseline = "bottom";
		context.fillStyle = "#000";
		context.fillText(entity.name, position.x, position.y);
	}

	return true;
};


TLORMEngine.Systems.Render2D.prototype.renderEntityData = function(entity, context) {
	var render = entity.getComponentByType("RenderData");
	var data = entity.getComponentByType("Data");

	context.font = "normal 12px Verdana";
	context.textBaseline = "bottom";
	context.fillStyle = render.colour;
	var y = render.y;
	for (var key in data.data) {
		context.fillText(key+": "+data.data[key], render.x, y);
		y += 12;
	}
	if (render.show_name) {
	}
};

TLORMEngine.Systems.Render2D.prototype.renderParticles = function(entity, context) {
	var render = entity.getComponentByType("Render2D");
	var particles = entity.getComponentByType("Particles");
	var position = entity.getComponentByType("Position");

	if (render.fill_colour) {
		context.fillStyle = render.fill_colour;
	}
	if (render.stroke_colour) {
		context.stokeStyle = render.stroke_colour;
	}
	if (render.show_name) {
		context.font = "normal 12px Verdana";
		context.textBaseline = "bottom";
		context.fillStyle = "#000";
		context.fillText(entity.name, position.x, position.y);
	}
	
	for (var i=0; i<particles.particles.length; ++i) {
		var particle = particles.particles[i];
		if (render.fill_colour) {
			context.fillRect(position.mx+particle.x, position.my+particle.y, particle.size, particle.size);
		}
		if (render.stroke_colour) {
			context.fillRect(position.mx+particle.x, position.my+particle.y, particle.size, particle.size);
		}
	}
};