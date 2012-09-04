
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


