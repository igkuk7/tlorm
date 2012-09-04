
var TLORM = TLORM || {};

TLORM.Math = {
	TwoPI: Math.PI*2,
	AngleConversion: 180/Math.PI,
	radians_to_degrees: function(angle) {
		return angle*TLORM.Math.AngleConversion;
	},
	degrees_to_radians: function(angle) {
		return angle*(1/TLORM.Math.AngleConversion);
	},
	line_from_point_and_angle: function(x, y, a) {
		var s = Math.tan(a);
		var c = y - (s*x);
		

		var start = new TLORM.Math.Point(x,y);
		var end = new TLORM.Math.Point(0, c);
		return new TLORM.Math.Line(start, end);
	},
	add_angles: function(a1, a2) {
		return (a1+a2)%TLORM.Math.TwoPI;
	}
};


/* POINT */

TLORM.Math.Point = function(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
};

TLORM.Math.Point.prototype.copy = function() {
	return new TLORM.Math.Point(this.x, this.y, this.z);
};


TLORM.Math.Point.prototype.equals = function(point) {
	if (this.x == point.x && this.y == point.y) {
		if (   (this.z == null && point.z == null)
		    || (this.z != null && point.z != null && this.z == point.z)
		) {
			return true;
		}
	} else {
		return false;
	}
};

/* from: http://stackoverflow.com/a/2259502/41468 */
TLORM.Math.Point.prototype.rotate = function(angle, point) {
	if (angle == 0) return;
	
	/* translate so rotation point is origin */
	this.x -= point.x;
	this.y -= point.y;

	/* rotate point */
	var s = Math.sin(TLORM.Math.degrees_to_radians(angle));
	var c = Math.cos(TLORM.Math.degrees_to_radians(angle));
	this.x = this.x * c - this.y * s;
	this.y = this.x * s - this.y * c;
	
	/* translate point back */
	this.x += point.x;
	this.y += point.y;
	
	return this;
};

TLORM.Math.Point.prototype.nearest = function(points, n) {
	points = points.slice(0);
	points.sort(function(a,b) {
		var line_a = new TLORM.Math.Line(this, a);
		var line_b = new TLORM.Math.Line(this, b);
		line_a.length(true) - line_b.length(true);
	});
	
	/* splice from 1 if first item is self */
	if (points[0] == this) {
		return points.splice(1, n || 1);
	} else {
		return points.splice(0, n || 1);
	}
};


/* LINE */

TLORM.Math.Line = function(point_a, point_b, infinite) {
	this.point_a  = point_a;
	this.point_b  = point_b;
	this.infinite = infinite || false;
	this.setup();
};
TLORM.Math.Line.prototype.setup = function() {
	/* get equation of line: Y = this.s * X  + this.c */
	this.s        = (this.point_a.x - this.point_b.x == 0 ? 0 : (this.point_a.y - this.point_b.y)/(this.point_a.x - this.point_b.x));
	this.c        =  - this.s * this.point_a.x + this.point_a.y;
	
	/* calculate angle*/
	this.angle = Math.atan2(this.point_b.y-this.point_a.y, this.point_b.x-this.point_a.x);
};
TLORM.Math.Line.prototype.copy = function() {
	return new TLORM.Math.Line(this.point_a.copy(), this.point_b.copy(), this.infinite);
};
TLORM.Math.Line.prototype.getEndPoint = function() {
	return this.point_b;
};
TLORM.Math.Line.prototype.setEndPoint = function(p) {
	this.point_b = p;
	this.setup();
};

TLORM.Math.Line.prototype.contains = function(point) {
	if (
			(
				   (this.point_a.x < this.point_b.x  && this.point_a.x <= point.x && point.x <= this.point_b.x)
				|| (this.point_a.x > this.point_b.x  && this.point_a.x >= point.x && point.x >= this.point_b.x)
				|| (this.point_a.x == this.point_b.x && point.x == this.point_a.x )
			) && (
				   (this.point_a.y < this.point_b.y  && this.point_a.y <= point.y && point.y <= this.point_b.y)
				|| (this.point_a.y > this.point_b.y  && this.point_a.y >= point.y && point.y >= this.point_b.y)
				|| (this.point_a.y == this.point_b.y && point.y == this.point_a.y )
			)
	) {
		return true;
	}
	return false;
};

/* is point at the end of the line */
TLORM.Math.Line.prototype.atEnd = function(point) {
	if ( (point.x == this.point_a.x && point.y == this.point_a.y) || (point.x == this.point_b.x && point.y == this.point_b.y) ) {
		return true;
	}
	return false;
};

TLORM.Math.Line.prototype.length = function(quick) {
	var d_squared = Math.pow(this.point_b.x-this.point_a.x, 2) + Math.pow(this.point_b.y-this.point_a.y, 2);
	if (quick) {
		return d_squared;
	}
	return Math.sqrt(d_squared);
};

TLORM.Math.Line.prototype.intersection = function(line) {
	if (line.s - this.s == 0) {
		return null;
	}
	var x = (line.c - this.c) / (this.s - line.s);
	var y = (this.s * x) + this.c;
	var p = new TLORM.Math.Point(x, y);
	
	if (   ( this.infinite || this.contains(p) )
		&& ( line.infinite || line.contains(p) )
	) {
		return p;
	}
	
	return null;
};

/* from: http://stackoverflow.com/a/3366569/41468 */
TLORM.Math.Line.prototype.intersectionAngle = function(line) {
	var tmp = this.s*line.s ;
	if (tmp == -1) {
		return 0;
	}
	var angle = Math.atan(Math.abs((line.s - this.s) / (1 + tmp)));
	if (line.point_b.y > line.point_a.y) {
		angle += Math.PI;
	}
	return angle;
};
TLORM.Math.Line.prototype.getYFromX = function(x) {
	return Math.floor(this.s*x + this.c);
};
TLORM.Math.Line.prototype.getXFromY = function(y) {
	return ( this.s==0 ? 0 : Math.floor((y-this.c)/this.s) ); 
};
TLORM.Math.Line.prototype.moveEndPointToX = function(x) {
	var y = this.getYFromX(x);
	this.point_b  = new TLORM.Math.Point(x, y);
};
TLORM.Math.Line.prototype.moveEndPointToY = function(y) {
	var x = this.getXFromY(y);
	this.point_b  = new TLORM.Math.Point(x, y);
};
TLORM.Math.Line.prototype.getPointsOnLineFromX = function(from_x, to_x) {
	var points = [];
	for (var x=from_x; x<=to_x; ++x) {
		points.push(new TLORM.Math.Point(x, this.getYFromX(x)));
	}
	return points;
};
TLORM.Math.Line.prototype.getPointsOnLineFromY = function(from_y, to_y) {
	var points = [];
	for (var y=from_y; y<=to_y; ++y) {
		points.push(new TLORM.Math.Point(this.getXFromY(y), y));
	}
	return points;
};
TLORM.Math.Line.prototype.rotate = function(angle, point) {
	if (angle == 0) return;
	
	if (point == this.point_a) {
		return this.rotateAroundStart(angle);
	}
	
	/* rotate both end points */
	this.point_a.rotate(this.angle+angle, point);
	this.point_b.rotate(this.angle+angle, point);
	
	/* adjust the line */
	this.setup();
};
TLORM.Math.Line.prototype.rotateAroundStart = function(angle) {
	if (angle == 0) return;
	
	/* adjust current angle */
	var new_angle = this.angle + angle;
	var length = this.length();
	var dx = Math.cos(new_angle) / length;
	var dy = Math.sin(new_angle) / length;

	this.point_b.x = this.point_a.x + dx;
	this.point_b.y = this.point_a.y + dy;
	
	/* adjust the line */
	this.setup();
};
TLORM.Math.Line.prototype.setLength = function(length) {
	var dx = Math.cos(this.angle) * length;
	var dy = Math.sin(this.angle) * length;
	this.setEndPoint(new TLORM.Math.Point(this.point_a.x + dx, this.point_a.y + dy));
};


/* QUADRILATERAL */

TLORM.Math.Quadrilateral = function(point_tl, point_br ) {
	this.point_tl  = point_tl;
	this.point_br  = point_br;
	this.point_tr  = new TLORM.Math.Point(point_br.x, point_tl.y);
	this.point_bl  = new TLORM.Math.Point(point_tl.x, point_br.y);
	this.top    = new TLORM.Math.Line(this.point_tl, this.point_tr);
	this.right  = new TLORM.Math.Line(this.point_tr, this.point_br);
	this.bottom = new TLORM.Math.Line(this.point_bl, this.point_br);
	this.left   = new TLORM.Math.Line(this.point_tl, this.point_bl);
};

TLORM.Math.Quadrilateral.prototype.pointOnTop = function(point) {
	return this.top.contains(point);
};
TLORM.Math.Quadrilateral.prototype.pointOnRight = function(point) {
	return this.right.contains(point);
};
TLORM.Math.Quadrilateral.prototype.pointOnBottom = function(point) {
	return this.bottom.contains(point);
};
TLORM.Math.Quadrilateral.prototype.pointOnLeft = function(point) {
	return this.left.contains(point);
};

TLORM.Math.Quadrilateral.prototype.intersectedBy = function(object) {
	
	if (object instanceof TLORM.Math.Line) {
		return this.intersectedByLine(object);
	} else if (object instanceof TLORM.Math.Quadrilateral) {
		return this.intersectedByQuadrilateral(object);
	}
};

TLORM.Math.Quadrilateral.prototype.intersectedByLine = function(line) {
	
	/* square is intersected by a line if the line intersects any two of the squares lines */
	var top_i = this.top.intersection(line);
	var right_i = this.right.intersection(line);
	var bottom_i = this.bottom.intersection(line);
	var left_i = this.left.intersection(line);
	
	var intersections = [];
	if (top_i)    { intersections.push(top_i); }
	if (right_i)  { intersections.push(right_i); }
	if (bottom_i) { intersections.push(bottom_i); }
	if (left_i)   { intersections.push(left_i); }
	
	if (intersections.length >= 2) {
		/* find closest one to start of line */

		var closest = { p: null, d: 9999999999 };
		for (var i=0; i<intersections.length; ++i) {
			var line = new TLORM.Math.Line(line.point_a, intersections[i]);
			var d = line.length(true);
			if (d < closest.d) {
				closest.p = intersections[i];
				closest.d = d;
			}
		}
		return closest.p;
	} else {
		return null;
	}
};

TLORM.Math.Quadrilateral.prototype.intersectedByQuadrilateral = function(quadrilateral) {
	
	if (   this.point_br.x < quadrilateral.point_tl.x
	    || this.point_br.y < quadrilateral.point_tl.y
	    || this.point_tl.y > quadrilateral.point_br.y
	    || this.point_tl.y > quadrilateral.point_br.y
	) {
		return false;
	}
	
	return true;
};

TLORM.Math.Quadrilateral.prototype.cornerBetweenPoints = function(point_a, point_b) {
	var points = [this.point_tl, this.point_tr, this.point_bl, this.point_br];
	for (var i=0; i<points.length; ++i) {
		if (   (point_a.x <= points[i].x && points[i].x <= point_b.x && point_a.y <= points[i].y && points[i].y <= point_b.y)
			|| (point_a.x >= points[i].x && points[i].x >= point_b.x && point_a.y >= points[i].y && points[i].y >= point_b.y)
		) {
			return points[i];
		}
	}
	return null;
};

TLORM.Math.Quadrilateral.prototype.containsPoint = function(point) {
	if (this.point_tl.x <= point.x && point.x <= this.point_br.x && this.point_tl.y <= point.y && point.y <= this.point_br.y) {
		return true;
	}
	
	return false;
};




/* store all components inside this object */
TLORM.Component = {};
TLORM.SystemManager = function() {
	this.next_id = 1;
	this.systems = [];
	this.systems_by_type = {};
	this.systems_by_id = {};
};

TLORM.SystemManager.prototype.getSystemByType = function(type) {
	return this.systems_by_type[type];
};

TLORM.SystemManager.prototype.addSystem = function(system) {
	system.id = this.next_id++;
	this.systems.push(system);
	this.systems_by_type[system.type] = system;
	this.systems_by_id[system.id] = system;
};

TLORM.SystemManager.prototype.getSystems = function() {
	return this.systems;
};

TLORM.SystemManager.prototype.initAllSystems = function(game) {
	for (var i=0; i<this.systems.length; ++i) {
		if (this.systems[i].init) {
			this.systems[i].init(game);
		}
	}
};

TLORM.SystemManager.prototype.updateAllSystems = function(game) {
	for (var i=0; i<this.systems.length; ++i) {
		if (this.systems[i].type != 'Render') {
			this.systems[i].update(game);
		}
	}
};

TLORM.SystemManager.prototype.renderAllSystems = function(game) {
	this.systems_by_type['Render'].update(game);
};



TLORM.ResourceManager = function() {
	this.images = {};
	this.files = {};
	this.json = {};
	this.audio = {};
	this.to_load = 0;
	this.num_items = 0;
	this.no_cache = true;
};

TLORM.ResourceManager.prototype.addImage = function(src) {
	if (this.images[src]) {
		return this.images[src].img;
	}
	var image = new Image();
	++this.to_load;
	++this.num_items;
	var rm = this;
	image.onload = function() {
		--rm.to_load;
		rm.images[src].loaded = true;
	};
	if (this.no_cache) {
		image.src = src + "?" + new Date().getTime();
	} else {
		image.src = src;
	}
	
	this.images[src] = { img: image, loaded: false };
	return image;
};

TLORM.ResourceManager.prototype.getImage = function(src) {
	return this.images[src].img;
};

TLORM.ResourceManager.prototype.loadFile = function(src) {
	if (this.files[src]) {
		return this.files[src].contents;
	}
	
	++this.to_load;
	++this.num_items;
	this.files[src] = { contents: null, loaded: false };
	var rm = this;
	
	/* load file synchronously */
	var ajax = new XMLHttpRequest();
	ajax.onreadystatechange = function() {
		if (ajax.readyState === 4) {
			--rm.to_load;
			rm.files[src].contents = ajax.responseText;
			rm.files[src].loaded = true;
		}
	};
	if (this.no_cache) {
		ajax.open('GET', src + "?" + new Date().getTime(), false);
	} else {
		ajax.open('GET', src, false);
	}
	ajax.send();
	
	return this.files[src].contents;
};

TLORM.ResourceManager.prototype.getFile = function(src) {
	return this.files[src].contents;
};

TLORM.ResourceManager.prototype.loadJSON = function(src) {
	if (this.json[src]) {
		return this.json[src].contents;
	}
	
	++this.to_load;
	++this.num_items;
	this.json[src] = { contents: null, loaded: false };
	var rm = this;
	
	/* load file synchronously */
	var ajax = new XMLHttpRequest();
	ajax.onreadystatechange = function() {
		if (ajax.readyState === 4) {
			--rm.to_load;
			rm.json[src].contents = eval("("+ajax.responseText+")");
			rm.json[src].loaded = true;
		}
	};
	if (this.no_cache) {
		ajax.open('GET', src + "?" + new Date().getTime(), false);
	} else {
		ajax.open('GET', src, false);
	}
	ajax.send();
	
	return this.json[src].contents;
};

TLORM.ResourceManager.prototype.getJSON = function(src) {
	return this.json[src].contents;
};

TLORM.ResourceManager.prototype.addAudio = function(src) {
	if (this.audio[src]) {
		return this.audio[src].audio;
	}
	
	/* loads instantly */
	var audio = new Audio(src);
	++this.num_items;
	if (this.no_cache) {
		audio.src = src + "?" + new Date().getTime();
	} else {
		audio.src = src;
	}
	
	this.audio[src] = { audio: audio, loaded: false };
	return audio;
};

TLORM.ResourceManager.prototype.getAudio = function(src) {
	return this.audio[src].audio;
};

TLORM.ResourceManager.prototype.allLoaded = function(game) {
	return this.to_load === 0;
};

TLORM.ResourceManager.prototype.percentageLoaded = function(game) {
	var loaded = this.num_items - this.to_load;
	return ( loaded / this.num_items ) * 100;
};




TLORM.GameMenu = function(game, menus_def_file) {
	this.game = game;
	this.context = this.game.canvasContext();
	
	/* load the game menu definition */
	this.menus_def = game.resource_manager.loadJSON(menus_def_file);
	this.w = this.menus_def.w;
	this.h = this.menus_def.h;
	
	/* grab function to start the game */
	this.start_game = this.menus_def.game;

	/* parse the menus, add extra details needed for display */
	this.menus = {};
	for (var menu in this.menus_def.menus) {
		var menu_def = this.menus_def.menus[menu];
		this.menus[menu] = menu_def;
	}
	
	/* setup handlers to track user input */
	this.option_position = {
		x: 30,
		y: this.h/2,
		w: this.w - 60,
		h: 30,
		dh: 20,
		label_x: this.w/2,
		label_dy: 23
	};
	
	/* reset the menus */
	this.reset();
};

TLORM.GameMenu.prototype.reset = function() {
	this.current_menu = this.menus_def.start;
	this.current_option_args = [];
	this.game.setSize(this.w, this.h);
	
	var game_menu = this;
	this.game.unregisterAllEvents();
	this.game.registerEvent("click",  function(event) { game_menu.clickHandler(event); } );
	this.game.registerEvent("touch",  function(event) { game_menu.clickHandler(event); } );
};

TLORM.GameMenu.prototype.show = function() {
	if (this.current_menu == 'game') {
		/* unregister listeners */
		this.game.unregisterAllEvents();
		
		/* time to start the game */
		var args = this.current_option_args.slice();
		args.unshift(this.game);
		this.start_game.apply(this.start_game, args);
	} else {
		/* otherwise display the menu */
		this.display(this.current_menu);
		this.game.update();
	}
};

TLORM.GameMenu.prototype.display = function(menu) {
	/* draw current page and setup handlers to parse user input */
	var menu_def = this.menus[menu];
	this.context.fillStyle = menu_def.background;
	this.context.fillRect(0, 0, this.w, this.h);
	
	/* show title */
	this.context.fillStyle = '#000';
	this.context.font = '30px Arial';
	this.context.textAlign = 'center';
	this.context.fillText(menu_def.title, this.w/2, 30);
	
	/* show messages */
	this.context.font = '20px Arial';
	for (var i=0; i<menu_def.messages.length; ++i) {
		var y = 60+(30*i);
		this.context.fillText(menu_def.messages[i], this.w/2, y);
	}
	
	/* show options */
	this.context.font = '20px Arial';
	this.context.textAlign = 'center';
	this.context.strokeStyle = '#000';
	for (var i=0; i<menu_def.options.length; ++i) {
		var y = this.option_position.y+((this.option_position.h+this.option_position.dh)*i);
		this.context.fillStyle = '#ABC';
		this.context.fillRect(this.option_position.x, y, this.option_position.w, this.option_position.h);
		this.context.strokeRect(this.option_position.x, y, this.option_position.w, this.option_position.h);
		this.context.fillStyle = '#000';
		this.context.fillText(menu_def.options[i].title, this.option_position.label_x, y+this.option_position.label_dy);
	}
};

TLORM.GameMenu.prototype.clickHandler = function(event) {
	var current_options = this.menus[this.current_menu].options;
	if (   this.option_position.x <= event.offsetX && event.offsetX <= this.option_position.x + this.option_position.w
	    && this.option_position.y <= event.offsetY && event.offsetY <= this.option_position.y + ((this.option_position.h+this.option_position.dh)*current_options.length)
	) {
		var position = Math.floor((event.offsetY-this.option_position.y)/(this.option_position.h+this.option_position.dh));
		
		/* ignore the spaces between */
		if (event.offsetY <= this.option_position.y + ((this.option_position.h+this.option_position.dh)*position) + this.option_position.h) {
			this.current_menu = current_options[position].destination;
			this.current_option_args = current_options[position].args;
			this.show();
		}
	}
};


/* store all quick, predefined  entities in here */
TLORM.QuickEntity = {};

TLORM.Entity = function(name, components, x, y, w, h) {
	this.id = null;
	this.name = name;

	/* TODO, move these to physics component */
	this.px = x;
	this.py = y;
	this.x = x;
	this.y = y;
	this.point  = new TLORM.Math.Point(x, y);
	this.w = w;
	this.h = h;
	this.bounding_box = new TLORM.Math.Quadrilateral(
		new TLORM.Math.Point(x,   y  ),
		new TLORM.Math.Point(x+w, y+h)
	);
	
	this.components = [];
	this.components_by_type = {};
	
	if (components) {
		for (var i=0; i<components.length; ++i) {
			this.addComponent(components[i]);
		}
	}
};

TLORM.Entity.prototype.addComponent = function(component) {
	this.components.push(component);
	this.components_by_type[component.type] = component;
};

TLORM.Entity.prototype.removeComponent = function(component) {
	for (var i=0; i<this.components.length; ++i) {
		if (this.components[i] === component) {
			this.components.splice(i, 1);
		}
	}
	delete this.components_by_type[component.type];
};


TLORM.Entity.prototype.getComponentByType = function(type) {
	if (this.components_by_type[type]) {
		return this.components_by_type[type];
	}
	
	return null;
};

TLORM.Entity.prototype.initAllComponents = function(game) {
	for (var i=0; i<this.components.length; ++i) {
		if (this.components[i].init) {
			this.components[i].init(game);
		}
	}
};

TLORM.Entity.prototype.initAllComponents = function(game) {
	for (var i=0; i<this.components.length; ++i) {
		if (this.components[i].init) {
			this.components[i].init(game);
		}
	}
};

TLORM.Entity.prototype.getRequiredSystems = function() {
	var systems = [];
	for (var i=0; i<this.components.length; ++i) {
		if (this.components[i].system) {
			systems.push(this.components[i].system);
		}
	}
	return systems;
};

TLORM.Entity.prototype.move = function(dx, dy) {
	this.moveTo((dx == null ? null : this.x+dx), (dy == null ? null : this.y+dy));
};

TLORM.Entity.prototype.moveTo = function(x, y) {
	this.px = this.x;
	this.py = this.y;
	
	if (x != null) {
		this.x = x;
		this.point.x = x;
	}
	
	if (y != null) {
		this.point.y = x;
		this.y = y;
	}
	
	this.bounding_box = new TLORM.Math.Quadrilateral(
		new TLORM.Math.Point(this.x,        this.y       ),
		new TLORM.Math.Point(this.x+this.w, this.y+this.h)
	);
};

TLORM.Entity.prototype.direction = function() {
	var x_diff = this.px - this.x;
	var y_diff = this.py - this.y;
	
	if (x_diff == 0 && y_diff == 0) {
		return '';
	} else if (x_diff < 0) {
		return 'R';
	} else if (x_diff > 0) {
		return 'L';
	} else if (y_diff < 0) {
		return 'D';
	} else if (y_diff > 0) {
		return 'U';
	}
	
}
/* store all systems inside this object */
TLORM.System = {
};
TLORM.Utility = {
	arrayToLookupHash: function(array) {
		var hash = {};
		for (var i=0; i<array.length; ++i) {
			hash[array[i]] = true;
		}
		return hash;
	}
};

TLORM.Game = function(name, canvas) {
	this.name = name;
	this.canvas = canvas;
	this.context = this.canvas.getContext('2d');
	this.running = false;
	this.loop_time = 33;
	this.stop_message = "GAME OVER!";
	this.default_systems = ["Animation", "Transformation", "Collision", "Movement"];
	this.onStop = null;
	this.events = {};
	
	/* setup requestAnimationFrame */
	this.requestAnimationFrame =  window.requestAnimationFrame
	                          || window.mozRequestAnimationFrame
	                          || window.webkitRequestAnimationFrame
	                          || window.msRequestAnimationFrame;
	
	/* setup a working canvas for things like textures */
	this.working_canvas = document.createElement("canvas");
	this.working_context = this.working_canvas.getContext('2d');
	
	this.entity_manager = new TLORM.EntityManager();
	this.resource_manager = new TLORM.ResourceManager();
	this.system_manager = new TLORM.SystemManager();
	
	this.parseParams();
};

TLORM.Game.prototype.parseParams = function() {
	this.params = {};
	if (location.search) {
		var params = location.search.substring(1).split('&');
		for (var i=0; i<params.length; i++) {
			var param = params[i].split('=');
			if (param[0]) {
				this.params[param[0]] = param[1];
			}
		}
	}
};
TLORM.Game.prototype.param = function(name) {
	return this.params[name];
};

TLORM.Game.prototype.progressBar = function() {
	if (this.progress_bar) {
		return this.progress_bar;
	}
	
	this.progress_bar = document.createElement("progress");
	this.progress_bar.max = 100;
	this.progress_bar.style.position = 'absolute';
	this.progress_bar.style.zIndex = 1;
	this.progress_bar.style.top = window.innerHeight / 2;
	this.progress_bar.style.left = window.innerWidth / 2 - 100;
	document.body.appendChild(this.progress_bar);
	
	return this.progress_bar;
};
TLORM.Game.prototype.removeProgressBar = function() {
	if (this.progress_bar) {
		document.body.removeChild(this.progress_bar);
	}
}

TLORM.Game.prototype.reset = function() {
	this.entity_manager = new TLORM.EntityManager();
	this.resource_manager = new TLORM.ResourceManager();
	this.system_manager = new TLORM.SystemManager();
};

TLORM.Game.prototype.border = function() {
	return 10;
};

TLORM.Game.prototype.setSize = function(w, h) {
	this.canvas.width = w;
	this.canvas.height = h;
	//this.canvas.style.width = window.innerWidth+"px";
	//this.canvas.style.height = window.innerHeight+"px";
	if (this.buffer_context) {
		this.buffer_canvas.width = w;
		this.buffer_canvas.height = h;
		//this.buffer_canvas.style.width = window.innerWidth+"px";
		//this.buffer_canvas.style.height = window.innerHeight+"px";
	}
};

TLORM.Game.prototype.canvasContext = function() {
	if (!this.buffer_context) {
		this.buffer_canvas = document.createElement('canvas');
		this.buffer_canvas.width = this.canvas.width;
		this.buffer_canvas.height = this.canvas.height;
		this.buffer_context = this.buffer_canvas.getContext('2d');
	}
	return this.buffer_context;
};

TLORM.Game.prototype.registerEvent = function(type, callback) {
	if (type.indexOf('key') == -1) {
		this.canvas.addEventListener(type, callback);
	} else {
		document.addEventListener(type, callback);
	}
	if (!this.events[type]) { this.events[type] = []; }
	this.events[type].push(callback);
};

TLORM.Game.prototype.unregisterAllEvents = function(type) {
	if (type) {
		if (this.events[type]) {
			for (var i=0; i<this.events[type].length; ++i) {
				this.canvas.removeEventListener(type, this.events[type][i]);
			}
		}
	} else {
		for (var type in this.events) {
			this.unregisterAllEvents(type);
		}
	}
};

TLORM.Game.prototype.start = function() {
	this.entity_manager.initAllEntities(this);
	
	/* check that default systems and systems required by certain components are present */
	var systems = this.default_systems.concat(this.entity_manager.getRequiredSystems());
	for (var i=0; i<systems.length; ++i) {
		if (!this.system_manager.getSystemByType(systems[i])) {
			this.system_manager.addSystem(new TLORM.System[systems[i]]());
		}
	}
	
	/* add render system with canvas context */
	this.system_manager.addSystem(new TLORM.System.Render(this.canvasContext(), this.working_context, this.canvas.width, this.canvas.height));
	
	this.system_manager.initAllSystems(this);
	this.startIfResourcesLoaded();
};

TLORM.Game.prototype.startIfResourcesLoaded = function() {
	var g = this;
	if (!this.resource_manager.allLoaded(this)) {
		this.progressBar().value = this.resource_manager.percentageLoaded(this);
		setTimeout(function() { g.startIfResourcesLoaded(); }, 1);
	} else {
		this.progressBar().value = 100;
		setTimeout(function() {
			g.removeProgressBar();
			g.running = true;
			g.updateLoop();
			g.renderLoop();
		}, 100);
	}
};

TLORM.Game.prototype.stop = function(show_message) {
	this.running = false;
	var g = this;
	setTimeout(function() {
		if (show_message) {
			var a = alert(g.stop_message);
		}
		if (g.onStop) {
			g.onStop();
		}
	}, this.loop_time);
};

TLORM.Game.prototype.gameOver = function(won, score) {
	this.stop_message = "GAME OVER!\n"+(won ? "Congratulations, you won!" : "Sorry, you lost!")+(score ? " Your score was "+score : "");
	this.stop();
};

TLORM.Game.prototype.updateLoop = function() {
	if (this.running) {
		this.update();
		var s = this;
		setTimeout(function() { s.updateLoop(); }, this.loop_time);
	}
};

TLORM.Game.prototype.update = function() {
	this.entity_manager.update(this);
	this.system_manager.updateAllSystems(this);
};

TLORM.Game.prototype.renderLoop = function() {
	if (this.running) {
		this.render();
		
		/* loop requestAnimationFrame, must be called on window
		 * see: http://stackoverflow.com/a/9678166/41468
		 */
		var s = this;
		this.requestAnimationFrame.call(window, function() { s.renderLoop(); });
	}
};

TLORM.Game.prototype.render = function(dt) {
	this.system_manager.renderAllSystems(this);
	
	/* draw from buffer to main canvas */
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.context.drawImage(this.buffer_canvas, 0, 0);
};

/* a N-Tree for storing entities */
TLORM.NTree =  function(n, x, y, w, h, d, max_entities_per_branch, max_depth) {
	this.n = n;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.d = d;
	this.max_entities_per_branch = max_entities_per_branch;
	this.max_depth = max_depth;
	this.entites = [];
	this.branches = null;
	
	if (this.n % 2 != 0) {
		throw "Currently can only handle a NTree where N is divisble by 2";
	}
};

/* empties the tree and its children */
TLORM.NTree.prototype.clear = function() {
	this.entites = [];
	if (this.branches) {
		for (var i=0; i<this.n; ++i) {
			this.branches[i].clear();
		}
		this.branches = null;
	}
};

/* split this tree into N branches and moves entities into those */
TLORM.NTree.prototype.split = function() {
	var split_w = Math.round(this.w / (this.n/2));
	var split_w = Math.round(this.w / (this.n/2));
	
};
TLORM.EntityManager = function() {
	this.next_id = 1;
	this.entities = [];
	this.entities_by_type = {};
	this.entities_by_id = {};
	this.to_remove = [];
	this.to_add = [];
};

TLORM.EntityManager.prototype.addEntity = function(entity) {
	//this.to_add.push(entity);
	this._addEntity(entity);
	return entity;
};
TLORM.EntityManager.prototype._addEntity = function(entity) {
	entity.id = this.next_id++;
	
	this.entities.push(entity);
	
	for (var i=0; i<entity.components.length; ++i) {
		if (!this.entities_by_type[entity.components[i].type]) {
			this.entities_by_type[entity.components[i].type] = [];
		}
		this.entities_by_type[entity.components[i].type].push(entity);
	}
	
	this.entities_by_id[entity.id] = entity;
	
	return entity;
};

TLORM.EntityManager.prototype.removeEntity = function(entity) {
	this.to_remove.push(entity);
};
TLORM.EntityManager.prototype._removeEntity = function(entity) {
	for (var i=0; i<this.entities.length; ++i) {
		if (this.entities[i] === entity) {
			this.entities.splice(i, 1);
			break;
		}
	}

	for (i=0; i<entity.components.length; ++i) {
		var component = entity.components[i];
		if (this.entities_by_type[component.type]) {
			for (var j=0; j<this.entities_by_type[component.type].length; ++j) {
				if (this.entities_by_type[component.type][j] === entity) {
					this.entities_by_type[component.type].splice(j, 1);
					break;
				}
			}
		}
	}
	
	if (this.entities_by_id[entity.id]) {
		delete this.entities_by_id[entity.id];
	}
};

TLORM.EntityManager.prototype.getEntities = function() {
	return this.entities;
};

TLORM.EntityManager.prototype.getEntitiesByType = function(type) {
	if (this.entities_by_type[type]) {
		return this.entities_by_type[type];
	}
	
	return [];
};

TLORM.EntityManager.prototype.getEntitiesByPosition= function(x,y) {
	var entities = [];
	for (var i = 0; i<this.entities.length; i++) {
		if (this.entities[i].x === x && this.entities[i].y === y) {
			entities.push(this.entities[i]);
		}
	}
	
	return entities;
};

TLORM.EntityManager.prototype.addEntityComponent = function(entity, component) {
	if (this.entities_by_id[entity.id]) {
		entity.addComponent(component);
		if (!this.entities_by_type[component.type]) {
			this.entities_by_type[component.type] = [];
		}
		this.entities_by_type[component.type].push(entity);
	}
};

TLORM.EntityManager.prototype.removeEntityComponent = function(entity, component) {
	if (this.entities_by_id[entity.id]) {
		entity.removeComponent(component);

		for (var i=0; i<this.entities_by_type[component.type].length; ++i) {
			if (this.entities_by_type[component.type][i] === entity) {
				this.entities_by_type[component.type].splice(i, 1);
				break;
			}
		}
	}
};

TLORM.EntityManager.prototype.initAllEntities = function(game) {
	for (var i=0; i<this.entities.length; ++i) {
		this.entities[i].initAllComponents(game);
	}
};

TLORM.EntityManager.prototype.getRequiredSystems = function() {
	var systems = [];
	for (var i=0; i<this.entities.length; ++i) {
		systems = systems.concat(this.entities[i].getRequiredSystems());
	}
	return systems;
};

TLORM.EntityManager.prototype.update = function(game) {
	for (var i=0; i<this.to_remove.length; ++i) {
		this._removeEntity(this.to_remove[i]);
	}
	this.to_remove = [];
	
	for (var i=0; i<this.to_add.length; ++i) {
		this._addEntity(this.to_add[i]);
	}
	this.to_add = [];
};



TLORM.QuickEntity.Box = function(game, name, x, y, z, w, h, d, col, image, collidable) {

	var components = [
		TLORM.Component.Position(x, y, z, w, h, d),
		TLORM.Component.Render(1, col),
	];
	if (image) {
		components.push(TLORM.Component.Texture(image, 0, 0, w, h));
	}
	if (collidable) {
		components.push(TLORM.Component.Collidable("box"));
	}
	
	return game.entity_manager.addEntity(new TLORM.Entity(name, components));
};
TLORM.QuickEntity.Camera = function(game, name, x, y, z, fov, follow, dx, dy, dz) {
	
	var components = [
		TLORM.Component.Position(x, y, z, 1, 1 ,1),
		TLORM.Component.Camera(fov)
	];
	if (follow) {
		components.push(TLORM.Component.Follow(follow, dx, dy, dz));
	}
	return game.entity_manager.addEntity(new TLORM.Entity(name, components));
};
TLORM.QuickEntity.Player = function(game, name, x, y, z, w, h, d, col, collission_callback) {
	var components = [
		TLORM.Component.Position(x, y, z, w, h, d),
		TLORM.Component.Render(2, col),
		TLORM.Component.Collidable("player"),
		TLORM.Component.CollisionDetection("box", collission_callback),
	];
	
	return game.entity_manager.addEntity(new TLORM.Entity(name, components));
};
TLORM.QuickEntity.Grid = function(game, name, x_start, x_end, x_step, y_start, y_end, y_step, z_start, z_end, z_step) {
	for (var x=x_start; x<=x_end; x+=x_step) {
		for (var y=y_start; y<=y_end; y+=y_step) {
			for (var z=z_start; z<=z_end; z+=z_step) {
				game.entity_manager.addEntity(
					new TLORM.Entity(name, [
						TLORM.Component.Position(x, y, z, 1, 1, 1),
						TLORM.Component.Render(1, 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)'),
					])
				);
			}
		}
	}
};
TLORM.QuickEntity.BuildingFloor = function(game, name, x, y, z, w, h, d, col,min_room_w, max_room_w, min_room_h, max_room_h, room_col, floor_image, wall_image) {
	var dungeon = TLORM.Component.GenerateDungeon(w, d, min_room_w, max_room_w, min_room_h, max_room_h, 3);
	
	/* add each room as a box */
	for (var i=0; i<dungeon.rooms.length; ++i) {
		var room = dungeon.rooms[i];
		TLORM.QuickEntity.Box(game, name+"_room_"+i, x+room.x, y, z+room.y, room.w, h, room.h, room_col, wall_image, true);
	}
	
	return TLORM.QuickEntity.Box(game, name, x, y, z, w, 2, d, col, floor_image);
};
TLORM.QuickEntity.Building = function(game, name, x, y, z, w, h, d, col, light_sep, light_col) {
	var building = TLORM.QuickEntity.Box(game, name, x, y, z, w, h, d, col);
	
	/* add lights texture */
	
	return building;
};
TLORM.QuickEntity.Terrain = function(game, name, x, y, z, w, h, d, col, height_map) {
	return game.entity_manager.addEntity(
		new TLORM.Entity(name, [
			TLORM.Component.Position(x, y, z, w, h, d),
			TLORM.Component.Render(1, col),
			TLORM.Component.Terrain(height_map),
		])
	);
};

/* system to render components */
TLORM.System.Render = function(context, working_context, w, h) {
	
	return {
		type: 'Render',
		context: context,
		working_context: working_context,
		w: w,
		h: h,
		update: function(game) {
			
			var camera = game.entity_manager.getEntitiesByType('Camera')[0];
			
			/* clear everything */
			this.context.clearRect(0, 0, this.w, this.h);
			
			/* get entities that need rendering, and sort them into layer */
			var render_layers = this.getRenderableEntities(game, camera);
			
			/* render entities */
			for (var i=0; i<render_layers.length; ++i) {
				if (render_layers[i]) {
					for (var j=render_layers[i].max_index; j>=render_layers[i].min_index; --j) {
						if (render_layers[i].items[j]) {
							for (var k in render_layers[i].items[j]) {
								this.renderEntity(game, render_layers[i].items[j][k], camera);
							}
						}
					}
				}
			}
		},
		
		/* returns nested hashs keyed on render layer and then z coord */
		getRenderableEntities: function(game, camera) {
			var camera_position = (camera ? camera.getComponentByType('Position') : null);
			var z_cutoff = (camera_position ? camera_position.point.z : null);
			var y_cutoff = (camera_position ? camera_position.point.y : null);
						
			var entities = game.entity_manager.getEntitiesByType('Render');
			var render_layers = [];
			for (var i=0; i<entities.length; ++i) {
				var entity = entities[i];
				var render = entity.getComponentByType('Render');
				var position = entity.getComponentByType('Position');
				
				/* ignore things behind the camera */
				var end_z = position.point.z + position.d;
				var end_y = position.point.y + position.d;
				
				if (   render
				    && position
				    && (
					      (!z_cutoff && !y_cutoff)
				       || ( TLORM.Component.CameraType == 'H' && end_z > z_cutoff )
				       || ( TLORM.Component.CameraType == 'V' && end_y > y_cutoff )
				    )
				) {
					if (!z_cutoff && !y_cutoff) {
						if (!render_layers[render.z]) render_layers[render.z] = { min_index: 0, max_index: 0, items: [[]] };
						render_layers[render.z].items[0].push(entity);
					} else {
						if (!render_layers[render.z]) render_layers[render.z] = { min_index: 0, max_index: 0, items: [] };
						if ( TLORM.Component.CameraType == 'H' ) {
							if (!render_layers[render.z].items[end_z]) render_layers[render.z].items[end_z] = [];
							render_layers[render.z].items[end_z].push(entity);
							if (end_z < render_layers[render.z].min_index) {
								render_layers[render.z].min_index = end_z;
							}
							if (end_z > render_layers[render.z].max_index) {
								render_layers[render.z].max_index = end_z;
							}
						} else if ( TLORM.Component.CameraType == 'V' ) {
							if (!render_layers[render.z].items[end_y]) render_layers[render.z].items[end_y] = [];
							render_layers[render.z].items[end_y].push(entity);
							if (end_y < render_layers[render.z].min_index) {
								render_layers[render.z].min_index = end_y;
							}
							if (end_y > render_layers[render.z].max_index) {
								render_layers[render.z].max_index = end_y;
							}
						}
					}
				}
			}
			return render_layers;
		},
		renderEntity: function(game, entity, camera) {
			var render = entity.getComponentByType('Render');
			
			if (camera) {
				/* 3D: draw faces */
				var faces = this.getFaces(camera, entity);
				var texture = entity.getComponentByType('Texture');
				var image = entity.getComponentByType('Image');
				
				if (image) {
					this.context.fillStyle = this.context.createPattern(image.img, "no-repeat");
				} else if (texture) {
					this.context.fillStyle = this.context.createPattern(texture.img, "repeat");
					
					/* TODO: draw on working canvas, skew to fit each face and draw it */
					if (false) {
						this.working_context.save();
						this.working_context.fillStyle = this.working_context.createPattern(texture.img, "repeat");
						this.working_context.fill();
						this.working_context.restore();
					}
				} else {
					if (render.fill_colour) {
						this.context.fillStyle = render.fill_colour;
					}
					if (render.stroke_colour) {
						this.context.stokeStyle = render.stroke_colour;
					}
				}
				
				for (var i=0; i<faces.length; ++i) {
					this.context.beginPath();
					this.context.moveTo(faces[i][0].x, faces[i][0].y);
					for (var j=1; j<faces[i].length; ++j) {
						this.context.lineTo(faces[i][j].x, faces[i][j].y);
					}
					this.context.lineTo(faces[i][0].x, faces[i][0].y);
					this.context.closePath();
					
					if (render.stroke_colour) {
						this.context.stroke();
					}
					if (image || texture || render.fill_colour) {
						this.context.fill();
					}
					this.context.closePath();
				}
				
			} else {
				/* 2D */
				var position = entity.getComponentByType('Position');
				if (render.fill_colour) {
					this.context.fillStyle = render.fill_colour;
					this.context.fillRect(position.point.x, position.point.y, position.w, position.h);
				}
				if (render.stroke_colour) {
					this.context.stokeStyle = render.stroke_colour;
					this.context.strokeRect(position.point.x, position.point.y, position.w, position.h);
				}
			}
		},
		
		/* TODO: create faces as quadrilaterals and transform all points at once */
		getFaces: function(camera, entity) {
			var camera_position = camera.getComponentByType('Position');
			var position = entity.getComponentByType('Position');
			
			/* if still on screen but started before camera, move it up to camera */
			var old_z = position.point.z;
			var old_y = position.point.y;
			var old_d = position.d;
			if ( TLORM.Component.CameraType == 'H' && position.point.z <= camera_position.point.z) {
				position.d -= camera_position.point.z - position.point.z - 1;
				position.point.z = camera_position.point.z + 1;
			} else if ( TLORM.Component.CameraType == 'V' && position.point.y <= camera_position.point.y) {
				position.d -= camera_position.point.y - position.point.y - 1;
				position.point.y = camera_position.point.y + 1;
			}
			
			var faces = [
				/* front */
				[
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x,            position.point.y           , position.point.z           ),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y           , position.point.z           ),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z           ),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x,            position.point.y+position.h, position.point.z           ),
						camera, this.w, this.h
					)
				],
				/* right */
				[
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y           , position.point.z           ),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y           , position.point.z+position.d),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z+position.d),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z           ),
						camera, this.w, this.h
					)
				],
				/* back */
				[
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y           , position.point.z+position.d),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x           , position.point.y           , position.point.z+position.d),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x           , position.point.y+position.h, position.point.z+position.d),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z+position.d),
						camera, this.w, this.h
					)
				],
				/* left */
				[
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x           , position.point.y           , position.point.z           ),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x           , position.point.y           , position.point.z+position.d),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x           , position.point.y+position.h, position.point.z+position.d),
						camera, this.w, this.h
					),
					TLORM.CameraFunctions.point_on_screen(
						new TLORM.Math.Point(position.point.x           , position.point.y+position.h, position.point.z           ),
						camera, this.w, this.h
					)
				],
			];
			
			/* add top  */
			faces = faces.concat(this.getTopFaces(camera, entity));
			
			position.point.z = old_z;
			position.point.y = old_y;
			position.d = old_d;
			
			return faces;
		},
		getTopFaces: function(camera, entity) {
			var position = entity.getComponentByType('Position');
			var terrain = entity.getComponentByType('Terrain');
			
			/* if this is terrain then add "faces" to the top using height map */
			if (terrain && terrain.height_map.length > 2) {
				var faces = [];
				
				/* go through each point and join it to its two nearest points */
				var height_map_points = terrain.height_map;
				for (var i=0; i<height_map_points.length; ++i) {
					var nearest = height_map_points[i].nearest(height_map_points, 2);
					faces.push(
						[
							TLORM.CameraFunctions.point_on_screen(height_map_points[i], camera, this.w, this.h),
							TLORM.CameraFunctions.point_on_screen(nearest[0], camera, this.w, this.h),
							TLORM.CameraFunctions.point_on_screen(nearest[1], camera, this.w, this.h)
						]
					);
				}
				
				/* join the corner together via nearest point */
				var corners = [
					new TLORM.Math.Point(position.point.x           , position.point.y+position.h, position.point.z           ),
					new TLORM.Math.Point(position.point.x           , position.point.y+position.h, position.point.z+position.d),
					new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z+position.d),
					new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z           ),
				];
				for (var i=0; i<corners.length; ++i) {
					var nearest = corners[i].nearest(height_map_points, 1);
					faces.push(
						[
							TLORM.CameraFunctions.point_on_screen(corners[(i==0 ? corners.length-1 : i-1)], camera, this.w, this.h),
							TLORM.CameraFunctions.point_on_screen(nearest[0], camera, this.w, this.h),
							TLORM.CameraFunctions.point_on_screen(corners[i], camera, this.w, this.h)
						]
					);
				}
				
				return faces;
			} else {
				/* add normal top */
				return [
					[
						TLORM.CameraFunctions.point_on_screen(
							new TLORM.Math.Point(position.point.x           , position.point.y+position.h, position.point.z           ),
							camera, this.w, this.h
						),
						TLORM.CameraFunctions.point_on_screen(
							new TLORM.Math.Point(position.point.x           , position.point.y+position.h, position.point.z+position.d),
							camera, this.w, this.h
						),
						TLORM.CameraFunctions.point_on_screen(
							new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z+position.d),
							camera, this.w, this.h
						),
						TLORM.CameraFunctions.point_on_screen(
							new TLORM.Math.Point(position.point.x+position.w, position.point.y+position.h, position.point.z           ),
							camera, this.w, this.h
						)
					],
				];
			}
		}
	};
};

TLORM.System.Gravity = function(g) {
	return {
		type: 'Gravity',
		g: g || 10,
		init: function(game) {},
		update: function(game) {
			var mass_entities = this.getEntitiesWithMass(game);
		},
		getEntitiesWithMass: function(game) {
			return game.entity_manager.getEntitiesByType('Mass');
		},
	};
};

TLORM.System.Movement = function() {
	return {
		type: 'Movement',
		moveEvent: null,
		init: function(game) {
			/* register control callbacks for player */
			var system = this;
			game.registerEvent("mousemove", function(event) { system.moveHandler(event); } );
			game.registerEvent("mouseout", function(event) { system.moveHandler(event); } );
		},
		moveHandler: function(event) {
			this.moveEvent = event;
		},
		outHandler: function(event) {
			this.moveEvent = null;
		},
		update: function(game) {
			
			var followers = this.getFollowers(game);
			for (var i=0; i<followers.length; ++i) {
				var follower = followers[i];
				var follow = follower.getComponentByType('Follow');
				var follower_position = follower.getComponentByType('Position');
				var followee = follow.follow;
				var followee_position = followee.getComponentByType('Position');
				if (follower_position && followee_position) {
					follower_position.point.x = followee_position.point.x + follow.dx;
					follower_position.point.y = followee_position.point.y + follow.dy;
					follower_position.point.z = followee_position.point.z + follow.dz;
				}
			}
			
			if (this.moveEvent) {
				var entity = this.getMouseMoveable(game)[0];
				if (entity) {
					var movement = entity.getComponentByType('FollowMouse');
					
					var x_diff = this.moveEvent.offsetX - entity.x - entity.w/2;
					if (Math.abs(x_diff) <= movement.speed) {
						entity.moveTo(this.moveEvent.offsetX - entity.w/2, null);
					} else if (x_diff < 0) {
						entity.move(-movement.speed, null);
					} else  {
						entity.move(movement.speed, null);
					}
					
					var y_diff = this.moveEvent.offsetY - entity.y - entity.h/2;
					if (Math.abs(y_diff) <= movement.speed) {
						entity.moveTo(null, this.moveEvent.offsetY - entity.h/2);
					} else if (y_diff < 0) {
						entity.move(null, -movement.speed);
					} else  {
						entity.move(null, movement.speed);
					}
				}
			}
		},
		getMouseMoveable: function(game) {
			return game.entity_manager.getEntitiesByType('FollowMouse');
		},
		getFollowers: function(game) {
			return game.entity_manager.getEntitiesByType('Follow');
		},
	};
};

TLORM.System.Transformation = function(component_types) {
	return {
		type: 'Transformation',
		update: function(game) {
			
			var entities = this.getTransforms(game);
			for (var i=0; i<entities.length; ++i) {
				var entity = entities[i];
				var transform = entity.getComponentByType('Transform');
				
				if (transform.dx != null) {
					entity.x += transform.dx;
				}
				if (transform.dy != null) {
					entity.y += transform.dy;
				}
				if (transform.x != null) {
					entity.x = transform.x;
				}
				if (transform.y != null) {
					entity.y = transform.y;
				}
				if (transform.dw != null) {
					entity.w += transform.dw;
				}
				if (transform.dh != null) {
					entity.h += transform.dh;
				}
				if (transform.w != null) {
					entity.w = transform.w;
				}
				if (transform.h != null) {
					entity.h = transform.h;
				}
				
				game.entity_manager.removeEntityComponent(entity, transform);
			}
		},
		getTransforms: function(game) {
			return game.entity_manager.getEntitiesByType('Transform');
		}
	};
};

TLORM.System.Collision = function() {
	return {
		type: 'Collision',
		update: function(game) {
			
			/* iterate over all entities which detect collision
			 * check for collisions
			 * trigger callback
			 */
			var detection_entities = this.getCollisionDetections(game);
			var collidable_entities = this.getCollidables(game);
			for (var i=0; i<detection_entities.length; ++i) {
				var detection = detection_entities[i].getComponentByType('CollisionDetection');
				for (var j=0; j<collidable_entities.length; ++j) {
					if (   detection_entities[i] != collidable_entities[j]
					    && this.collides(detection_entities[i], collidable_entities[j])
					) {
						detection.callback.call(detection,
							collidable_entities[j],
							detection_entities[i].direction()
						);
					}
				}
			}
		},
		getCollidables: function(game) {
			return game.entity_manager.getEntitiesByType('Collidable');
		},
		getCollisionDetections: function(game) {
			return game.entity_manager.getEntitiesByType('CollisionDetection');
		},
		collides: function(entity_a, entity_b) {
			var colliable_a = entity_a.getComponentByType('Collidable');
			var colliable_b = entity_b.getComponentByType('Collidable');
			if (!colliable_a && !colliable_b) {
				return false;
			}
			
			/* check if either is set to ignore */
			if (colliable_a.ignoreGroup(colliable_b.group) || colliable_b.ignoreGroup(colliable_a.group)) {
				return false;
			}
			
			var position_a = entity_a.getComponentByType('Position');
			var position_b = entity_b.getComponentByType('Position');
			
			/* check for collision */
			if (   position_a.point.x                <= position_b.point.x + position_b.w
			    && position_b.point.x                <= position_a.point.x + position_a.w
			    && position_a.point.y                <= position_b.point.y + position_b.h
			    && position_b.point.y                <= position_a.point.y + position_a.h
			    && position_a.point.z                <= position_b.point.z + position_b.d
			    && position_b.point.z                <= position_a.point.z + position_a.d
			) {
				return true;
			}
			
			return false;
		},
	};
};

TLORM.System.Debug = function(component_types) {
	return {
		type: 'Debug',
		component_types : component_types ,
		update: function(game) {
			
			/* debug info on all entities that have all the required component types, or all */
			var entities = [];
			if (!this.component_types) {
				entities = game.entity_manager.getEntities();
			}
			

			for (var i=0; i<entities.length; ++i) {
				console.log("Entity: "+entities[i].name);
			}
		}
	};
};

TLORM.System.Animation = function(component_types) {
	return {
		type: 'Animation',
		update: function(game) {
			
			var entities = this.getAnimations(game);
			for (var i=0; i<entities.length; ++i) {
				var entity = entities[i];
				var animation = entity.getComponentByType('Animation');
				
				if (animation.step == 0) {
					animation.on_start(animation);
					++animation.step;
				} else if (animation.step >= animation.steps) {
					animation.on_end(animation);
					game.entity_manager.removeEntityComponent(entity, animation);
				} else {
					animation.on_step(animation, animation.step);
					++animation.step;
				}
			}
		},
		getAnimations: function(game) {
			return game.entity_manager.getEntitiesByType('Animation');
		}
	};
};// seedrandom.js version 2.0.
// Author: David Bau 4/2/2011
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
//
// Usage:
//
//   <script src=http://davidbau.com/encode/seedrandom-min.js></script>
//
//   Math.seedrandom('yipee'); Sets Math.random to a function that is
//                             initialized using the given explicit seed.
//
//   Math.seedrandom();        Sets Math.random to a function that is
//                             seeded using the current time, dom state,
//                             and other accumulated local entropy.
//                             The generated seed string is returned.
//
//   Math.seedrandom('yowza', true);
//                             Seeds using the given explicit seed mixed
//                             together with accumulated entropy.
//
//   <script src="http://bit.ly/srandom-512"></script>
//                             Seeds using physical random bits downloaded
//                             from random.org.
//
//   <script src="https://jsonlib.appspot.com/urandom?callback=Math.seedrandom">
//   </script>                 Seeds using urandom bits from call.jsonlib.com,
//                             which is faster than random.org.
//
// Examples:
//
//   Math.seedrandom("hello");            // Use "hello" as the seed.
//   document.write(Math.random());       // Always 0.5463663768140734
//   document.write(Math.random());       // Always 0.43973793770592234
//   var rng1 = Math.random;              // Remember the current prng.
//
//   var autoseed = Math.seedrandom();    // New prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable.
//
//   Math.random = rng1;                  // Continue "hello" prng sequence.
//   document.write(Math.random());       // Always 0.554769432473455
//
//   Math.seedrandom(autoseed);           // Restart at the previous seed.
//   document.write(Math.random());       // Repeat the 'unpredictable' value.
//
// Notes:
//
// Each time seedrandom('arg') is called, entropy from the passed seed
// is accumulated in a pool to help generate future seeds for the
// zero-argument form of Math.seedrandom, so entropy can be injected over
// time by calling seedrandom with explicit data repeatedly.
//
// On speed - This javascript implementation of Math.random() is about
// 3-10x slower than the built-in Math.random() because it is not native
// code, but this is typically fast enough anyway.  Seeding is more expensive,
// especially if you use auto-seeding.  Some details (timings on Chrome 4):
//
// Our Math.random()            - avg less than 0.002 milliseconds per call
// seedrandom('explicit')       - avg less than 0.5 milliseconds per call
// seedrandom('explicit', true) - avg less than 2 milliseconds per call
// seedrandom()                 - avg about 38 milliseconds per call
//
// LICENSE (BSD):
//
// Copyright 2010 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
// 
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 *
 * @param {number=} overflow 
 * @param {number=} startdenom
 */
(function (pool, math, width, chunks, significance, overflow, startdenom) {


//
// seedrandom()
// This is the seedrandom function described above.
//
math['seedrandom'] = function seedrandom(seed, use_entropy) {
  var key = [];
  var arc4;

  // Flatten the seed string or build one from local entropy if needed.
  seed = mixkey(flatten(
    use_entropy ? [seed, pool] :
    arguments.length ? seed :
    [new Date().getTime(), pool, window], 3), key);

  // Use the seed to initialize an ARC4 generator.
  arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(arc4.S, pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  math['random'] = function random() {  // Closure to return a random double:
    var n = arc4.g(chunks);             // Start with a numerator n < 2 ^ 48
    var d = startdenom;                 //   and denominator d = 2 ^ 48.
    var x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  // Return the seed that was used
  return seed;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, u, me = this, keylen = key.length;
  var i = 0, j = me.i = me.j = me.m = 0;
  me.S = [];
  me.c = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) { me.S[i] = i++; }
  for (i = 0; i < width; i++) {
    t = me.S[i];
    j = lowbits(j + t + key[i % keylen]);
    u = me.S[j];
    me.S[i] = u;
    me.S[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  me.g = function getnext(count) {
    var s = me.S;
    var i = lowbits(me.i + 1); var t = s[i];
    var j = lowbits(me.j + t); var u = s[j];
    s[i] = u;
    s[j] = t;
    var r = s[lowbits(t + u)];
    while (--count) {
      i = lowbits(i + 1); t = s[i];
      j = lowbits(j + t); u = s[j];
      s[i] = u;
      s[j] = t;
      r = r * width + s[lowbits(t + u)];
    }
    me.i = i;
    me.j = j;
    return r;
  };
  // For robust unpredictability discard an initial batch of values.
  // See http://www.rsa.com/rsalabs/node.asp?id=2009
  me.g(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
/** @param {Object=} result 
  * @param {string=} prop
  * @param {string=} typ */
function flatten(obj, depth, result, prop, typ) {
  result = [];
  typ = typeof(obj);
  if (depth && typ == 'object') {
    for (prop in obj) {
      if (prop.indexOf('S') < 5) {    // Avoid FF3 bug (local/sessionStorage)
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
      }
    }
  }
  return (result.length ? result : obj + (typ != 'string' ? '\0' : ''));
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
/** @param {number=} smear 
  * @param {number=} j */
function mixkey(seed, key, smear, j) {
  seed += '';                         // Ensure the seed is a string
  smear = 0;
  for (j = 0; j < seed.length; j++) {
    key[lowbits(j)] =
      lowbits((smear ^= key[lowbits(j)] * 19) + seed.charCodeAt(j));
  }
  seed = '';
  for (j in key) { seed += String.fromCharCode(key[j]); }
  return seed;
}

//
// lowbits()
// A quick "n mod width" for width a power of 2.
//
function lowbits(n) { return n & (width - 1); }

//
// The following constants are related to IEEE 754 limits.
//
startdenom = math.pow(width, chunks);
significance = math.pow(2, significance);
overflow = significance * 2;

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

// End anonymous scope, and pass initial values.
})(
  [],   // pool: entropy pool starts empty
  Math, // math: package containing random, pow, and seedrandom
  256,  // width: each RC4 output is 0 <= x < 256
  6,    // chunks: at least six RC4 outputs for each double
  52    // significance: there are 52 significant digits in a double
);


TLORM.Component.Render = function(z, fill_colour, stroke_colour, highlight_alpha, other_fill_colour) {
	return {
		type: 'Render',
		z: z,
		highlight_alpha: highlight_alpha,
		fill_colour: fill_colour,
		other_fill_colour: other_fill_colour,
		stroke_colour: stroke_colour,
		show_name: false
	};
};

TLORM.Component.Transform = function(dx, dy, dw, dh, x, y, w ,h) {
	return {
		type: 'Transform',
		system: 'Transformation',
		dx: dx,
		dy: dy,
		dw: dw,
		dh: dh,
		x: x,
		y: y,
		w: w,
		h: h
	};
};

TLORM.Component.CollisionDetection = function(group, callback) {
	return {
		type: 'CollisionDetection',
		system: 'Collision',
		group: group,
		callback: callback,
	};
};

TLORM.Component.CameraType = 'V';
TLORM.Component.Camera = function(fov) {
	return {
		type: 'Camera',
		fov: fov,
		d: 1/Math.tan(fov/2),
		setFOV: function(new_fov) {
			this.d = 1/Math.tan(new_fov/2);
			this.fov = new_fov;
		}
	};
};

TLORM.CameraFunctions = {
	world_point_to_camera_point: function(camera_entity, point) {
		var position = camera_entity.getComponentByType('Position');
		return new TLORM.Math.Point(
			point.x - position.point.x,
			point.y - position.point.y,
			point.z - position.point.z
		);
	},
	camera_point_to_projection_point: function(camera_entity, point) {
		var camera = camera_entity.getComponentByType('Camera');
		if ( TLORM.Component.CameraType == 'H' ) {
			return new TLORM.Math.Point(
				point.x * (camera.d / point.z),
				point.y * (camera.d / point.z)
			);
		} else if ( TLORM.Component.CameraType == 'V' ) {
			return new TLORM.Math.Point(
				point.x * (camera.d / point.y),
				point.z * (camera.d / point.y)
			);
		}
	},
	projection_point_to_screen_point: function(point, w, h) {
		var hw = w/2;
		var hh = h/2;
		return new TLORM.Math.Point(
			hw + hw*point.x,
			hh - hh*point.y
		);
	},
	point_on_screen: function(point, camera, w, h) {
		var camera_point = TLORM.CameraFunctions.world_point_to_camera_point(camera, point);
		var projection_point = TLORM.CameraFunctions.camera_point_to_projection_point(camera, camera_point);
		var screen_point = TLORM.CameraFunctions.projection_point_to_screen_point(projection_point, w, h);
		return screen_point;
	},
	screen_point_to_projection_point: function(point, w, h) {
		var hw = w/2;
		var hh = h/2;
		return new TLORM.Math.Point(
			(point.x - hw)/hw,
			(point.y - hh)/-hh
		);
	},
	projection_point_to_camera_point: function(camera_entity, point) {
		var camera = camera_entity.getComponentByType('Camera');
		var position = camera_entity.getComponentByType('Position').point;
		if (position.z == null) {
			return null;
		}
		return new TLORM.Math.Point(
			point.x / (camera.d / position.z),
			point.y / (camera.d / position.z)
		);
	},
	camera_point_to_world_point: function(camera_entity, point) {
		var position = camera_entity.getComponentByType('Position');
		return new TLORM.Math.Point(
			point.x + position.point.x,
			point.y + position.point.y
		);
	},
	screen_point_to_world_point: function(point, camera, w, h) {
		var projection_point = TLORM.CameraFunctions.screen_point_to_projection_point(point, w, h);
		var camera_point = TLORM.CameraFunctions.projection_point_to_camera_point(camera, projection_point);
		var world_point = TLORM.CameraFunctions.camera_point_to_world_point(camera, camera_point);
		return world_point;
	},
};

TLORM.Component.Follow = function(follow, dx, dy, dz) {
	return {
		type: 'Follow',
		follow: follow,
		dx: dx || 0,
		dy: dy || 0,
		dz: dz || 0,
	};
};

TLORM.Component.Sprite = function(src, x, y, w, h, dx, dy, dw, dh) {
	return {
		type: 'Sprite',
		src: src,
		x: x,
		y: y,
		w: w,
		h: h,
		dx: dx,
		dy: dy,
		dw: dw,
		dh: dh,
		img: null,
		init: function(game) {
			this.img = game.resource_manager.addImage(this.src);
		}
	};
};

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



TLORM.Component.Image = function(src, x, y, w, h) {
	return {
		type: 'Image',
		src: src,
		x: x,
		y: y,
		w: w,
		h: h,
		img: null,
		init: function(game) {
			this.img = game.resource_manager.addImage(this.src);
		}
	};
};

TLORM.Component.GenerateDungeon = function(w, h, min_room_w, max_room_w, min_room_h, max_room_h, max_doors) {
	return {
		type: 'GenerateDungeon',
		w: w,
		h: h,
		min_room_w: min_room_w,
		max_room_w: max_room_w,
		min_room_h: min_room_h,
		max_room_h: max_room_h,
		max_doors: max_doors,
		rooms: generateRooms(w, h, min_room_w, max_room_w, min_room_h, max_room_h),
		corridors: [],
	};
	
	function generateRooms(w, h, min_room_w, max_room_w, min_room_h, max_room_h) {
		var rooms = [];

		var room_w_var = max_room_w - min_room_w;
		var room_h_var = max_room_h - min_room_h;
		
		/* split the whole area into a grid using max sizes */
		var grid_locations = [];
		var grid_w = Math.floor(w/max_room_w);
		var grid_h = Math.floor(h/max_room_h);
		for (var x=0; x<grid_w; ++x) {
			var grid_row_w = max_room_w;
			var pos_x = x*grid_row_w;
			for (var y=0; y<grid_h; ++y) {
				var grid_row_h = max_room_h;
				var pos_y = y*grid_row_h;
				grid_locations.push({ x: pos_x, y: pos_y, w: grid_row_w, h: grid_row_h });
			}
		}
			
		/* randomly sort locations */
		grid_locations.sort(function() { return Math.random() - 0.5; } );
		
		/* random generate rooms within each grid location */
		while (grid_locations.length > 0) {
			
			/* pick next location and put a room in it */
			var location = grid_locations.pop();
			var room = {
				x: location.x + Math.floor(Math.random()*min_room_w),
				y: location.y + Math.floor(Math.random()*min_room_h),
				w: min_room_w + Math.floor(Math.random()*room_w_var),
				h: min_room_h + Math.floor(Math.random()*room_h_var),
			};
			
			/* check room within location and if not put location back and go again */
			if (room.x+room.w > location.x+location.w || room.y+room.h > location.y+location.h) {
				grid_locations.unshift(location);
				continue;
			}
			
			rooms.push(room);
		}
		
		/* TODO: join rooms together with some corridors */
		
		return rooms;
	}
};

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

TLORM.Component.Texture = function(src) {
	return {
		type: 'Texture',
		src: src,
		img: null,
		canvas: null,
		init: function(game) {
			this.img = game.resource_manager.addImage(this.src);
			this.canvas = document.createElement('canvas');
		}
	};
};

TLORM.Component.Position = function(x, y, z, w, h, d) {
	return {
		type: 'Position',
		point: new TLORM.Math.Point(x, y, z),
		w: w,
		h: h,
		d: d
	};
};

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

TLORM.Component.Terrain = function(height_map) {
	return {
		type: 'Terrain',
		height_map: height_map
	};
};

TLORM.Component.FollowMouse = function(speed) {
	return {
		type: 'FollowMouse',
		system: 'Movement',
		speed: speed,
	};
};