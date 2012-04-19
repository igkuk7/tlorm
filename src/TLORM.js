
var TLORM = TLORM || {};
// seedrandom.js version 2.0.
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
		this.systems[i].update(game);
	}
};



TLORM.ResourceManager = function() {
	this.images = {};
	this.files = {};
	this.json = {};
	this.to_load = 0;
};

TLORM.ResourceManager.prototype.addImage = function(src) {
	if (this.images[src]) {
		return this.images[src].img;
	}
	var image = new Image();
	++this.to_load;
	var rm = this;
	image.onload = function() {
		--rm.to_load;
		rm.images[src].loaded = true;
	};
	image.src = src + "?" + new Date().getTime();
	
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
	ajax.open('GET', src + "?" + new Date().getTime(), false);
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
	ajax.open('GET', src + "?" + new Date().getTime(), false);
	ajax.send();
	
	return this.json[src].contents;
};

TLORM.ResourceManager.prototype.getJSON = function(src) {
	return this.json[src].contents;
};

TLORM.ResourceManager.prototype.allLoaded = function(game) {
	return this.to_load === 0;
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
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	
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
/* store all systems inside this object */
TLORM.System = {
};
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
	this.stop();
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

TLORM.EntityManager = function() {
	this.next_id = 1;
	this.entities = [];
	this.entities_by_type = {};
	this.entities_by_id = {};
};

TLORM.EntityManager.prototype.addEntity = function(entity) {
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
};

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