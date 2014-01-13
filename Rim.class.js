//Define Parse XML function
//From: http://stackoverflow.com/a/8412989/607407
var parseXml;

if (typeof window.DOMParser != "undefined") {
    parseXml = function(xmlStr) {
        return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
    };
} else if (typeof window.ActiveXObject != "undefined" &&
       new window.ActiveXObject("Microsoft.XMLDOM")) {
    parseXml = function(xmlStr) {
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
    };
} else {
    throw new Error("No XML parser found");
}
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// JavaScript Document
function RimWorld() {
  this.xml = null;
  this.gamesave = null;
  this.map = null;
  this.renderer = null;
  this.size = null;
  this.popups = null;
  
  this.disableRendering = false;
  
  
  var display = document.createElement("table");
  display.className = "map";
  
  var _this = this;
  
  this.openXML = function(data) {
    //Remove whitespace
    data = data.replace(/\n[\s]*\n?/gm,"");
    //Save the xml object reference
    this.xml = parseXml(data);
    this.gamesave = this.xml.children[0];
    //Init data
    this.initMap();
    //Load things before rendering
    _this.loadThings();
    //Fill the map info and map table
    //also will do all other long term things
    this.render(function() {
      //Show user interface
      _this.showUI();
      if(_this.getVersion()>254) {
        popupError("You have opened an unsupported version of the world. It might break...");
      }
    });

  }
  //Will be used to generate new world in the future
  this.createWorld = function() {

  }
  this.initMap = function() {
    if(this.size==null) { 
      this.size = this.getFieldVal("MapInfo/Size", true);
      //Remove the height coordinate (?, X, ?)
      this.size.splice(1,1);
      //Push the size in squares
      this.size.push(this.size[0]*this.size[1]);
    }
    if(this.map==null)
      this.map = new RimWorldMap(this, display);
  }
  this.createMap = function(onfinish) {   

    if(this.disableRendering) {
      if(typeof onfinish == "function")
        onfinish();
      return;
    }
    
    /*var terrainProgress = new ProgressManager(, );

    terrainProgress.onProgress = 
    terrainProgress.onFinish = function(e) {
      if(typeof onfinish == "function")
        onfinish();

    }
    terrainProgress.start(1);      */
    //terrainProgress.onFinish();
  }
  this.render = function(onfinish) {
    PROGRESS.text("Populating map");
    PROGRESS.progress(0);
    var queue = new ProgressQueue(
      [
        function(data) {return _this.map.drawTerrain(data);},
        {i:0},
        function(e) {PROGRESS.progress(e.progress);}
      ],
      [
        function(data) {return _this.pawns.loadPawns(data);},
        {i:0},
        function(e) {PROGRESS.progress(e.progress);},
        null,
        function(e) {PROGRESS.text("Loading pawns...");PROGRESS.progress(0);}
      ]  
    );
    queue.onfinish = onfinish;
    queue.step();
  
  }
  this.clearMap = function() {
    this.map.clearMap();
  }
  
  this.loadThings = function() {
    this.things = new RimThingCollection();
    this.things.use(this.getField("Things").children);
    this.pawns = new RimWorldPawns(this);
  }
  this.addThing = function(thing) {
    thing.setID(this.getNewThingId());
    this.getField("Things").appendChild(thing.xml);
    this.things.push(thing);
  }
  this.getNewThingId = function() {
    var id = this.getField("MapInfo/MaxThingIDIndex");
    return id.textContent++;
  }

  
  this.showUI = function() {
      PROGRESS.noProgress();
      PROGRESS.text("Rendering map on screen.");
      this.showTools();
      if(!this.disableRendering)
        this.showMap();
      this.createHelpers();
      PROGRESS.hide();
  }
  
  this.showMap = function() {
    document.body.appendChild(display);
    if(this.renderer==null) {
      this.renderer = new RimWorldMapRenderer(this.map, display);
    }
    this.renderer.init();
    this.renderer.renderVisible(true);
  }
  this.showTools = function() {
    this.tools = new RimEditorTools();
    /*var visibility = new RimEditorTool();
    
    visibility.title = "Visibility options (show roofs?)";
    visibility.imageInactive = "images/visible_inactive.png";
    visibility.image = "images/visible_active.png";
    visibility.onclick = function() {_this.map.toggleShowRoofs();return false;};
    this.tools.addTool(visibility);  */
    var visibility = new RimEditorToolset();
    visibility.onclick = function() {return false;};
    visibility.title = "Visibility options";
    visibility.image = "images/visible_active.png";
    
    visibility.addTool(new RimEditorVisibilityToggle("Roofs", "div.roof", true, "images/visible_active.png", "images/visible_inactive.png"));
    visibility.addTool(new RimEditorVisibilityToggle("Fog", "div.fog", true, "images/visible_active.png", "images/visible_inactive.png", ["opacity:1 !important","opacity: 0.8 !important"]));
    visibility.addTool(new RimEditorVisibilityToggle("Rock and debris", "div.stone", true, "images/visible_active.png", "images/visible_inactive.png"));

    this.tools.addTool(visibility);
    
    var terrain = new RimEditorToolset();
    terrain.onclick = function() {return false;};
    terrain.title = "Terrain options";
    terrain.image = "images/map.png";
    terrain.addTool(new RimEditorTileChanger("Red carpet", 40, "images/carpet_red.png", this.map));
    terrain.addTool(new RimEditorTileChanger("Blue carpet", 38, "images/carpet_blue.png", this.map));
    terrain.addTool(new RimEditorTileChanger("Green carpet", 39, "images/carpet_green.png", this.map));
    
    terrain.addTool(new RimEditorTileChanger("Metal tile", 37, "images/metal_tile.png", this.map));
    terrain.addTool(new RimEditorTileChanger("Pawed tile", 36, "images/pawed_tile.png", this.map));
    terrain.addTool(new RimEditorTileChanger("Concrete", 27, "images/concrete_button.png", this.map));
    
    terrain.addTool(new RimEditorTileChanger("Dirt", 50, "images/dirt_button.png", this.map));
    terrain.addTool(new RimEditorTileChanger("Sand", 51, "images/sand_button.png", this.map));
    terrain.addTool(new RimEditorTileChanger("Gravel", 49, "images/gravel_button.png", this.map));
    
    terrain.addTool(new RimEditorTileChanger("Rough hewn rock", 28, "images/roughhewnrock_button.png", this.map));
    terrain.addTool(new RimEditorTileChanger("Rock", 29, "images/rock_button.png", this.map));
    terrain.addTool(new RimEditorTileChanger("Smooth stone", 30, "images/smoothstone_button.png", this.map));
    
    //terrain.addTool(new RimEditorTileChanger("Crash? (tile 31)", 31, "images/dark.png", this.map));
    this.tools.addTool(terrain);
    
    var roofs = new RimEditorToolset();
    roofs.onclick = function() {return false;};
    roofs.title = "roofs options";
    roofs.image = "images/roof_button.png";
    roofs.addTool(new RimEditorRoofChanger("Metal roof", 21, "images/metal_roof.png", this.map));
    roofs.addTool(new RimEditorRoofChanger("Thin rock roof", 22, "images/light_roof.png", this.map));
    roofs.addTool(new RimEditorRoofChanger("Thick rock roof", 23, "images/black_roof.png", this.map));
    roofs.addTool(new RimEditorRoofChanger("Remove roof", 0, "images/sun.png", this.map));
    this.tools.addTool(roofs);
    
    var rock = new RimEditorToolset();
    rock.onclick = function() {return false;};
    rock.title = "rock options";
    rock.image = "images/rock.png";
    rock.addTool(new RimEditorRockChanger("Rock", 53, "images/rock.png", this.map));
    rock.addTool(new RimEditorRockChanger("Mineral", 54, "images/mineral.png", this.map));
    rock.addTool(new RimEditorRockChanger("Haul debris", 55, "images/haul_debris.png", this.map));
    rock.addTool(new RimEditorRockChanger("Slag debris", 56, "images/slag_debris.png", this.map));
    rock.addTool(new RimEditorRockChanger("Clear", 0, "images/noterrainbutton.png", this.map));
    this.tools.addTool(rock);

    this.tools.addTool(new RimEditorFogChanger("Fog of war", null, "images/dark.png", this.map));

    var money = new RimEditorTool();
    money.title = "Edit player resources";
    money.image = "images/money.png";
    money.onclick = function() {_this.editResources();return false;};
    this.tools.addTool(money);
    
    var pawns = new RimEditorTool();
    pawns.title = "Manage existing pawns";
    pawns.image = "images/boomufalo-button.png";
    pawns.onclick = function() {_this.editPawns();return false;};
    this.tools.addTool(pawns);
    
    var save = new RimEditorTool();
    save.title = "Save the world";
    save.image = "images/save.png";
    save.onclick = function() {_this.save();return false;};
    this.tools.addTool(save);
  }
  /**Create all smaller objects that manage stuff like resources, time etc**/
  this.createHelpers = function() {
    this.resources = new RimWorldResources(this);
    this.popups = new RimEditorPopupManager();
  }  
  
  /**Get set field finctions, they find field by path**/
  this.getField = function(path) {
    return getElementByXpath("/Map/"+path, this.xml);
  }
  this.getFieldVal = function(path,parse) {
    var fieldElm = this.getField(path);
    if(fieldElm==null) {
      console.error("Element not found: "+path);
      return null;
    }
    var text = fieldElm.textContent;
    
    if(parse==true) {
      var matches = /\(([0-9.]+), ([0-9.]+), ([0-9.]+)\)/.exec(text);
      if(matches!=null) {
        return [1*matches[1],1*matches[2],1*matches[3]];
      }
      return 1*text;
    }
  }
  this.createField = function(tagname) {
    return this.xml.createElement(tagname);
  }
  
  this.version = null;
  this.getVersion = function() {
    if(this.version!=null)
      return this.version;
    else
      return this.version = this.getField("GameVersion").textContent.split(" ")[0].split(".")[2]*1; //0.0.254 rev38004
  }
  /**Various editing functions that will generate popups**/
  this.popupError = function(error) {
    test = this.popups.open("error");
    test.text(error);
    test.addClass("error");
    test.show();
  }
  
  this.editResources = function() {
    if(this.version>254) {
      popupError("You can't edit resources in versions above 254, they are physically present in the game!");
      return false;
    }
    var test = this.popups.find("RESOURCES");
    if(test==null) {
      test = this.popups.open("RESOURCES");
      var names = _this.resources.getFields(true);
      for(var i=0; i<names.length; i++) {
        test.addTextInput(names[i].substr(0,1).toUpperCase()+names[i].substr(1), //Nasty capitalisation
           null, 
          //Nasty dereferencing of i
          (function(name) {return function(val) {_this.resources.set(name, val)};})(names[i]),
          this.resources.get(names[i])
        );
      }             
      
      //test.addTextInput("Metal", null, this.resources.metal, "textContent");
      //test.addTextInput("Food", null, this.resources.food, "textContent");      
    }
    test.show();
  }

  this.editPawns = function() {
    var test = this.popups.find("ALL_PAWNS");
    if(test==null) {
      test = this.popups.open("ALL_PAWNS");
      new RimEditorPawnEditor(this, this.pawns.list, test);  
    }
    test.show();
  }
  //Will crop or enlarge whole map!
  this.resize = function(x, y, width, height) {
    if(Math.min(width,height<=0)||Math.min(x,y)<0) {
      throw new Error("Unsupported dimensions!");
    }
    if(x+width>this.size[0]||y+height>this.size[1]) {
      throw new Error("Can't enlarge yet!");
    }

    this.clearMap();  
    
    this.map.size(x,y,width,height);
    this.size[0] = width;
    this.size[1] = height;
    this.saveSize();    
    PROGRESS.text("Removing things that overlap new world...");
    this.things.getThingsNotInRect([x,y],[x+width,y+height]).each(function(thing) {thing.remove();});
    this.things.checkRemoved();
    this.createMap(function() {_this.showMap();PROGRESS.hide();});
    
  }
  //Save size if it was changed
  this.saveSize = function() {
    this.size[2] = this.size[0]*this.size[1];
    this.getField("MapInfo/Size").textContent = "("+this.size[0]+", 0, "+this.size[1]+")";
  }
  /**Big world manipulation**/
  this.save = function() {
    //Call internal save functions to alter some things in XML
    this.map.save();
    //Create iframe
    if(this.loader==null) {
      this.loader = document.createElement("iframe");
      this.loader.className = "hidden";
      document.body.appendChild(this.loader);
    }
    this.loader.src = "data:application/x-forcedownload;base64,"+btoa("<?xml version=\"1.0\" encoding=\"utf-8\"?><Map>"+this.xml.firstChild.innerHTML+"</Map>");
    //Create new window and print the data in it instantly
    //var xmlDialog = window.open("data:application/x-forcedownload;base64,"+btoa("<?xml version=\"1.0\" encoding=\"utf-8\"?><Map>"+this.xml.firstChild.innerHTML+"</Map>"));
    //If the window is null, pop-up blocker is on
    /*if(xmlDialog == null) {
      alert("Please disable your pop-up blocker!");
    }    */
    //Remind the user what to do now
    //xmlDialog.alert("Save this file pressing CTRL+S in your browser.");
  }
}
function RimWorldResources(world) {
  this.world = world;
  this.money = world.getField("Resources/Money");
  this.metal = world.getField("Resources/Metal");
  this.food = world.getField("Resources/Food");
  this.medicine = world.getField("Resources/Medicine");
  this.uranium = world.getField("Resources/Uranium");
  this.shells = world.getField("Resources/Shells");
  
  var names = ["money", "metal","food","medicine","uranium","shells"];
  this.getFields = function(all) {         
    var list = [];
    for(var i=0,l=names.length;i<l; i++) {
      if(all||this[names[i]]!=null) {
        list.push(names[i]);
      }
    } 
    return list; 
  }
  
  this.get = function(name) {
    if(this[name]!=null) {
        return this[name].textContent*1;
    }
    return 0;
  }
  this.set = function(name, value) {
    if(names.contains(name)) {
      if(this[name]==null) {
        this[name] = world.createField(name);
      }
      return this[name].textContent = value*1;
    }
  } 
}  
  
function RimWorldPawns(world) {
  //Self reference
  var _this = this;
  //World refference
  this.world = world;
  //List of pawns
  this.list = new RimThingCollection();
  //Load pawns - async
  this.loadPawns = function(data) {
    var thingcount = this.world.things.length;
    if(thingcount==0) {
       return new ProgressEvent(true, false, 100);
    }
    var i=0;
    for(; i<1000&&data.i+i<thingcount; i++) {
      if(this.world.things[data.i+i].className=="Pawn") {
        this.list.push(this.world.things[data.i+i]);
      }
    }
    data.i+=i;
    return new ProgressEvent(false, false, (data.i*100)/thingcount);
  }
  //Get only people
  this.getHumans = function() {
    return this.list.filter(function(p) {return p.getElementByXPath("Mind").getAttribute("Class")=="Pawn_MindHuman";});
  }
  //Get only people
  this.getColonists = function() {
    return this.list.filter(function(p) {
      return p.get("Team")=="Colonist";
    });
  }
}
  
function RimWorldMap(world,display) {
  //Self reference
  var _this = this;
  //Reference to the parent class
  this.world = world;
  //Const info for parsing
  const bitsInByte = 6;
  //Terrain elements
  //var terrainDef = this.world.gamesave.getElementsByTagName("TerrainMap")[0];
  //var roofDef = this.world.gamesave.getElementsByTagName("Roofs")[0];
  //var scenery = this.world.getField("CompressedThingMap");
  var home = this.world.getField("CleanGrid/CleanGrid");
  var fog = this.world.getField("FogGrid/Fog");

  this.inparser = new RimMapParser(world);
  //parse data and turn to array (not for reading but for writing)
  var terraindata = this.inparser.loadTerrain();
  //var terraindata = decodeData(terrainDef.textContent).split("");
  var roofdata = this.inparser.loadRoofs();
  var rockdata = this.inparser.loadRock();
  var homedata = [];
  decompressFog(decodeData(home.textContent),homedata);
  var fogdata = [];
  decompressFog(decodeData(fog.textContent),fogdata);
  window.terrain = terraindata;
  //console.log(fogdata.length);
  //Display settings
  this.showRoofs = true;
  this.showRock = true;

  //This will provide style for cells
  this.tileset = new TerrainMarker();
  //An array of tile refferences (not used yet)
  var tiles = [];
  //Compatibility stuff
  var rowHome = null;
  if(display.tBodies[0]==null) {
    rowHome = document.createElement("tbody");
    display.appendChild(rowHome);
  }
  else {                  
    rowHome = display.tBodies[0];
  }
  //Hide all map and clear it
  this.clearMap = function() {
    display.parentNode.removeChild(display);
    rowHome.innerHTML = "";
  }  
  //This function is asynchronous
  this.drawTerrain = function(data) {
    if(data.i==null)
      data.i=0;
    var i=0;
    var currentRow;
    for(var sx=this.world.size[0]; i<sx; i++) {
      if(i%this.world.size[0]==0) {
        currentRow = document.createElement("tr");
      }
      
      var posInMap = i+data.i;
      
      var terrainID = terraindata[posInMap];
      var roofID = roofdata[posInMap];
      var rock = rockdata[posInMap];

      //Append the cell to a table
      var tile = new RimWorldTile(this, terrainID, roofID, rock);
      tile.dataOffset = posInMap;
      currentRow.appendChild(tile.cell);
      //Check for fog and home
      
      if(fogdata[posInMap]) {
        tile.fog(true);
      }
      if(homedata[posInMap]) {
        tile.home(true);
      }
    }
    //console.log(display, rowHome, currentRow, i, data.i, this.world.size[0]);
    if(display.rows.length>0)
      rowHome.insertBefore(currentRow, display.rows[0]);
    else 
      rowHome.appendChild(currentRow);
    //i=200;
    //remember where we stopped
    data.i+=i;

    //Return dummy event
    return new ProgressEvent(false, false, (data.i*100)/this.world.size[2]);
  }
  this.toggleShowRoofs = function() {
    this.setShowRoofs(!this.showRoofs);
  }
  
  this.setShowRoofs = function(state) {
    if(typeof state=="boolean"&&state!=this.showRoofs) {
      this.showRoofs = state;
      this.world.renderer.renderVisible(true);
    }
    return this.showRoofs;
  }
  this.setTileTerrain = function(x,y, terrainID) {
    var cls = display.rows[y].cells[x].tileClass;
    cls.terrain(terrainID);
    terraindata[cls.dataOffset] = terrainID;
  }
  this.setTileRoof = function(x,y, roofID) {
    var cls = display.rows[y].cells[x].tileClass;
    cls.roof(roofID);
    roofdata[cls.dataOffset] = roofID;
  }
  this.setTileRock = function(x,y, rockID) {
    var cls = display.rows[y].cells[x].tileClass;
    cls.rock(rockID);
    rockdata[cls.dataOffset] = rockID;
  }
  this.setTileFog = function(x,y, fog) {
    var cls = display.rows[y].cells[x].tileClass;
    cls.fog(fog);
    fogdata[cls.dataOffset] = fog*1;
  }
  this.setData = function(dataRef, x,y,val) {
    dataRef[x+(this.world.size[1]-y)*this.world.size[1]] = String.fromCharCode(val);
  }
  this.save = function() {
    var parser = new RimMapParser(world);
    parser.saveTerrain(terraindata);
    parser.saveRock(rockdata);
    parser.saveRoofs(roofdata);
    home.textContent = btoa(compressFog(homedata));
    fog.textContent = btoa(compressFog(fogdata));
    /*terrainDef.textContent = btoa(terraindata.join(""));
    roofDef.textContent = btoa(roofdata.join("")); 
    scenery.textContent = btoa(rockdata.join(""));  
    home.textContent = btoa(compressFog(homedata));
    fog.textContent = btoa(compressFog(fogdata)); */   
  }
  
  this.size = function(x, y, width, height) {
    //Rotate the Y axis - not used
      //y = this.world.size - y;
    //Remove all tiles out of selected region
    //HTML generation will not be used now
    //Map will be re-populated instead
    var lx = this.world.size[0];
    var Bx = x+width;
    var By = y+height;
    var removed = 0;
    console.log("Tiles before lookup: ",rockdata.length,terraindata.length);
    for(var oldy=0, ly=this.world.size[1]; oldy<ly; oldy++) {
      /*if(oldy>=y&&oldy<(y+height)&&x==0&&(x+width)==) {
        continue;
      }  */
      for(var oldx=0;oldx<lx; oldx++) {
        //Skip selected region
        /*if(oldx>=x&&oldx<(x+width)&&(oldy>=y&&oldy<=y+height)) {
          //oldx+=width-2;
          continue;
        }  */
        if(oldx>=x&&oldx<Bx && oldy>=y&&oldy<By) {
          oldx=Bx-1;
          continue;
        } 
        //Remove tile
        if(true) {
          //Set the tile to null now, later all null fields will be removed from array
          //It's quite complicated to calculate array offset if you remove value now
          //So I mark them as null and then remove all nulls
          //Also I only change one array, but later replacing will remember all arrays
          rockdata[oldx+oldy*ly] = null;
          removed++;
          //console.log("Removing a tile");
        }

      }
    }  
    var nulls = 0;
    var removed2 = 0;
    for(var i=0, l=rockdata.length;i<l;i++) {
      if(rockdata[i]==null) {
        rockdata.splice(i, 1);
        roofdata.splice(i, 1);
        terraindata.splice(i, 1);
        fogdata.splice(i, 1);
        homedata.splice(i, 1);
        //Decrease i - array length has decreased too
        i--;
        l--;
        removed2++;
      }
      /*
      if(rockdata[i]==null) {
        nulls++;

      }
      else if(nulls!=0) {
        rockdata.splice(i-nulls, nulls);
        roofdata.splice(i, 1);
        terraindata.splice(i, 1);
        fogdata.splice(i, 1);
        homedata.splice(i, 1);
        //Decrease i - array length has decreased too
        i--;
        l--;
      }
      */
    }
    console.log("Tiles after resizing: ",roofdata.length,rockdata.length,terraindata.length);
    console.log("Tiles expected: ",width*height);
    console.log("Tiles removed in lookup: ",removed);  
    console.log("Tiles removed from arrays: ",removed2);    
  
  }
  
  
  function decodeData(data) {
    return atob(data.replace(/[\s\n]*/gm,""));
  }

  function decompressFog(fogString, fogArray) {
    for(var i=0,l=_this.world.size[2];i<l;i++) {
       //console.log("L, I:",l,i,bitsInByte);
       for(var bitrr=0;bitrr<bitsInByte;bitrr++) {
         //console.log( bitrr,bitsInByte);
         fogArray.push(((fogString.charCodeAt(i) >> bitrr) & 1)==1);
         //throw new Error("A!");
       }
       //throw new Error("ble");
    }
    //console.log(fogArray, _this.world.size);
  }
  function compressFog(array) {
    var bitInd = 1;
    var byteString = "";
    var byteInd = 0;
    for(var i=0,l=_this.world.size[2];i<l;i++) {
					if(array[i])
						byteInd |= bitInd;
					bitInd *= 2;
					if( bitInd > 32 )
					{
						bitInd = 1;
						byteString+=String.fromCharCode(byteInd);
						byteInd = 0;
					}

    }
    //If the last bit index wasn't 32, the last byte might not be appended
    if(bitInd!=1) {
      byteString+=String.fromCharCode(byteInd);
    }
    
    return byteString;
  }
  
  this.highlightTilesSquare = function(A, B) {
    if(A instanceof RimWorldTile) {
      A = A.position();
      B = B.position();
    }
    /*else if(A instanceof Array) {
      
    } */
    makeCorners(A,B);
    //console.log("Highlight from ",A," to ",B);
    
    //UnHiGLIGHT all tiles that are outside highlighted region
    for(var i=0;i<highlighted.length; i++) {
      var cls = highlighted[i];
      if(!pointInRect(cls.position(), A, B)) {
        cls.highlight(false);
        //console.log("Unhighlighting ", cls);
        highlighted.splice(i,1);
        i--;
      }           
    }      
    //var row;
    for(var y=A[1];y<=B[1];y++) {
      //row = display.rows[y].cells;
      for(var x=A[0];x<=B[0];x++) {
         //var cls = display.rows[y].cells[x].tileClass;
         this.setTileHighlighted(x, y);
      }
    }
  }
  //Will add this to a list of highlighted tiles
  var highlighted = [];
  this.setTileHighlighted = function(x, y) {
    if(y<0) {
      return false;
    }
    try {
    var cls = display.rows[y].cells[x];//.tileClass;
    }
    catch(e) {
      console.log("Cell not found at [",x,", ",y,"]");
      return;
    }
    cls = cls.tileClass;
    //Exit if is highlighted already  
    if(highlighted.contains(cls))
      return;
    cls.highlight("rgba(0,255,255,0.5)");
    highlighted.push(cls);
  }
  
  this.clearHighlight = function() {
    for(var i=0;i<highlighted.length; i++) {
      var cls = highlighted[i];
      cls.highlight(false);  
    }
    highlighted = [];
  }
  
  
  /**Events that are called upon user interaction with map**/
  var dragstart = null;
  
  this.tileMouseOver = function(tile) {
    this.world.tools.tileMouseOver(tile);  
    if(dragstart!=null) {
      this.highlightTilesSquare(dragstart, tile);
    }
  }

  this.tileMouseOut = function(tile) {
  
  }
  
  this.tileMouseClick = function(tile) { 
    this.world.tools.tileClick([tile]);  
  }
  
  this.tileMDown = function(tile, event) {
    if(event.lbutton) {
      dragstart = tile;
      //console.log("Start dragging at ", dragstart.position());
      event.cancel();
      return false;
    }
  }
  this.tileMUp = function(tile, event) {
    if(event.lbutton) {
      if(dragstart!=null) {
        this.world.tools.tileClick(highlighted);  
        dragstart = null;
        this.clearHighlight();
      }
      else {
        this.tileMouseClick();
      }
    }
  }
  this.tileDrag = function(tile, event) {
  
  
  }
  
}


function RimEditorEvent(event) {
  //Mouse or keyboard event? (not used yet)
  this.type = null;
  //How was this event generated?
  this.origin = RimEditorEvent.EMPTY;
  //Source object reference if any
  var origin = null;
  //Set of properties an event may have
  this.mousex = null;
  this.mousey = null;
  this.lbutton = false;
  this.rbutton = false;
  this.key = null;
  this.ctrl = false;
  this.alt = false;
  this.shift = false;
  //Other event info
  this.canceled = false;
  //constructor from DOM event
  this.fromDOMEvent = function(event) {
     //Set proper origin
     this.origin = RimEditorEvent.DOM_EVENT;
     //Set refference to the original event object
     origin = event;
     //Set properties
     this.lbutton = event.button==0;
     this.rbutton = event.button==2;
     this.alt = event.altKey==true;
     this.ctrl = event.ctrlKey==true;
     this.shift = event.shiftKey==true;
     this.mouseX = event.clientx;
     this.mousey = event.clienty;  
     
     if (event.target!=null) this.origin = event.target;
     else if (event.srcElement!=null) this.origin = event.srcElement;
  }
  
  this.cancel = function() {
    if(this.origin==RimEditorEvent.DOM_EVENT) {
      origin.preventDefault();
      this.canceled = true;
      return true;
    }
    console.warn("Cannot cancel event ", this);
    return false;
  }
  this.toString = function() {
    return "[Object RimEditorEvent]";
  }
  
  //Now run constructor if there is any suitable
  
  if(event instanceof Event) {
    this.fromDOMEvent(event);
    //console.log(event.toString());
  }
}
RimEditorEvent.DOM_EVENT = 2;
RimEditorEvent.EMPTY = 1;
//Class that is just container for event callbacks
/**
   @arguments
     task - the function that will be performed every iteration MUST RETURN ProgressEvent instance
     taskdata - variables for the class - an object, or array so it persists and is passed as a reference
     onFinish - function that will be called when progress is over
     onProgress - this will be called every iteration
 *
 *
**/   
function ProgressManager(task, taskdata, onFinish, onProgress) {
  //Save the arguments
  this.onProgress = onProgress;
  this.onFinish = onFinish;
  this.onError = null;
  this.onPause = null;
  //Speed control variables
  this.sleep = 20;
  //Progress variables              
  var running = 0;  //0 - stoped,  1-running, 2 - paused
  this.progress = null;//Percent of progress if any - not used yet
  //Self reference for callbacks
  var _this = this;
  //Now the progress methods
  this.start = function(sleep) {
    if(running==1)
      return;
    running = 1;
    if(sleep!=null)
      this.sleep = sleep;
    heart();
  }
  this.resume = function() {
    this.start();
  }
  this.stop = function(silent) {
    running = 0;
    //This triggers an error too
    if(!silent)
      error({type:"Cancelled"});
  
  }
  //This ticks and calls task
  function heart() {
    if(running!=1)
      return;
    setTimeout(function() {tick();}, _this.sleep);
  }
  //This happens on every heartbeat
  function tick() {
    var evt = task(taskdata);
    if(typeof evt=="undefined"||evt==null||!(evt instanceof ProgressEvent)) {
      error({type:"Invalid event.", data:evt});
    }  
    if(evt.isFinished) {
      finished();
      return;
    }
    
    if(evt.isError) {
      error({type:"Progress error", data:evt.error});
    }  
    
    if(typeof _this.onProgress == "function") {
      _this.onProgress(evt);
    }
    heart();
  }
  //This is trigerred when job is done
  function finished(evt) {
    running = 0;
    //Trigger event
    if(typeof _this.onFinish == "function") {
      _this.onFinish(evt);
    }  
  }
  //This will handle errors
  function error(err) {
    _this.stop();
    if(typeof _this.onError == "function")
      _this.onError(err);
    if(console!=null&&console.error!=null) {
      console.error("Error happened during progress: ",err);
      throw null;
    }
    else
      throw new Error("Error happened during progress: "+ err.type);
  }
}
//Queues multiple events
/**
 * ProgressQueue([task, data, onprogress, onfinish, onstart], [task, data, onprogress, onfinish], ...)
 *
 **/  
function ProgressQueue() {
    //Index of current task
    var current = 0;
    //Task list
    var tasks = arguments;
    //Max task index
    var max = arguments.length;
    //Self-reference 
    var _this = this;
    //Step - perform one task from the list
    this.step = function() {
      var task = new ProgressManager(tasks[current][0], tasks[current][1], null, tasks[current][2]);
      task.onFinish = function() {
        //Call the callback
        if(typeof tasks[current][3]=="function")
          tasks[current][3]();
        //Iterate task position
        current++;
        //Start next task
        if(current<max) {
          _this.step();
        }
        else {
          if(typeof _this.onfinish == "function")
            _this.onfinish();
        }
      }
      task.start(1);
      //Call the onstart event
      if(typeof tasks[current][4]=="function")
        tasks[current][4]();
    }
}

function ProgressEvent(finished, error, progress) {
  if(progress>=100)
    finished=true;

  this.isFinished = finished===null?false:finished;
  this.isError = error===null?false:error;
  this.progress = progress;
}


/**Tiny class to manage events**/
function EventHandler() {
  var listeners = [];
  this.addEventListener = function(evtName, callback) {
    if(this.findEventListener(evtName, callback)!=null)
      return false;
    listeners.push([evtName, callback]);
  }
  this.removeEventListener = function(evtName, callback) {
    listeners.splice(this.findEventListenerIndex(evtName, callback),1);  
  }
  this.findEventListener = function(evtName, callback) {
    for(var i=0,l=listeners.length; i<l;i++) {
      if(listeners[i][1]==callback&&listeners[i][0]==evtName) 
        return callback;
    }
    return null;
  }
  this.dispatchEvent = function(name, data) {
    for(var i=0,l=listeners.length; i<l;i++) {
      if(listeners[i][0]==name) 
        listeners[i][1].apply(this, data);
    }
  }
  this.findEventListenerIndex = function(evtname, callback) {
    for(var i=0,l=listeners.length; i<l;i++) {
      if(listeners[i][1]==callback&&listeners[i][0]==evtname) 
        return i;
    }
    return null;
  }
}
  //Helper functions
  function pointInRect(point, a,b) {
    makeCorners(a, b);
    //Now, it's quite easy
    return point[0]>=a[0]&&point[1]>=a[1]&&
           point[0]<=b[0]&&point[1]<=b[1];
  
  }
  
  
  
  
  //Will turn A and B to the top left and bottom right (respectively) corners of any rectange
  function makeCorners(A, B) {
    var tmp;
    //Make a the top-left and b the bottom-right
    if(A[0]>B[0]) {
      tmp=A[0];
      A[0]=B[0];
      B[0]=tmp;
    }
    if(A[1]>B[1]) {
      tmp=A[1];
      A[1]=B[1];
      B[1]=tmp;
    }
  }
function getElementByXpath(path,doc) {
    return doc.evaluate(path, doc, null, 9, null).singleNodeValue;
};