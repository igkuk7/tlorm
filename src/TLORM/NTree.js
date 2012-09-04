
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