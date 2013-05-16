TLORMEngine.ResourceManager = function() {
	this.images = {};
	this.sounds = {};
	this.to_load = 0;
	this.num_items = 0;
	this.no_cache = true;

	// create an internal canvas for reading image pixel data
	this.canvas = document.createElement("canvas");
	this.context = this.canvas.getContext("2d");
};

TLORMEngine.ResourceManager.prototype.loadImage = function(src, cb) {
	if (this.images[src]) {
		return this.images[src].img;
	}

	var image = new Image();
	this.to_load += 1;
	this.num_items += 1;
	var resource_manager = this;
	image.onload = function() {
		if (cb) {
			cb.call(resource_manager);
		}
		resource_manager.to_load -= 1;
		resource_manager.images[src].loaded = true;
	};
	if (this.no_cache) {
		image.src = src + "?" + new Date().getTime();
	} else {
		image.src = src;
	}

	this.images[src] = {
		img : image,
		loaded : false
	};
	return image;
};

TLORMEngine.ResourceManager.prototype.getImageData = function(src) {
	// check if its been loaded before and return it
	if (this.images[src].image_data) {
		return D;
	}

	// setup canvas and put the image on
	this.canvas.width = this.images[src].img.width;
	this.canvas.height = this.images[src].img.height;
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.context.drawImage(this.images[src].img, 0, 0);

	// now read its imaghe data
	this.images[src].image_data = new TLORMEngine.Graphics.ImageData({
		width : this.canvas.width,
		height : this.canvas.width,
		image_data : this.context.getImageData(0, 0, this.canvas.width, this.canvas.height),
	});
	return this.images[src].image_data;
};

TLORMEngine.ResourceManager.prototype.getImage = function(src) {
	if (this.images[src] && this.images[src].loaded) {
		return this.images[src].img;
	}
	return null;
};

TLORMEngine.ResourceManager.prototype.loadSpriteSheet = function(src, tile_width, tile_height, num_colours) {
	// load as image, but add custom loaded callback
	return this.loadImage(src, function() {
		this.images[src].sprite_sheet = new TLORMEngine.Graphics.SpriteSheet({
			image : this.images[src].img,
			tile_width : tile_width,
			tile_height : tile_height,
			num_colours : num_colours,
			image_data : this.getImageData(src),
			context : this.context,
		});
	});
};

TLORMEngine.ResourceManager.prototype.getSpriteSheet = function(src) {
	if (this.images[src] && this.images[src].loaded) {
		return this.images[src].sprite_sheet;
	}
	return null;
};

TLORMEngine.ResourceManager.prototype.allLoaded = function(game) {
	return this.to_load === 0;
};

TLORMEngine.ResourceManager.prototype.loadSound = function(src, cb) {
	if (this.sounds[src]) {
		return this.sounds[src].sound;
	}

	var sound = new Audio();
	this.to_load += 1;
	this.num_items += 1;
	var resource_manager = this;
	sound.addEventListener('canplaythrough', function() {
		if (cb) {
			cb.call(resource_manager);
		}
		resource_manager.to_load -= 1;
		resource_manager.sounds[src].loaded = true;
	});
	if (this.no_cache) {
		sound.src = src + "?" + new Date().getTime();
	} else {
		sound.src = src;
	}

	this.sounds[src] = {
		sound : sound,
		loaded : false
	};
	return sound;
};

TLORMEngine.ResourceManager.prototype.getSound = function(src) {
	if (this.sounds[src] && this.sounds[src].loaded) {
		return this.sounds[src].sound;
	}
	return null;
};

