function Dotgrid(width,height,grid_x,grid_y,block_x,block_y,thickness = 3,linecap = "round",linejoin = "round", color = "#000000")
{
  this.controller = new Controller();
  this.theme = new Theme();
  this.interface = new Interface();
  this.history = new History();
  this.guide = new Guide();
  this.render = new Render();
  this.tool = new Tool();

  this.width = width;
  this.height = height;
  this.grid_x = grid_x;
  this.grid_y = grid_y;
  this.block_x = block_x;
  this.block_y = block_y;

  this.thickness = thickness;
  this.linecap = linecap;
  this.linejoin = linejoin;
  this.color = color;
  this.offset = new Pos(0,0);

  // Dotgrid
  this.element = document.createElement("div");
  this.element.id = "dotgrid";
  this.element.style.width = this.width;
  this.element.style.height = this.height;

  this.wrapper = document.createElement("div");
  this.wrapper.id = "wrapper";

  this.grid_width = this.width/this.grid_x;
  this.grid_height = this.height/this.grid_y;

  var cursor = null;

  this.svg_el = null;
  this.mirror_el = null;
  this.mirror = false;
  this.fill = false;
  this.layer_1 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.layer_1.id = "layer_1"; this.layer_1.style.stroke = "black";
  this.layer_2 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.layer_2.id = "layer_2"; this.layer_2.style.stroke = "#999";
  this.layer_3 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.layer_3.id = "layer_3"; this.layer_3.style.stroke = "#ccc";
  this.mirror_layer_1 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.mirror_layer_1.id = "mirror_layer_1"; this.mirror_layer_1.style.stroke = "black";
  this.mirror_layer_2 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.mirror_layer_2.id = "mirror_layer_2"; this.mirror_layer_2.style.stroke = "#999";
  this.mirror_layer_3 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.mirror_layer_3.id = "mirror_layer_3"; this.mirror_layer_3.style.stroke = "#ccc";
  this.scale = 1;

  this.install = function()
  {  
    document.getElementById("app").appendChild(this.wrapper);
    this.wrapper.appendChild(this.element);
    this.element.appendChild(this.guide.el);
    this.element.appendChild(this.guide.widgets);
    this.wrapper.appendChild(this.render.el);

    // Cursors
    this.cursor = document.createElement("div");
    this.cursor.id = "cursor";
    this.element.appendChild(this.cursor);

    this.cursor_x = document.createElement("t");
    this.cursor_x.id = "cursor_x";
    this.cursor_x.className = "fl"
    this.element.appendChild(this.cursor_x);

    this.cursor_y = document.createElement("t");
    this.cursor_y.id = "cursor_y";
    this.cursor_y.className = "fl"
    this.element.appendChild(this.cursor_y);

    this.offset_el = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.mirror_el = document.createElementNS("http://www.w3.org/2000/svg", "g");
    // Vector
    this.svg_el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg_el.setAttribute("class","vector");
    this.svg_el.setAttribute("width",this.width+"px");
    this.svg_el.setAttribute("height",this.height+"px");
    this.svg_el.setAttribute("xmlns","http://www.w3.org/2000/svg");
    this.svg_el.setAttribute("baseProfile","full");
    this.svg_el.setAttribute("version","1.1");
    this.svg_el.style.width = this.width;
    this.svg_el.style.height = this.height;
    this.svg_el.style.stroke = this.color;
    this.svg_el.style.strokeWidth = this.thickness;
    this.svg_el.style.fill = "none";
    this.svg_el.style.strokeLinecap = this.linecap;
    this.svg_el.style.strokeLinejoin = this.linejoin;
    this.element.appendChild(this.svg_el);
    // Preview
    this.preview_el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.preview_el.id = "preview"
    this.preview_el.setAttribute("class","vector");
    this.preview_el.setAttribute("width",this.width+"px");
    this.preview_el.setAttribute("height",this.height+"px");
    this.preview_el.setAttribute("xmlns","http://www.w3.org/2000/svg");
    this.preview_el.setAttribute("baseProfile","full");
    this.preview_el.setAttribute("version","1.1");
    this.preview_el.style.width = this.width;
    this.preview_el.style.height = this.height;
    this.preview_el.style.strokeWidth = 2;
    this.preview_el.style.fill = "none";
    this.preview_el.style.strokeLinecap = "round";
    this.element.appendChild(this.preview_el);

    this.mirror_el.appendChild(this.mirror_layer_3)
    this.offset_el.appendChild(this.layer_3)
    this.mirror_el.appendChild(this.mirror_layer_2)
    this.offset_el.appendChild(this.layer_2)
    this.mirror_el.appendChild(this.mirror_layer_1)
    this.offset_el.appendChild(this.layer_1)
    this.svg_el.appendChild(this.offset_el);
    this.svg_el.appendChild(this.mirror_el);

    this.theme.start();
    this.guide.start();
    this.interface.start();

    this.controller.add("default","*","About",() => { require('electron').shell.openExternal('https://github.com/hundredrabbits/Dotgrid'); },"CmdOrCtrl+,");
    this.controller.add("default","*","Fullscreen",() => { app.toggle_fullscreen(); },"CmdOrCtrl+Enter");
    this.controller.add("default","*","Hide",() => { app.toggle_visible(); },"CmdOrCtrl+H");
    this.controller.add("default","*","Inspect",() => { app.inspect(); },"CmdOrCtrl+.");
    this.controller.add("default","*","Documentation",() => { dotgrid.controller.docs(); },"CmdOrCtrl+Esc");
    this.controller.add("default","*","Reset",() => { dotgrid.reset(); dotgrid.theme.reset(); },"CmdOrCtrl+Backspace");
    this.controller.add("default","*","Quit",() => { app.exit(); },"CmdOrCtrl+Q");

    this.controller.add("default","File","New",() => { dotgrid.new(); },"CmdOrCtrl+N");
    this.controller.add("default","File","Open",() => { dotgrid.open(); },"CmdOrCtrl+O");
    this.controller.add("default","File","Save",() => { dotgrid.save(); },"CmdOrCtrl+S");

    this.controller.add("default","Edit","Copy",() => { document.execCommand('copy'); },"CmdOrCtrl+C");
    this.controller.add("default","Edit","Cut",() => { document.execCommand('cut'); },"CmdOrCtrl+X");
    this.controller.add("default","Edit","Paste",() => { document.execCommand('paste'); },"CmdOrCtrl+V");
    this.controller.add("default","Edit","Undo",() => { dotgrid.tool.undo(); },"CmdOrCtrl+Z");
    this.controller.add("default","Edit","Redo",() => { dotgrid.tool.redo(); },"CmdOrCtrl+Shift+Z");
    this.controller.add("default","Edit","Delete",() => { dotgrid.tool.remove_segment(); },"Backspace");
    this.controller.add("default","Edit","Deselect",() => { dotgrid.tool.clear(); },"Esc");

    this.controller.add("default","Select","Foreground",() => { dotgrid.tool.select_layer(0); },"1");
    this.controller.add("default","Select","Middleground",() => { dotgrid.tool.select_layer(1); },"2");
    this.controller.add("default","Select","Background",() => { dotgrid.tool.select_layer(2); },"3");

    this.controller.add("default","Stroke","Line",() => { dotgrid.tool.cast("line"); },"A");
    this.controller.add("default","Stroke","Arc",() => { dotgrid.tool.cast("arc_c"); },"S"); // 0,1
    this.controller.add("default","Stroke","Arc Rev",() => { dotgrid.tool.cast("arc_r")},"D"); // 0,0
    this.controller.add("default","Stroke","Bezier",() => { dotgrid.tool.cast("bezier") },"F");
    this.controller.add("default","Stroke","Connect",() => { dotgrid.tool.cast("close") },"Z");

    this.controller.add("default","Effect","Linecap",() => { dotgrid.mod_linecap(); },"Q");
    this.controller.add("default","Effect","Linejoin",() => { dotgrid.mod_linejoin(); },"W");
    this.controller.add("default","Effect","Mirror",() => { dotgrid.mod_mirror(); },"E");
    this.controller.add("default","Effect","Fill",() => { dotgrid.toggle_fill(); },"R");

    this.controller.add("default","Effect","Thicker",() => { dotgrid.mod_thickness(1) },"}");
    this.controller.add("default","Effect","Thinner",() => { dotgrid.mod_thickness(-1) },"{");
    this.controller.add("default","Effect","Thicker +5",() => { dotgrid.mod_thickness(5,true) },"]");
    this.controller.add("default","Effect","Thinner -5",() => { dotgrid.mod_thickness(-5,true) },"[");

    this.controller.add("default","Layers","Move Above",() => { dotgrid.tool.layer_up() },"Up");
    this.controller.add("default","Layers","Move Below",() => { dotgrid.tool.layer_down() },"Down");

    this.controller.add("default","View","Tools",() => { dotgrid.interface.toggle(); },"U");
    this.controller.add("default","View","Grid",() => { dotgrid.guide.toggle(); },"H");
    this.controller.add("default","View","Control Points",() => { dotgrid.guide.toggle_widgets(); },"J");
    this.controller.add("default","View","Expert Mode",() => { dotgrid.interface.toggle_zoom(); },":");

    this.controller.commit();

    document.addEventListener('mousedown', function(e){ dotgrid.mouse_down(e); }, false);
    document.addEventListener('mousemove', function(e){ dotgrid.mouse_move(e); }, false);
    document.addEventListener('contextmenu', function(e){ dotgrid.mouse_alt(e); }, false);
    document.addEventListener('mouseup', function(e){ dotgrid.mouse_up(e);}, false);
    document.addEventListener('copy', function(e){ dotgrid.copy(e); e.preventDefault(); }, false);
    document.addEventListener('cut', function(e){ dotgrid.cut(e); e.preventDefault(); }, false);
    document.addEventListener('paste', function(e){ dotgrid.paste(e); e.preventDefault(); }, false);

    window.addEventListener('drop', dotgrid.drag);

    dotgrid.set_size({width:300,height:300});
    
    this.new();
  }

  // FILE

  this.new = function()
  {
    this.history.push(this.tool.layers);
    dotgrid.clear();
  }

  this.save = function()
  {
    this.scale = 1
    this.draw();

    if(dotgrid.fill){ dotgrid.svg_el.style.fill = "black"; dotgrid.render.draw(); }

    var svg = dotgrid.svg_el.outerHTML;

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined){ return; }
      fs.writeFile(fileName+".svg", svg);
      fs.writeFile(fileName+'.png', dotgrid.render.buffer());
      fs.writeFile(fileName+'.dot', dotgrid.tool.export());
      dotgrid.draw()
    });
  }

  this.open = function()
  {
    var paths = dialog.showOpenDialog({properties: ['openFile'],filters:[{name:"Dotgrid Image",extensions:["dot"]}]});

    if(!paths){ console.log("Nothing to load"); return; }

    fs.readFile(paths[0], 'utf-8', (err, data) => {
      if(err){ alert("An error ocurred reading the file :" + err.message); return; }
      dotgrid.tool.replace(JSON.parse(data.toString().trim()));
      dotgrid.draw();
    });
  }

  // Cursor

  this.translation = null;

  this.mouse_down = function(e)
  {
    var pos = this.position_in_grid(new Pos(e.clientX+5,e.clientY-5)); pos = this.position_on_grid(pos);

    if(e.altKey){ dotgrid.tool.remove_segments_at(pos); return; }
    if(dotgrid.tool.vertex_at(pos)){ console.log("Begin translation"); dotgrid.translation = {from:pos,to:pos}; return; }

    var o = e.target.getAttribute("ar");
    if(!o){ return; }

    if(o == "line"){ this.tool.cast("line"); }
    if(o == "arc_c"){ this.tool.cast("arc_c"); }
    if(o == "arc_r"){ this.tool.cast("arc_r"); }
    if(o == "bezier"){ this.tool.cast("bezier"); }
    if(o == "close"){ this.tool.cast("close"); }

    if(o == "thickness"){ this.mod_thickness(); }
    if(o == "linecap"){ this.mod_linecap(); }
    if(o == "linejoin"){ this.mod_linejoin(); }
    if(o == "mirror"){ this.mod_mirror(); }
    if(o == "fill"){ this.toggle_fill(); }
    if(o == "export"){ this.save(); }
  }

  this.mouse_move = function(e)
  {
    var pos = this.position_in_grid(new Pos(e.clientX+5,e.clientY-5)); pos = this.position_on_grid(pos);

    if(dotgrid.translation && (Math.abs(dotgrid.translation.from.x) != Math.abs(pos.x) || Math.abs(dotgrid.translation.from.y) != Math.abs(pos.y))){ dotgrid.translation.to = pos; }

    dotgrid.preview(e.target.getAttribute("ar"));
    dotgrid.move_cursor(pos)
    dotgrid.guide.update();
  }

  this.mouse_up = function(e)
  {
    var pos = this.position_in_grid(new Pos(e.clientX+5,e.clientY-5)); pos = this.position_on_grid(pos);

    if(e.altKey){ return; }

    if(pos.x > 0) { dotgrid.translation = null; return; }

    if(dotgrid.translation && (Math.abs(dotgrid.translation.from.x) != Math.abs(dotgrid.translation.to.x) || Math.abs(dotgrid.translation.from.y) != Math.abs(dotgrid.translation.to.y))){
      dotgrid.tool.translate(dotgrid.translation.from,dotgrid.translation.to);
      dotgrid.translation = null;
      this.draw();
      return;
    }

    this.tool.add_vertex({x:pos.x * -1,y:pos.y});
    dotgrid.translation = null;
    this.draw();
  }

  this.mouse_alt = function(e)
  {
    var pos = this.position_in_grid(new Pos(e.clientX+5,e.clientY-5)); pos = this.position_on_grid(pos);
    dotgrid.tool.remove_segments_at(pos);
    e.preventDefault();
    setTimeout(() => { dotgrid.tool.clear(); },150);

  }

  this.move_cursor = function(pos)
  {
    if(pos.x>0) {
      this.cursor.style.visibility = "hidden"
    } else {
      if(this.cursor.style.visibility == "hidden") {
        this.cursor.style.transition = "initial"
      }
      this.cursor.style.visibility = "visible"
      this.cursor.style.left = Math.floor(-(pos.x-this.grid_width));
      this.cursor.style.top = Math.floor(pos.y+this.grid_height);
      this.update_cursor(pos);
      window.setTimeout(() => dotgrid.cursor.style.transition = "all 50ms", 17 /*one frame*/)
    }
  }

  this.update_cursor = function(pos)
  {
    this.cursor_x.style.left = `${-pos.x}px`;
    this.cursor_x.textContent = parseInt(-pos.x/this.grid_width)
    this.cursor_y.style.top = `${pos.y}px`;
    this.cursor_y.textContent = parseInt(pos.y/this.grid_width)
  }

  this.preview = function(operation)
  {
    if(!operation){ return `<path d='M0,0'></path>`;}
    if(operation != "line" && operation != "arc_c" && operation != "arc_r" && operation != "bezier" && operation != "close"){ return `<path d='M0,0'></path>`; }

    this.preview_el.innerHTML = `<path d='${dotgrid.tool.path([{type:operation,verteces:dotgrid.tool.verteces}])}'></path>`;
  }

  // Toggles

  this.mod_thickness = function(mod,step = false)
  {
    if(!mod){ mod = 1; this.thickness = this.thickness > 30 ? 1 : this.thickness }

    if(step){
      this.thickness = parseInt(this.thickness/5) * 5;
    }

    this.thickness = Math.max(this.thickness+mod,0);
    this.cursor_x.textContent = this.thickness;
    this.draw();
  }

  this.mod_linecap_index = 1;

  this.mod_linecap = function(mod)
  {
    var a = ["butt","square","round"];
    this.mod_linecap_index += 1;
    this.linecap = a[this.mod_linecap_index % a.length];
    this.draw();
  }

  this.mod_linejoin_index = 1;

  this.mod_linejoin = function(mod)
  {
    var a = ["miter","round","bevel"];
    this.mod_linejoin_index += 1;
    this.linejoin = a[this.mod_linejoin_index % a.length];
    this.draw();
  }

  this.mirror_index = 0;

  this.mod_mirror = function()
  {
    this.mirror_index += 1; 
    this.mirror_index = this.mirror_index > 3 ? 0 : this.mirror_index;
    this.draw();
  }

  this.toggle_fill = function()
  {
    dotgrid.fill = dotgrid.fill ? false : true;
    this.draw();
  }

  this.set_size = function(size = {width:300,height:300},interface = true) 
  {
    var win = require('electron').remote.getCurrentWindow();
    win.setSize(size.width+100,size.height+100+(interface ? 10 : 0),true);
    
    this.width = size.width
    this.height = size.height
    this.element.style.width = size.width+10
    this.element.style.height = size.height+10
    this.grid_x = size.width/15
    this.grid_y = size.height/15
    this.svg_el.setAttribute("width",size.width+"px");
    this.svg_el.setAttribute("height",size.height+"px");
    this.preview_el.style.width = size.width+10
    this.preview_el.style.height = size.height+10
    this.preview_el.setAttribute("width",size.width+"px");
    this.preview_el.setAttribute("height",size.height+"px");

    dotgrid.guide.resize(size);
    this.interface.update();
    this.draw();
  }

  this.draw = function(exp = false)
  {
    var paths = this.tool.paths();
    var d = this.tool.path();
    this.layer_1.setAttribute("d",paths[0]);
    this.layer_2.setAttribute("d",paths[1]);
    this.layer_3.setAttribute("d",paths[2]);
    
    this.mirror_layer_1.setAttribute("d",this.mirror_index > 0 ? paths[0] : "M0,0");
    this.mirror_layer_2.setAttribute("d",this.mirror_index > 0 ? paths[1] : "M0,0");
    this.mirror_layer_3.setAttribute("d",this.mirror_index > 0 ? paths[2] : "M0,0");

    this.svg_el.style.width = this.width;
    this.svg_el.style.height = this.height;
    this.svg_el.style.stroke = this.color;
    this.svg_el.style.strokeLinecap = this.linecap;
    this.svg_el.style.strokeLinejoin = this.linejoin;
    this.svg_el.style.strokeWidth = this.thickness*this.scale;
    this.svg_el.style.fill = this.fill ? this.theme.active.f_high : "none";

    // Draw Mirror
    if(this.mirror_index == 1){
      this.mirror_layer_1.setAttribute("transform","translate("+(this.width - (this.offset.x*this.scale))+","+(this.offset.y*this.scale)+"),scale(-1,1)")
      this.mirror_layer_2.setAttribute("transform","translate("+(this.width - (this.offset.x*this.scale))+","+(this.offset.y*this.scale)+"),scale(-1,1)")
      this.mirror_layer_3.setAttribute("transform","translate("+(this.width - (this.offset.x*this.scale))+","+(this.offset.y*this.scale)+"),scale(-1,1)")
    }
    else if(this.mirror_index == 2){
      this.mirror_layer_1.setAttribute("transform","translate("+((this.offset.x*this.scale))+","+(this.height - (this.offset.y*this.scale))+"),scale(1,-1)")
      this.mirror_layer_2.setAttribute("transform","translate("+((this.offset.x*this.scale))+","+(this.height - (this.offset.y*this.scale))+"),scale(1,-1)")
      this.mirror_layer_3.setAttribute("transform","translate("+((this.offset.x*this.scale))+","+(this.height - (this.offset.y*this.scale))+"),scale(1,-1)")
    }
    else if(this.mirror_index == 3){
      this.mirror_layer_1.setAttribute("transform","translate("+(this.width -(this.offset.x*this.scale))+","+(this.height - (this.offset.y*this.scale))+"),scale(-1,-1)")
      this.mirror_layer_2.setAttribute("transform","translate("+(this.width -(this.offset.x*this.scale))+","+(this.height - (this.offset.y*this.scale))+"),scale(-1,-1)")
      this.mirror_layer_3.setAttribute("transform","translate("+(this.width -(this.offset.x*this.scale))+","+(this.height - (this.offset.y*this.scale))+"),scale(-1,-1)")
    }
    else{
      this.mirror_layer_1.setAttribute("transform","")
      this.mirror_layer_2.setAttribute("transform","")
      this.mirror_layer_3.setAttribute("transform","")
    }

    this.offset_el.setAttribute("transform","translate("+(this.offset.x*this.scale)+","+(this.offset.y*this.scale)+")")

    this.preview();
    this.render.draw();
    this.interface.update();
    this.guide.update();
  }

  // Draw
  
  this.reset = function()
  {
    this.tool.clear();
  }

  this.clear = function()
  {
    this.history.clear();
    this.tool.reset();
    this.reset();
    this.thickness = 10
    this.linecap = "round"
    this.linejoin = "round"
    this.color = "#000000"
    this.draw();
  }

  this.drag = function(e)
  {
    e.preventDefault();
    e.stopPropagation();
    
    var file = e.dataTransfer.files[0];

    if(!file.path || file.path.indexOf(".dot") < 0){ console.log("Dotgrid","Not a dot file"); return; }

    var reader = new FileReader();
    reader.onload = function(e){
      dotgrid.tool.replace(JSON.parse(e.target.result.toString().trim()));
      dotgrid.draw();
    };
    reader.readAsText(file);
  }

  this.copy = function(e)
  {
    dotgrid.scale = 1
    dotgrid.width = 300
    dotgrid.height = 300
    dotgrid.draw();

    var svg = dotgrid.svg_el.outerHTML;

    e.clipboardData.setData('text/plain', dotgrid.tool.export(dotgrid.tool.layer()));
    e.clipboardData.setData('text/html', svg);
    e.clipboardData.setData('text/svg+xml', svg);

    this.draw();
  }

  this.cut = function(e)
  {
    dotgrid.scale = 1
    dotgrid.width = 300
    dotgrid.height = 300
    dotgrid.draw();

    var svg = dotgrid.svg_el.outerHTML;

    e.clipboardData.setData('text/plain', dotgrid.tool.export(dotgrid.tool.layer()));
    e.clipboardData.setData('text/html', svg);
    e.clipboardData.setData('text/svg+xml', svg);

    dotgrid.tool.layers[dotgrid.tool.index] = [];

    this.draw();
  }

  this.paste = function(e)
  {
    var data = e.clipboardData.getData("text/plain");
    data = JSON.parse(data.trim());
    dotgrid.tool.import(data);
    this.draw();
  }

  // Normalizers

  this.position_in_grid = function(pos)
  {
    return new Pos((window.innerWidth/2) - (this.width/2) - pos.x,pos.y - (30+10*(this.scale)))
  }

  this.position_on_grid = function(pos)
  {
    pos.y = pos.y - 7.5
    pos.x = pos.x + 7.5
    x = Math.round(pos.x/this.grid_width)*this.grid_width
    y = Math.round(pos.y/this.grid_height)*this.grid_height
    off = (x<-this.width || x>0 || y>this.height || y<0)
    if(off) {
      x = 50
      y = -50
    }
    return new Pos(x,y);
  }
}

window.addEventListener('resize', function(e)
{
  dotgrid.draw()
}, false);

window.addEventListener('dragover',function(e)
{
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});
