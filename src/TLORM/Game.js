
TLORM.Game = function(name, canvas) {
	this.name = name;
	this.canvas = canvas;
	this.context = this.canvas.getContext('2d');
	this.running = false;
	this.loop_time = 33;
	this.stop_message = "GAME OVER!";
	this.default_systems = ["Animation", "Transformation"];
	this.onStop = null;
	this.events = {};
	
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
	if (this.buffer_context) {
		this.buffer_canvas.width = w;
		this.buffer_canvas.height = h;
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
	this.canvas.addEventListener(type, callback);
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
	
	this.system_manager.initAllSystems(this);
	this.startIfResourcesLoaded();
};

TLORM.Game.prototype.startIfResourcesLoaded = function() {
	if (!this.resource_manager.allLoaded(this)) {
		var g = this;
		setTimeout(function() { g.startIfResourcesLoaded(); }, 100);
	} else {
		this.running = true;
		this.loop();
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
	this.stop(true);
};

TLORM.Game.prototype.loop = function() {
	if (this.running) {
		this.update();
		var s = this;
		setTimeout(function() { s.loop(); }, this.loop_time);
	}
};

TLORM.Game.prototype.update = function() {
	this.system_manager.updateAllSystems(this);
	
	/* draw from buffer to main canvas */
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.context.drawImage(this.buffer_canvas, 0, 0);
};
