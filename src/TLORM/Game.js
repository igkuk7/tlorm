

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
