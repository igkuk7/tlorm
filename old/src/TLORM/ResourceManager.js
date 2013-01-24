
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



