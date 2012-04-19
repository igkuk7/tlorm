TLORM.QuickEntity.Card=function(c,d,g,f,a,i,b,e){return c.entity_manager.addEntity(new TLORM.Entity(d,[TLORM.Component.Render(1,f,null,null,g),TLORM.Component.Card(f),],a,i,b,e))};TLORM.QuickEntity.RandomCards=function(p,c,f,a,o,k,d){var b=d.length*2;var m=largest_factor(b);var q=b/m;var h=d.concat(d);h.sort(function(){return 0.5-Math.random()});for(var g=0;g<m;++g){for(var e=0;e<q;++e){var n=o+(f+o)*g;var l=k+(a+k)*e;TLORM.QuickEntity.Card(p,"","#CCC",h.pop(),n,l,f,a)}}return{w:(m+1)*(f+o),h:(q+1)*(a+k)}};function largest_factor(b){for(var c=Math.floor(b/2);c>0;--c){var a=b/c;if(a%1==0){return c}}}TLORM.System.UserInput=function(){return{type:"UserInput",touch_event:null,init:function(a){var b=this;a.registerEvent("click",function(c){b.clickHandler(c)});a.registerEvent("touch",function(c){b.clickHandler(c)})},clickHandler:function(a){this.touch_event=a},update:function(a){var c=this.cardClicked(a);if(c){var b=c.getComponentByType("Card");var d=c.getComponentByType("Animation");if(!b.face_up&&!d){this.flipCard(a,c,b)}}},cardClicked:function(a){if(this.touch_event){var c=this.touch_event;this.touch_event=null;var d=a.entity_manager.getEntitiesByType("Card");for(var b=0;b<d.length;++b){if(d[b].x<=c.offsetX&&c.offsetX<=d[b].x+d[b].w&&d[b].y<=c.offsetY&&c.offsetY<=d[b].y+d[b].h){return d[b]}}}return null},flipCard:function(c,e,d){var f={x:e.x,y:e.y,w:e.w,h:e.h};var b=5;var a=Math.floor(e.w/b);c.entity_manager.addEntityComponent(e,TLORM.Component.Animation(b,function(g){},function(h,g){c.entity_manager.addEntityComponent(e,TLORM.Component.Transform(a,null,-2*a,null))},function(g){c.entity_manager.addEntityComponent(e,TLORM.Component.Transform(null,null,null,null,f.x,f.y,f.w,f.h));d.face_up=true}))}}};TLORM.System.RenderCards=function(b,a,c){return{type:"RenderCards",context:b,w:a,h:c,update:function(d){this.context.clearRect(0,0,this.w,this.h);var f=this.getCards(d);for(var e=0;e<f.length;++e){this.renderCard(f[e])}},renderCard:function(e){var f=e.getComponentByType("Render");var d=e.getComponentByType("Card");if(d.face_up){this.context.fillStyle=f.fill_colour}else{this.context.fillStyle=f.other_fill_colour}this.context.fillRect(e.x,e.y,e.w,e.h)},getCards:function(d){return d.entity_manager.getEntitiesByType("Card")}}};TLORM.System.Scoring=function(){return{type:"Scoring",update:function(a){var g=[];var f=this.getCards(a);var d=f.length;for(var c=0;c<f.length;++c){var b=f[c].getComponentByType("Card");var e=f[c].getComponentByType("Animation");if(b.matched){--d}else{if(b.face_up&&!e){g.push({card:f[c],card_data:b})}}}if(d==0){a.gameOver(true,"You did it!")}if(g[0]&&g[1]){if(g[0].card_data.value==g[1].card_data.value){g[0].card_data.matched=true;g[1].card_data.matched=true}else{for(var c=0;c<g.length;++c){this.flipCard(a,g[c].card,g[c].card_data)}}}},getCards:function(a){return a.entity_manager.getEntitiesByType("Card")},flipCard:function(c,e,d){var f={x:e.x,y:e.y,w:e.w,h:e.h};var b=5;var a=Math.floor(e.w/b);c.entity_manager.addEntityComponent(e,TLORM.Component.Animation(b,function(g){},function(h,g){c.entity_manager.addEntityComponent(e,TLORM.Component.Transform(a,null,-2*a,null))},function(g){c.entity_manager.addEntityComponent(e,TLORM.Component.Transform(null,null,null,null,f.x,f.y,f.w,f.h));d.face_up=false}))}}};window.onload=function(){var d=document.getElementById("tlorm_game_canvas");var c=new TLORM.Game("LeoDots",d);var b=100;var g=150;var a=10;var f=10;var e=TLORM.QuickEntity.RandomCards(c,"Random",b,g,a,f,["#F00","#0F0","#00F"]);c.setSize(e.w,e.h);c.system_manager.addSystem(new TLORM.System.RenderCards(c.canvasContext(),d.width,d.height));c.system_manager.addSystem(new TLORM.System.UserInput());c.system_manager.addSystem(new TLORM.System.Scoring());c.start()};TLORM.Component.Card=function(a){return{type:"Card",value:a,face_up:false,matched:false}};