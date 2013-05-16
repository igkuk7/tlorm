TLORM.System.RenderRoom=function(d,b,e,a,g,f,c){return{type:"RenderRoom",context:d,w:b,h:e,light:a,objects:g,mirrors:f,lights:c,moving:false,light_on:false,moveTarget:null,moveEvent:null,keyUpEvent:null,firstRender:true,collisions:[],init:function(s){var j=this;s.registerEvent("mousemove",function(i){j.moveHandler(i)});s.registerEvent("click",function(i){j.clickHandler(i)});s.registerEvent("keyup",function(i){j.keyUpHandler(i)});this.light.movement_threshold=Math.pow(this.light.speed,2);this.light.target=new TLORM.Math.Point(this.light.target_x,this.light.target_y);this.max_reflections=1;for(var m=0;m<this.lights.length;++m){this.lights[m].target=new TLORM.Math.Point(this.lights[m].target_x,this.lights[m].target_y)}for(var r=0;r<this.w;++r){var q=[];for(var o=0;o<this.h;++o){q.push({type:0})}this.collisions.push(q)}for(var m=0;m<this.objects.length;++m){var l=this.objects[m];var k=l.x;var p=l.y;var h=l.x+l.w;var n=l.y+l.h;var t=new TLORM.Math.Quadrilateral(new TLORM.Math.Point(k,p),new TLORM.Math.Point(h,p),new TLORM.Math.Point(h,n),new TLORM.Math.Point(k,n));for(var r=k;r<=h;++r){for(var o=p;o<=n;++o){this.collisions[r][o]={type:1,object:l,square:t,}}}}for(var m=0;m<this.mirrors.length;++m){var u=this.mirrors[m].x+this.mirrors[m].w;for(var r=this.mirrors[m].x;r<=u;++r){var l=this.mirrors[m];var k=l.x;var p=l.y;var h=l.x+l.w;var n=l.y+l.h;var t=new TLORM.Math.Quadrilateral(new TLORM.Math.Point(k,p),new TLORM.Math.Point(h,p),new TLORM.Math.Point(h,n),new TLORM.Math.Point(k,n));for(var r=k;r<=h;++r){for(var o=p;o<=n;++o){this.collisions[r][o]={type:2,object:l,square:t,}}}}}},keyUpHandler:function(h){if(this.keyUpEvent){this.keyUpEvent=null}else{this.keyUpEvent=h}},clickHandler:function(h){if(this.keyUpEvent){this.moving=false;this.moveTarget=null}else{if(h.button==0){this.moving=true;this.moveTarget=h}}},moveHandler:function(h){if(this.keyUpEvent){this.moveEvent=null}else{this.moveEvent=h}},update:function(l){if((this.moveEvent&&(this.moving||this.light_on))||this.firstRender){this.firstRender=false;this.context.clearRect(0,0,this.w,this.h);this.context.fillStyle="#000";this.context.fillRect(0,0,this.w,this.h);if(this.moveEvent){this.moveLightTowards(this.moveEvent.offsetX,this.moveEvent.offsetY);if(this.moveTarget&&this.light.x==this.moveTarget.offsetX&&this.light.y==this.moveTarget.offsetY){this.moving=false}}this.context.strokeStyle="#CCC";for(var n=0;n<this.objects.length;++n){var m=this.objects[n]}this.context.strokeStyle="#CCF";for(var n=0;n<this.mirrors.length;++n){var o=this.mirrors[n];this.context.strokeRect(o.x,o.y,o.w,o.h)}var k=[];for(var n=0;n<this.lights.length;++n){k=k.concat(this.drawLight(this.lights[n]))}k=k.concat(this.drawLight(this.light));k.sort(function(p,i){if(p.point_a.equals(i.point_a)){return p.length()-i.length()}else{return 1}});this.context.fillStyle="#FFF";for(var n=1;n<k.length;++n){var j=k[n-1];var h=k[n];if(!j.point_a.equals(h.point_a)){continue}if(j.point_b.x==h.point_b.x||j.point_b.y==h.point_b.y){this.context.beginPath();this.context.moveTo(Math.floor(j.point_a.x),Math.floor(j.point_a.y));this.context.lineTo(Math.floor(j.point_b.x),Math.floor(j.point_b.y));this.context.lineTo(Math.floor(h.point_b.x),Math.floor(h.point_b.y));this.context.lineTo(Math.floor(h.point_a.x),Math.floor(h.point_a.y));this.context.fill()}else{}}}},moveLightTowards:function(j,i,h,o){this.light.target=new TLORM.Math.Point(j,i);if(this.moving&&this.moveTarget){h=this.moveTarget.offsetX;o=this.moveTarget.offsetY;var n=(h-this.light.x<0?1:-1);var k=(o-this.light.y<0?1:-1);var m=Math.abs(h-this.light.x);if(m>this.light.movement_threshold){if(h<this.light.x){this.light.x-=this.light.speed}else{if(h>this.light.x){this.light.x+=this.light.speed}}}var l=Math.abs(o-this.light.y);if(l>this.light.movement_threshold){if(o<this.light.y){this.light.y-=this.light.speed}else{if(o>this.light.y){this.light.y+=this.light.speed}}}if(this.collisions[this.light.x][this.light.y].type>0){this.moving=false;while(this.collisions[this.light.x][this.light.y].type>0){this.light.x+=n;this.light.y+=k}}}},drawLight:function(p,G){var H=new TLORM.Math.Point(p.x,p.y);var m=p.target;var B=new TLORM.Math.Line(H,m);var E=m.x-H.x;var l=m.y-H.y;var v=Math.abs(E);var u=Math.abs(l);if(E<0&&v>u){B.moveEndPointToX(0)}else{if(E>0&&v>u){B.moveEndPointToX(this.w)}else{if(l<0&&u>v){B.moveEndPointToY(0)}else{if(l>0&&u>v){B.moveEndPointToY(this.h)}}}}var x=B.getEndPoint();if(x.x==Number.POSITIVE_INFINITY||x.x==Number.NEGATIVE_INFINITY){throw"foo"}this.context.fillStyle="#FEE";this.context.strokeStyle="#FEE";var n=this.drawLightRay(p,G);var t=[];for(var D=0;D<=p.spread;D+=0.1){var o=B.copy();o.rotateAroundStart(TLORM.Math.degrees_to_radians(D+1));var F=o.getEndPoint();var E=F.x-H.x;var l=F.y-H.y;var v=Math.abs(E);var u=Math.abs(l);var C=[];if(E<0&&v>u){o.moveEndPointToX(0);C=o.getPointsOnLineFromX(0,p.x-1).reverse()}else{if(E>0&&v>u){o.moveEndPointToX(this.w);C=o.getPointsOnLineFromX(p.x+1,this.w)}else{if(l<0&&u>v){o.moveEndPointToY(0);C=o.getPointsOnLineFromY(0,p.y-1).reverse()}else{if(l>0&&u>v){o.moveEndPointToY(this.h);C=o.getPointsOnLineFromY(p.y+1,this.h)}}}}var k=o.getEndPoint();var s=null;var r=false;for(var A=0;A<C.length;++A){var z=C[A];if(this.collisions[z.x]&&this.collisions[z.x][z.y]&&this.collisions[z.x][z.y].type>0&&(!p.source_square||p.source_square!=this.collisions[z.x][z.y].square)){k=z;s=this.collisions[z.x][z.y].square;if(this.collisions[z.x][z.y].type==2){r=true}break}}o.setEndPoint(k);F=k;var h=(D>0?t[t.length-1]:null);if(h&&!(Math.abs(h.target.x-F.x)<1||Math.abs(h.target.y-F.y)<1)){var w=s||h.collision_square;var q=(w?w.cornerBetweenPoints(h.target,F):null);if(q){t.push({x:p.x,y:p.y,target:q.copy(),size:p.size,spread:p.spread,hit_mirror:r,collision_square:w,collision_point:q.copy(),});n.concat(this.drawLight({x:p.x,y:p.y,target:q,spread:0,},G))}}t.push({x:p.x,y:p.y,target:F,size:p.size,spread:p.spread,hit_mirror:r,collision_square:s,collision_point:k,})}this.context.fillStyle="#FFF";this.context.strokeStyle="#FFF";for(var D=0;D<t.length;++D){var y=this.drawLightRay(t[D],G);n=n.concat(y)}return n},drawLightRay:function(l,m){m=m||1;var n=new TLORM.Math.Point(l.x,l.y);var k=l.target;var q=new TLORM.Math.Line(n,k);this.context.beginPath();this.context.arc(n.x,n.y,l.size,0,TLORM.Math.TwoPI,true);this.context.fill();if(this.light_on){this.context.beginPath();this.context.moveTo(q.point_a.x,q.point_a.y);this.context.lineTo(q.point_b.x,q.point_b.y);this.context.stroke()}var p=[q.copy()];if(l.hit_mirror&&m<=this.max_reflections){var j=l.collision_point.x-n.x;var o=l.collision_point.y-n.y;var i=n.x;var h=n.y;if(l.collision_square.pointOnLeft(l.collision_point)||l.collision_square.pointOnRight(l.collision_point)){h+=2*o}else{if(l.collision_square.pointOnTop(l.collision_point)||l.collision_square.pointOnBottom(l.collision_point)){i+=2*j}}p=p.concat(this.drawLight({x:l.collision_point.x,y:l.collision_point.y,target:new TLORM.Math.Point(i,h),source_square:l.collision_square,spread:l.spread-m,},m+1))}return p},}};window.onload=function(){var b=document.getElementById("tlorm_game_canvas");var a=new TLORM.Game("Vampires",b);a.setSize(600,400);a.system_manager.addSystem(new TLORM.System.RenderRoom(a.canvasContext(),b.width,b.height,{x:300,y:200,size:10,speed:5,target_x:0,target_y:0,spread:10},[{x:50,y:50,w:150,h:30},{x:350,y:80,w:50,h:50},{x:450,y:350,w:10,h:35},],[{x:500,y:100,w:50,h:200},{x:50,y:200,w:100,h:100},{x:300,y:20,w:200,h:20},{x:200,y:370,w:200,h:20},],[{x:0,y:400,size:2,speed:5,target_x:600,target_y:0,spread:5},]));a.start()};