function RimEditorTools() {
  var infoDisplay = document.createElement("div");
  var _this = this;
  
  infoDisplay.className = "info";
  infoDisplay.style.left = "0px";
  var infoOnLeft = true;
  infoDisplay.onmouseover = function() {
    if(infoOnLeft) {
      infoDisplay.style.left = "";
      infoDisplay.style.right = "0px";
    }
    else {
      infoDisplay.style.left = "0px";
      infoDisplay.style.right = "";
    }
    infoOnLeft = !infoOnLeft;
  }
  
  document.body.appendChild(infoDisplay);
  //An element that contains tool selection buttons
  var toolBar = document.createElement("div");
  var toolSet = document.createElement("div");
  
  toolBar.className = "tools";
  document.body.appendChild(toolBar);
  


  //Now there will be a list of callbacks, that are called by tiles on mouse actions
  this.tileMouseOver = function(tile) {
    this.displayInfo(tile);  
  }
  this.tileClick = function(tiles) {
  
  
  }
  
  this.displayInfo = function(tile) {
    infoDisplay.innerHTML = "";
    this.addInfoLine("["+tile.real_position()[0]+", "+tile.real_position()[1]+"]");
    this.addInfoLine("Roof: "+tile.roof());
    this.addInfoLine("Terrain: "+tile.terrain());
    if(tile.rock()!=0) {
      this.addInfoLine("Debris: "+tile.rock());
    }
  }
  
  //Will add text line to the bottom of the info panel
  this.addInfoLine = function(text) {
    if(text==null||text.length==0)
      return;
    infoDisplay.appendChild(document.createTextNode(text));
    infoDisplay.appendChild(document.createElement("br"));  
    //console.log(infoDisplay);
  }
  //Tools related vars 
  var tools = [];
  var selectedTool = null;
  //Remember visible toolbox to prevent multiple at a time
  var visibleBox = null;
  //Registers a new tool/toolset to be used
  this.registerToolset = function(toolset) {
    var toolObj = {
      //Class instance
      cls: toolset,
      //Button element
      button: document.createElement("div"),
      //Foreground element
      foreground: document.createElement("div"),
      //Index in the array
      index: null,
      //Box of tools
      toolBox:null
    }
    //Generating HTML
    toolObj.index = tools.push(toolObj)-1;
    toolObj.button.className = "button";
    //Create button image
    var image = document.createElement("img");
    image.height = 64;  
    //If image inactive is set, activate hover mechanics
    if(toolset.imageInactive!=null) {
      image.src = toolset.imageInactive;
      image.onmouseover = function() {toolset.hover(true);};
      image.oumouseout = function() {toolset.hover(false);};
    }
    else
      image.src = toolset.image;
    //Set up image rendering callback
    toolset.setImage = function(src) {image.src = src;};
    //Giv tool a reference to thislist
    toolset.toollist = this;
    
    toolObj.button.appendChild(image);  
    //Main onclick
    toolObj.button.onclick = function(e) {
      if(toolset.onclick(new RimEditorEvent(e))!==false)
        _this.selectTool(toolObj.index);
    }
    //Title of the tool
    if(toolset.title!=null) {
      toolObj.button.assignTooltip(toolset.title);
    }
    
    toolObj.button.appendChild(toolObj.foreground);
    //Only append when it has no parents
    if(toolset.toolset==null)
      toolBar.appendChild(toolObj.button);

    if(toolset instanceof RimEditorToolset) {
      //Get tool instances
      var toolList = toolset.getTools();
      //Create tool box instance
      var box = toolObj.toolBox = document.createElement("div");
      box.className = "tools toolbox";
      box.style.display = "none";
      //Hiding/showing algorithm
      toolObj.button.onmousemove = function() {
         toolObj.cls.onshowbox();
      }
      box.onmousemove = function() {
         toolObj.cls.onshowbox();
      }
      toolObj.cls.showBox = function() {
        if(visibleBox!=null)
          visibleBox.hideBox();
        visibleBox = this;
        box.style.display = "block";      
      }
      toolObj.cls.hideBox = function() {
        if(visibleBox==this)
          visibleBox = null;
        box.style.display = "none";
      }
      //Recursivelly add children
      for(var i=0,l=toolList.length; i<l; i++) {
        var obj = this.registerToolset(toolList[i]);
        box.appendChild(obj.button);
      }
      //For now, just add it to the body
      document.body.appendChild(box);
    }
    return toolObj;
  }
  //To add a tool to a toolset 
  this.toolAdded = function(toolset, tool) {
    //We must find the toollist object element in tool list
    var obj = null;
    for(var i=0,l=tools.length; i<l; i++) {
      if(tools[i].cls == toolset) {
        obj = tools[i];
        break;
      }
    }
    //If no object matched we must register the toolset first
    //this should never happen though
    if(obj==null)
      this.registerToolset(toolset);
    //Now register the child
    var obj2 = this.registerToolset(tool);
    //Finally add childs button to parents container
    obj.toolBox.appendChild(obj2.button);
  }
  this.addTool = function(tool) {this.registerToolset(tool);}
  //Selecting tools
  this.selectTool = function(index) {
    //Select tool by instance
    if(index instanceof RimEditorTool) {
      var obj = this.find(index);
      index = obj!=null?obj.index:null;
    }
    //Check for null
    if(tools[index]==null)
      return console.error("Cannot select tool",index,"in",tools)&&false;
    if(tools[selectedTool]!=null) {
      tools[selectedTool].button.removeClass("selected");
    }
    selectedTool = index;
    tools[selectedTool].button.addClass("selected");
    if(tools[selectedTool].cls instanceof RimEditorToolset) {
      //tools[selectedTool].tools.style.display = "block";
    }
  }
  this.find = function(tool) {
    //We must find the tool object element in tool list
    var obj = null;
    for(var i=0,l=tools.length; i<l; i++) {
      if(tools[i].cls == tool) {
        obj = tools[i];
        break;
      }
    }
    return obj;
  }
  //this will be called when tile is clicked, argument 1 is array of tiles clicked
  this.tileClick = function(tiles) {
    if(selectedTool!=null) {
      //console.log("UI event for tool: ",tools[selectedTool].cls);
      if(typeof tools[selectedTool].cls.tileClick=="function")
        tools[selectedTool].cls.tileClick(tiles);
      else
        console.log(tools[selectedTool].cls);
    }
  }
}

function RimEditorToolset() {
  var tools = [];
  var selectedTool = null;
  //Class self-reference
  var _this = this;

  //Called to use tool for this toolset
  this.addTool = function(tool) {
    //Add tool to the list
    tools.push(tool);
    //Set as selected if none is selected
    if(selectedTool == null)
      selectedTool = tools.length-1;
    //Give a tool a reference to this container
    tool.toolset = this;
    //Inform the tool list that a tool was added
    if(this.toollist!=null) {
      this.toollist.toolAdded(this, tool);
    }
    //Return back the index of the tool
    return tools.length-1;
  
  }
  //Getter used to render tools
  this.getTools = function() {
    return tools;
  }
  
  this.toolClickOld = this.toolClick;
  //This will be called when tool is clicked
  this.toolClick = function(index) {
    //Call the deselect event callback
    if(selectedTool!=null&&tools[selectedTool]!=null) {
      tools[selectedTool].onDeselect();
    }
    //Change tool and call the callback again
    selectedTool = index;
    tools[selectedTool].onSelect(); 
    //After this, call parent classes toolclick
    if(this.toolClickOld!=null)
      this.toolClickOld();
  }
  //this will be called when tile is clicked, argument 1 is array of tiles clicked (even if dragging is disabled)
  this.tileClick = function(tiles) {
    if(selectedTool!=null)
      tools[selectedTool].tileClick(tiles);
  }
  
  //Box showing/hiding mechanics
  var box_timeout = null;
  this.boxDelay = 1000;
  this.onshowbox = function() {
    if(box_timeout!=null)
      clearTimeout(box_timeout);
    this.showBox();
    box_timeout = setTimeout(function() {_this.hideBox()},this.boxDelay);
  }

  //Dummy placeholders for rendering functions
  this.showBox = function() {};
  this.hideBox = function() {};
}
RimEditorToolset.prototype = new RimEditorTool();
function RimEditorTool() {
  //Icon for the toolset
  this.image = null;
  //icon for inactive icon, this will be used if set
  this.imageInactive = null;
  //Title
  this.title = null;

  //Reference to container toolset
  this.toolset = null;
  //Refference to the tool renderer
  this.toollist = null;
  
  //Set to false if only one tile may be selected at once
  this.allowDraging = true;  
  
  //this will be called when tile is clicked, argument 1 is array of tiles clicked (even if dragging is disabled)
  this.tileClick = function(tiles) {}
  //This will be called when this button is clicked
  this.toolClick = function() {
    //inform any parent tools about the selection
    /*if(this.toolset!=null) {
      this.toollist.selectTool(this.toolset);
    }     */
  }
  //Called click (might cancel activation)
  this.onclick = function() {};
  //Called upon activation
  this.onSelect = function() {};
  //Called upon deactivation
  this.onDeselect = function() {};
  
  //Imag and display methods
  this.hover = function(state) {
    this.setImage(state?this.image:this.imageInactive);
  }
  //dummy set image callback
  this.setImage = function() {};
}

//Specific tool editors
function RimEditorTileChanger(title, tileID, image, map, imageInactive) {
  var _this = this;
  this.title = title;
  this.image = image;
  this.imageInactive = imageInactive;
  
  
  this.tileClick = function(tiles) {
    var pos;
    for(var i=0,l=tiles.length;i<l;i++) {
      pos = tiles[i].position();
      map.setTileTerrain(pos[0],pos[1], tileID); 
    }
  }
}
RimEditorTileChanger.prototype = new RimEditorTool();

function RimEditorRoofChanger(title, roofID, image, map, imageInactive) {
  var _this = this;
  this.title = title;
  this.image = image;
  this.imageInactive = imageInactive;
  
  
  this.tileClick = function(tiles) {
    var pos;
    for(var i=0,l=tiles.length;i<l;i++) {
      pos = tiles[i].position();
      map.setTileRoof(pos[0],pos[1], roofID); 
    }
  }
}
RimEditorRoofChanger.prototype = new RimEditorTool();

function RimEditorRockChanger(title, rockID, image, map, imageInactive) {
  var _this = this;
  this.title = title;
  this.image = image;
  this.imageInactive = imageInactive;
  
  
  this.tileClick = function(tiles) {
    var pos;
    for(var i=0,l=tiles.length;i<l;i++) {
      pos = tiles[i].position();
      map.setTileRock(pos[0],pos[1], rockID); 
    }
  }
}
RimEditorRockChanger.prototype = new RimEditorTool();

function RimEditorFogChanger(title, fog, image, map, imageInactive) {
  var _this = this;
                                                     this.title = title;
  this.image = image;
  this.imageInactive = imageInactive;
  
  
  this.tileClick = function(tiles) {
    var pos;
    var state = fog;
    //Invert first tile and apply same value on the rest
    if(state==null&&tiles.length>0) {
      state = !tiles[0].fog();
    }
    for(var i=0,l=tiles.length;i<l;i++) {
      pos = tiles[i].position();
      map.setTileFog(pos[0],pos[1], state); 
    }
  }
}
RimEditorFogChanger.prototype = new RimEditorTool();

function RimEditorVisibilityToggle(title, cssSelector, inital, image, imageOff, customRules) {
  var _this = this;
  var state = inital!=null?inital:false;
  this.cssElm = null;
  
  this.title = title;
  this.image = state?image:imageOff;

  var rules;
  if(customRules!=null) {
    rules = customRules;
  }
  else {
    rules = ["display:none !important", "display:block !important"];
  }
  
  this.onclick = function() {
     state = !state;
     var css = cssSelector+"  {";
     //Cast state to 0 or 1
     css += rules[state*1];

     css += ";}";
     if(this.cssElm!=null) {
       this.cssElm.parentNode.removeChild(this.cssElm);
     }
     this.cssElm = document.createElement("style");
     var head = document.head;

     this.cssElm.type = 'text/css';
     if (this.cssElm.styleSheet){
       this.cssElm.styleSheet.cssText = css;
     } else {
       this.cssElm.appendChild(document.createTextNode(css));
     }
     head.appendChild(this.cssElm);
     console.log(this.cssElm);
     //Select proper image
     this.setImage(state?image:imageOff);
     
     //Prevent selection of this item
     return false;
  }
  
  

}
RimEditorVisibilityToggle.prototype = new RimEditorTool();