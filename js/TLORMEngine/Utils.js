
// basic inheritence
Function.prototype.extends = function(object) {
	this.prototype = new object({});
	this.prototype.constructor = this;
	this.prototype.super = object.prototype;
};

TLORMEngine.Utils = {};

// ajax stuff
TLORMEngine.Utils.xhr = function() {
	var xhr;
	if (window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();  
	} else {  
		xhr = new ActiveXObject("Microsoft.XmlHttp");  
	}
	return xhr;
};
TLORMEngine.Utils.get_file = function(url) {
	var contents = null;
	var xhr = TLORMEngine.Utils.xhr();

	xhr.open("GET", url, false);  
	xhr.send(null);  

	// synchronous call so will hang until gets response
	// no need for callback
	return xhr.responseText;
};

TLORMEngine.Utils.get_json = function(url) {
	var file_contents = TLORMEngine.Utils.get_file(url);
	var json_contents;
	try {
		json_contents = JSON.parse(file_contents);
	} catch (error) { 
		TLORMEngine.Utils.error(error, true);
	}
	return json_contents;
};

TLORMEngine.Utils.get_xml = function(url) {
	var contents = null;
	var xhr = TLORMEngine.Utils.xhr();

	xhr.open("GET", url, false);  
	xhr.send(null);  

	// synchronous call so will hang until gets response
	// no need for callback
	return xhr.responseXML;
};

TLORMEngine.Utils.error = function(error, fatal) {
	console.log(error);
	if (fatal) {
		throw error;
		alert(error);
	}
};

TLORMEngine.Utils.random_number_in_range = function(min, max) {
	return min+Math.round(Math.random()*(max-min));
};

TLORMEngine.Utils.merge_objects = function(a, b) {
	var o = {};
	for (var k in a) { o[k] = a[k]; }
	for (var k in b) { o[k] = b[k]; }
	return o;
}
TLORMEngine.Utils.array_to_keyed_object = function(array, value) {
	var o = {};
	for (var i=0; i<array.length; ++i) {
		o[array[i]] = value || true;
	}
	return o;
}