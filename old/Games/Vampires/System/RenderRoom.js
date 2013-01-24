

/* system to render room */
TLORM.System.RenderRoom = function(context, w, h, light, objects, mirrors, lights) {
	return {
		type: 'RenderRoom',
		context: context,
		w: w,
		h: h,
		light: light,
		objects: objects,
		mirrors: mirrors,
		lights: lights,
		moving: false,
		light_on: false,
		moveTarget: null,
		moveEvent: null,
		keyUpEvent: null,
		firstRender: true,
		collisions: [],
		init: function(game) {
			/* register control callbacks for player */
			var system = this;
			game.registerEvent("mousemove", function(event) { system.moveHandler(event); } );
			game.registerEvent("click", function(event) { system.clickHandler(event); } );
			game.registerEvent("keyup", function(event) { system.keyUpHandler(event); } );
			
			/* setup some common values */
			this.light.movement_threshold = Math.pow(this.light.speed, 2);
			this.light.target = new TLORM.Math.Point(this.light.target_x, this.light.target_y);
			this.max_reflections = 1;

			for (var i=0; i<this.lights.length; ++i) {
				this.lights[i].target = new TLORM.Math.Point(this.lights[i].target_x, this.lights[i].target_y);
			}
			
			/* build collision map for quick collision checks */
			for (var x=0; x<this.w; ++x) {
				var x_row = [];
				for (var y=0; y<this.h; ++y) {
					x_row.push({ type: 0 });
				}
				this.collisions.push(x_row);
			}
			for (var i=0; i<this.objects.length; ++i) {
				var object = this.objects[i];
				var x1 = object.x;
				var y1 = object.y;
				var x2 = object.x+object.w;
				var y2 = object.y+object.h;
				var square = new TLORM.Math.Quadrilateral(
					new TLORM.Math.Point(x1,y1),
					new TLORM.Math.Point(x2,y2)
				);
				for (var x=x1; x<=x2; ++x) {
					for (var y=y1; y<=y2; ++y) {
						this.collisions[x][y] = {
							type: 1,
							object: object,
							square: square,
						};
					}
				}
			}
			for (var i=0; i<this.mirrors.length; ++i) {
				var end_x = this.mirrors[i].x+this.mirrors[i].w;
				for (var x=this.mirrors[i].x; x<=end_x; ++x) {
					var object = this.mirrors[i];
					var x1 = object.x;
					var y1 = object.y;
					var x2 = object.x+object.w;
					var y2 = object.y+object.h;
					var square = new TLORM.Math.Quadrilateral(
						new TLORM.Math.Point(x1,y1),
						new TLORM.Math.Point(x2,y2)
					);
					for (var x=x1; x<=x2; ++x) {
						for (var y=y1; y<=y2; ++y) {
							this.collisions[x][y] = {
								type: 2,
								object: object,
								square: square,
							};
						}
					}
				}
			}
		},
		keyUpHandler: function(event) {
			if (this.keyUpEvent) {
				this.keyUpEvent = null;
			} else {
				this.keyUpEvent = event;
			}
		},
		clickHandler: function(event) {
			if (this.keyUpEvent) {
				this.moving = false;
				this.moveTarget = null;
			} else {
				if (event.button == 0) {
					this.moving = true;
					this.moveTarget = event;
				}
			}
		},
		moveHandler: function(event) {
			if (this.keyUpEvent) {
				this.moveEvent = null;
			} else {
				this.moveEvent = event;
			}
		},
		update: function(game) {
			if ( (this.moveEvent && (this.moving || this.light_on)) || this.firstRender) {
				this.firstRender = false;
				this.context.clearRect(0, 0, this.w, this.h);
				
				this.context.fillStyle = '#000';
				this.context.fillRect(0, 0, this.w, this.h);
				
				if (this.moveEvent) {
					this.moveLightTowards(this.moveEvent.offsetX, this.moveEvent.offsetY);
					
					if (this.moveTarget && this.light.x == this.moveTarget.offsetX && this.light.y == this.moveTarget.offsetY) {
						this.moving = false;
					}
				}
				
				this.context.strokeStyle = '#CCC';
				for (var i=0; i<this.objects.length; ++i) {
					var object = this.objects[i];
					//this.context.strokeRect(object.x, object.y, object.w, object.h) ;
				}
				
				this.context.strokeStyle = '#CCF';
				for (var i=0; i<this.mirrors.length; ++i) {
					var mirror = this.mirrors[i];
					this.context.strokeRect(mirror.x, mirror.y, mirror.w, mirror.h) ;
				}
				
				var rays = [];
				for (var i=0; i<this.lights.length; ++i) {
					rays = rays.concat(this.drawLight(this.lights[i]));
				}
				
				rays = rays.concat(this.drawLight(this.light));
				rays.sort(function(a,b) {
					if (a.point_a.equals(b.point_a)) {
						return a.length() - b.length();
					} else {
						return 1;
					}
				});
				
				this.context.fillStyle = '#FFF';
				for (var i=1; i<rays.length; ++i) {
					var light_line_a = rays[i-1];
					var light_line_b = rays[i];
					if (!light_line_a.point_a.equals(light_line_b.point_a)) {
						continue;
					}
					
					/* make a triangle between adjacent rays
					 * if target are on same x or y then we're good
					 * if not then need to find the point at which they changed
					 */
					
					
					if (   light_line_a.point_b.x == light_line_b.point_b.x
					    || light_line_a.point_b.y == light_line_b.point_b.y
					) {
						this.context.beginPath();
						this.context.moveTo(Math.floor(light_line_a.point_a.x), Math.floor(light_line_a.point_a.y));
						this.context.lineTo(Math.floor(light_line_a.point_b.x), Math.floor(light_line_a.point_b.y));
						this.context.lineTo(Math.floor(light_line_b.point_b.x), Math.floor(light_line_b.point_b.y));
						this.context.lineTo(Math.floor(light_line_b.point_a.x), Math.floor(light_line_b.point_a.y));
						this.context.fill();
					} else {
						// find corner point between rays and draw triangle up to that point, and then rays beyond it
					}
					
					
					
				}
			}
		},
		moveLightTowards: function(tx,ty,x,y) {
			this.light.target = new TLORM.Math.Point(tx, ty);
			
			if (this.moving && this.moveTarget) {
				x = this.moveTarget.offsetX;
				y = this.moveTarget.offsetY;
				var x_dir = ( x - this.light.x < 0 ? 1 : -1 );
				var y_dir = ( y - this.light.y < 0 ? 1 : -1 );
				
				var x_diff = Math.abs(x - this.light.x);
				if (x_diff > this.light.movement_threshold) {
					if (x < this.light.x) {
						this.light.x -= this.light.speed;
					} else if (x > this.light.x) {
						this.light.x += this.light.speed;
					}
				}
	
				var y_diff = Math.abs(y - this.light.y);
				if (y_diff > this.light.movement_threshold) {
					if (y < this.light.y) {
						this.light.y -= this.light.speed;
					} else if (y > this.light.y) {
						this.light.y += this.light.speed;
					}
				}
				
				if (this.collisions[this.light.x][this.light.y].type > 0) {
					this.moving = false;
					while (this.collisions[this.light.x][this.light.y].type > 0) {
						this.light.x += x_dir;
						this.light.y += y_dir;
					}
				}
			}
		},
		drawLight: function(light, depth) {
			var light_point = new TLORM.Math.Point(light.x, light.y);
			var target_point = light.target;
			var light_line = new TLORM.Math.Line(light_point, target_point);

			/* find what the light hits first and draw the line to that point */
			var x_diff = target_point.x - light_point.x;
			var y_diff = target_point.y - light_point.y;
			var x_diff_abs = Math.abs(x_diff);
			var y_diff_abs = Math.abs(y_diff);
			if (x_diff < 0 && x_diff_abs > y_diff_abs) {
				light_line.moveEndPointToX(0);
			} else if (x_diff > 0 && x_diff_abs > y_diff_abs) {
				light_line.moveEndPointToX(this.w);
			} else if (y_diff < 0 && y_diff_abs > x_diff_abs) {
				light_line.moveEndPointToY(0);
			} else if (y_diff > 0 && y_diff_abs > x_diff_abs) {
				light_line.moveEndPointToY(this.h);
			}
			
			var wall_target = light_line.getEndPoint();
			if (wall_target.x==Number.POSITIVE_INFINITY || wall_target.x == Number.NEGATIVE_INFINITY) {
				throw "foo";
			}

			this.context.fillStyle = '#FEE';
			this.context.strokeStyle = '#FEE';
			var ray_lines = this.drawLightRay(light, depth);
			
			/* calculate the different spread of rays and draw each */
			var rays = [];
			for (var i=0; i<=light.spread; i+=0.1) {
				var ray_line = light_line.copy();
				ray_line.rotateAroundStart(TLORM.Math.degrees_to_radians(i+1));
				var target = ray_line.getEndPoint();
				
				/* find what the light hits first and draw the line to that point */
				var x_diff = target.x - light_point.x;
				var y_diff = target.y - light_point.y;
				var x_diff_abs = Math.abs(x_diff);
				var y_diff_abs = Math.abs(y_diff);
				var points = [];
				if (x_diff < 0 && x_diff_abs > y_diff_abs) {
					ray_line.moveEndPointToX(0);
					points = ray_line.getPointsOnLineFromX(0, light.x-1).reverse();
				} else if (x_diff > 0 && x_diff_abs > y_diff_abs) {
					ray_line.moveEndPointToX(this.w);
					points = ray_line.getPointsOnLineFromX(light.x+1, this.w)
				} else if (y_diff < 0 && y_diff_abs > x_diff_abs) {
					ray_line.moveEndPointToY(0);
					points = ray_line.getPointsOnLineFromY(0, light.y-1).reverse();
				} else if (y_diff > 0 && y_diff_abs > x_diff_abs) {
					ray_line.moveEndPointToY(this.h);
					points = ray_line.getPointsOnLineFromY(light.y+1, this.h)
				}
				
				/* find first collision point and if there is one and stop light there */
				var collision_point = ray_line.getEndPoint();
				var collision_square = null;
				var is_mirror = false;
				for (var j=0; j<points.length; ++j) {
					var point = points[j];
					if (   this.collisions[point.x]
					    && this.collisions[point.x][point.y]
					    && this.collisions[point.x][point.y].type > 0
					    && (   !light.source_square
					        || light.source_square != this.collisions[point.x][point.y].square
					    )
					) {
						collision_point = point;
						collision_square = this.collisions[point.x][point.y].square;
						if (this.collisions[point.x][point.y].type==2) {
							is_mirror = true;
						}
						break;
					}
				}
				
				ray_line.setEndPoint(collision_point);
				target = collision_point;
				
				// if this ray is not on same x/y plane as previous it means
				// rays are going past corner of object
				// find that corner and add a ray to the corner and a ray past it
				var last_ray = (i > 0 ? rays[rays.length-1] : null );
				if (last_ray && !(Math.abs(last_ray.target.x - target.x) < 1 || Math.abs(last_ray.target.y - target.y) < 1) ) {
					
					// find which corner of the object we need to stop at
					var square = collision_square || last_ray.collision_square
					var corner = (square ? square.cornerBetweenPoints(last_ray.target, target) : null);
					if (corner) {
						/* add an extra ray to the corner */
						rays.push({
							x:             light.x,
							y:             light.y,
							target:        corner.copy(),
							size:          light.size,
							spread:        light.spread,
							hit_mirror:    is_mirror,
							collision_square: square,
							collision_point: corner.copy(),
						});
						
						/* send new "light" to the corner in case it needs to pass the corner */
						ray_lines.concat(this.drawLight(
							{
								x:             light.x,
								y:             light.y,
								target:        corner,
								spread:        0,
							},
							depth
						));
					}
				}
			
				rays.push({
					x:             light.x,
					y:             light.y,
					target:        target,
					size:          light.size,
					spread:        light.spread,
					hit_mirror:    is_mirror,
					collision_square: collision_square,
					collision_point: collision_point,
				});
			}

			this.context.fillStyle = '#FFF';
			this.context.strokeStyle = '#FFF';
			for (var i=0; i<rays.length; ++i) {
				var light_rays = this.drawLightRay(rays[i], depth);
				ray_lines = ray_lines.concat(light_rays);
			}
			
			return ray_lines;
		},
		drawLightRay: function(light, depth) {
			depth = depth || 1;
			var light_point = new TLORM.Math.Point(light.x, light.y);
			var target_point = light.target;
			var light_line = new TLORM.Math.Line(light_point, target_point);

			this.context.beginPath();
			this.context.arc(light_point.x, light_point.y, light.size, 0, TLORM.Math.TwoPI, true);
			this.context.fill();
			
			if (this.light_on) {
				this.context.beginPath();
				this.context.moveTo(light_line.point_a.x, light_line.point_a.y);
				this.context.lineTo(light_line.point_b.x, light_line.point_b.y);
				this.context.stroke();
			}
			var ray_lines = [light_line.copy()];
			
			/* if hit mirror, then need to treat as new light source */
			if (light.hit_mirror && depth <= this.max_reflections) {
				var x_diff = light.collision_point.x - light_point.x;
				var y_diff = light.collision_point.y - light_point.y;
				var target_x = light_point.x;
				var target_y = light_point.y;
				
				/* need to find which of object side we are hitting */
				if (light.collision_square.pointOnLeft(light.collision_point) || light.collision_square.pointOnRight(light.collision_point)) {
					target_y += 2*y_diff;
				} else if (light.collision_square.pointOnTop(light.collision_point) || light.collision_square.pointOnBottom(light.collision_point)) {
					target_x += 2*x_diff;
				}
				
				ray_lines = ray_lines.concat(this.drawLight(
					{
						x:             light.collision_point.x,
						y:             light.collision_point.y,
						target:        new TLORM.Math.Point(target_x, target_y),
						source_square: light.collision_square,
						spread:        light.spread-depth,
					},
					depth+1
				));
			}
			
			return ray_lines;
		},
	};
};