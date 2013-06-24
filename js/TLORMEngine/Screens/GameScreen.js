// DEPENDENCY: Screen.js

TLORMEngine.Screens.GameScreen = function(args) {
	TLORMEngine.Screens.Screen.call(this, args);
	this.show_name = false;
	this.show_back = false;
	
	// setup managers for the game
	this.system_manager = new TLORMEngine.SystemManager();

	// setup canvas for display, i.e. scaled
	this.canvas = document.createElement("canvas");
	if (this.webgl) {
		this.gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
	} else {
		this.context = this.canvas.getContext("2d");

		// update context to avoid blurry scaling
		this.context.imageSmoothingEnabled = false;
		this.context.webkitImageSmoothingEnabled = false;
		this.context.mozImageSmoothingEnabled = false;
	}

	// position canvases in center
	this.canvas.style.position = "absolute";
}

// inherit from normal screen
TLORMEngine.Screens.GameScreen.extends(TLORMEngine.Screens.Screen);


TLORMEngine.Screens.GameScreen.prototype.args_schema = function () {
	var super_args = this.super.args_schema.call(this);
	var args =  {
		//webgl: { type: "boolean", default: false, title: "Use WebGL (not currently working)" },
		//scale_canvas: { type: "boolean", default: false, title: "Use WebGL (when using WebGL)" },
	};
	return TLORMEngine.Utils.merge_objects(super_args, args);
};

TLORMEngine.Screens.GameScreen.prototype.init = function(game, reset) {
	TLORMEngine.Screens.Screen.prototype.init.call(this, game, reset);

	this.system_manager.initAllSystems(this, reset);

	// position canvases in center
	if (this.webgl) {
		// for simple performance boost draw smaller canvas and use CSS to scale it
		if (this.scale_canvas) {
			this.canvas.width  = this.width/2;
			this.canvas.height = this.height/2;
			this.canvas.style.webkitTransform = "scale3d(2.0, 2.0, 1.0)";
		} else {
			this.canvas.width  = this.width;
			this.canvas.height = this.height;
		}
	} else {
		this.canvas.width  = this.width;
		this.canvas.height = this.height;
	}
	this.canvas.style.top  = Math.round((window.innerHeight - this.canvas.height) / 2) + "px";
	this.canvas.style.left = Math.round((window.innerWidth - this.canvas.width) / 2) + "px";
	document.body.appendChild(this.canvas);
};

TLORMEngine.Screens.GameScreen.prototype.cleanUp = function() {
	TLORMEngine.Screens.Screen.prototype.cleanUp.call(this);

	document.body.removeChild(this.canvas);
};


TLORMEngine.Screens.GameScreen.prototype.update = function(game, delta) {
	TLORMEngine.Screens.Screen.prototype.update.call(this, game, delta);
	this.system_manager.updateAllSystems(this, delta);
};

TLORMEngine.Screens.GameScreen.prototype.render = function(game) {
	if (this.webgl) {
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height); 
		this.gl.clearColor(0, 0, 0, 1);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.system_manager.renderAllSystems(this, this.gl);
	} else {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.system_manager.renderAllSystems(this, this.context);
	}
};

TLORMEngine.Screens.GameScreen.prototype.registerEvent = function(type, callback) {
	if (type.indexOf('key') == -1) {
		this.canvas.addEventListener(type, callback);
	} else {
		document.addEventListener(type, callback);
	}
	if (!this.events[type]) { this.events[type] = []; }
	this.events[type].push(callback);
};

TLORMEngine.Screens.GameScreen.prototype.clearAllRegisteredEvents = function() {
	for (var type in this.events) {
		for (var i=0; i<this.events[type].length; ++i) {
			if (type.indexOf('key') == -1) {
				this.canvas.removeEventListener(type, this.events[type][i]);
			} else {
				document.removeEventListener(type, this.events[type][i]);
			}
		}
	}
};

TLORMEngine.Screens.GameScreen.prototype.getSystemByType = function(type) {
	return this.system_manager.getSystemByType(type);
};