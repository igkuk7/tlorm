
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



