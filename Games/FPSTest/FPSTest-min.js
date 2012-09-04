TLORM.Component.Camera=function(a){return{type:"Camera",angle:a}};TLORM.Component.Map=function(a){return{type:"Map",map:a,w:a[0].length,h:a.length,}};TLORM.QuickEntity.MiniMap=function(c,d,a,g,b,e,f){return c.entity_manager.addEntity(new TLORM.Entity(d,[TLORM.Component.Render(1),TLORM.Component.Map(f)],a,g,b,e))};TLORM.QuickEntity.Map=function(c,d,a,g,b,e,f){return c.entity_manager.addEntity(new TLORM.Entity(d,[TLORM.Component.Render3D(1),TLORM.Component.Map(f)],a,g,b,e))};TLORM.System.RenderX=function(b,a,c){return{type:"Render",context:b,w:a,h:c,update:function(d){var f=this.getMap(d);var e=f.getComponentByType("Map");this.renderMap(d,f,e)},getMap:function(d){var f=d.entity_manager.getEntitiesByType("Map");for(var e=0;e<f.length;++e){if(f[e].getComponentByType("Render")){return f[e]}}return null},renderMap:function(n,g,d){this.context.strokeStyle="#000";this.context.strokeRect(g.x,g.y,g.w,g.h);var o=g.w/d.w;var k=g.h/d.h;for(var h=0;h<d.w;++h){for(var f=0;f<d.h;++f){var m=g.x+(o*h);var l=g.y+(k*f);if(d.map[f][h]>0){var e=255-(20*d.map[f][h]);this.context.fillStyle="rgb("+e+","+e+","+e+")"}else{this.context.fillStyle="#FFF"}this.context.fillRect(m,l,o,k)}}}}};TLORM.System.Render3D=function(c,a,d){var b=2*Math.PI;return{type:"Render3D",context:c,w:a,h:d,camera:{x:0,y:0,d:10},update:function(e){this.context.clearRect(0,0,this.w,this.h);var g=this.getMap(e);var f=g.getComponentByType("Map");this.renderMap(e,g,f)},getMap:function(e){var g=e.entity_manager.getEntitiesByType("Map");for(var f=0;f<g.length;++f){if(g[f].getComponentByType("Render3D")){return g[f]}}return null},renderMap:function(m,g,f){var n=g.w/f.w;var j=g.h/f.h;for(var k=0;k<f.length;++k){for(var l=0;l<f[k].length;++l){var h=(this.camera.d*(f[k][l]-this.camera.y))/k;var i=(this.camera.d*(l-this.camera.x))/k;this.context.fillStyle="rgb("+e[0]+","+e[1]+","+e[2]+")";this.context.fillRect(i,h,1,1)}}return;for(var l=g.x;l<g.w;++l){for(var k=g.y;k<g.h;++k){var e=this.sendRay(m,g,f,l,k);this.context.fillStyle="rgb("+e[0]+","+e[1]+","+e[2]+")";this.context.fillRect(l,k,1,1)}}},sendRay:function(o,g,e,i,h){var q=g.w/e.w;var j=g.h/e.h;var m=Math.floor(i/q);var p=g.h-h;var l=null;for(var k=e.h-1;k>=0;--k){var n=e.map[k][m]*j;if(n!=0&&p<n){l=k}}if(l){var f=255-(20*l);return[f,f,f]}return[255,255,255]},renderMapX:function(g,k,j,e){var i=(-k.w/2)+e;var l=Math.sqrt(Math.pow(i,2)+Math.pow(this.camera.x,2));var f=Math.asin(i/l);var h=(f+this.camera.angle)%b;this.castRay(g,k,j,h)},castRay:function(q,h,e,f){var p=(f<b*0.25||b*0.75<f);var i=(f<0||Math.PI<f);var g=Math.sin(f);var j=Math.cos(f);var t=h.w/e.w;var k=h.h/e.h;var s=(p?1:-1);var r=Math.round((s*(g/j))/t)||1;var l=0;var n;for(var o=Math.floor(this.camera.x/t);0<=o&&o<e.w;o+=s){for(var m=Math.floor(this.camera.y/k);0<=m&&m<e.h;m+=r){if(e.map[m][o]==1){l=Math.pow(o-this.camera.x,2)+Math.pow(m-this.camera.y,2);n={x:o,y:m};break}}}if(l>0){this.renderRay(q,h,e,n.x,n.y)}},renderRay:function(g,i,h,e,k){var j=i.w/h.w;var f=i.h/h.h;this.context.strokeStyle="#00F";this.context.beginPath();this.context.moveTo(this.camera.x*j,this.camera.y*j);this.context.lineTo(e*j,k*j);this.context.stroke()}}};var game;window.onload=function(){start_game()};function start_game(a){var c=document.getElementById("tlorm_game_canvas");if(game){game.stop()}game=new TLORM.Game("FPS Test",c);var b=TLORM.QuickEntity.Box(game,"box1",100,100,100,100,100,100);game.setSize(800,600);game.start()};