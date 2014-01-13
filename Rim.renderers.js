// JavaScript Document

function RimWorldMapRenderer(map, display) {
  //References
  this.map = map;
  var _this = this;
  
  //Remember last rendered location and only render upon larger movement
  var lastRendered = [[-666,-666],[-666,-666]];
  //Remember the last viewport location
  var lastView = [-666,-666];
  //Number of tiles to pre-render out of screen
  this.overlay = 30;
  //Render first cell to have an example of how it looks rendered
  var sampleCell;
  
  var tableDims;
 
  this.init = function() {
    sampleCell = display.rows[0].cells[0];
    tableDims = [display.rows[0].cells.length, display.rows.length];
    sampleCell.tileClass.render();
  }
  this.renderVisible = function(forced) {
    if(window.norender)
      return;
    //Get screen size and scroll (uses pagetools.js)
    sb_windowTools.updateWindowSize();
    sb_windowTools.updateScrollOffset();

    //Size of a cell, asuming all are of the same size
    //This is a first cell, so it also tells us x, y margin of a table from [0,0]
    var cellRect = display.rows[0].cells[0].getBoundingClientRect();
    
    //var cellRect = {sampleCell.}
    if(cellRect.width==null) {
      cellRect.width = cellRect.right-cellRect.left;
      cellRect.height = cellRect.bottom-cellRect.top;    
    }
    //Check if we have moved enough to re-render
    if(forced!=true&&
       Math.abs(sb_windowTools.scrollOffset.horizontalOffset-lastView[0])<cellRect.width*this.overlay&&
       Math.abs(sb_windowTools.scrollOffset.verticalOffset-lastView[1])<cellRect.height*this.overlay
    ) {
      return;
    }    
    console.log("Rendering new area...");

    //Calculate the position of the first tile to be rendered
    //Don't forget to substract the table margin from it (it should b [0,0] when top left cell is in the top-left corner)
    //Also substracting overlay from position, to start before the viewport boundary
    var position = [
      Math.round((-cellRect.left)/cellRect.width-this.overlay),
      Math.round((-cellRect.top)/cellRect.height-this.overlay),
    ];
    
    //Calculate how many tiles will fit in the window
    //+2*overlay - one for left/top one for right/bottom
    var tilesContained = [
      sb_windowTools.windowSize.windowWidth/cellRect.width+this.overlay*2, 
      sb_windowTools.windowSize.windowHeight/cellRect.height+this.overlay*2, 
    ];  
    //If we get a negative here, just make it zero, it means we're too top-left
    if(position[0]<0)
      position[0]=0;
    if(position[1]<0)
      position[1]=0;
    
    //Now we know the first and last cell to be rendered, first being position, last being position+tilesContained 
    var last = [Math.round(position[0]+tilesContained[0]), Math.round(position[1]+tilesContained[1])];
    
    //Check if we need to render anything  - now I do it directly with scroll ofsets, to skip the calculations
    /*if(Math.abs(position[0]-lastRendered[0][0])<this.overlay&&
       Math.abs(position[1]-lastRendered[0][1])<this.overlay&&
       Math.abs(last[0]    -lastRendered[1][0])<this.overlay&&
       Math.abs(last[1]    -lastRendered[1][1])<this.overlay) {
      return;   
    }          */
    //console.log(cellRect);
    //Again, cap if it's out of table
    if(last[0]>tableDims[0])
      last[0] = tableDims[0];
    if(last[1]>tableDims[1])
      last[1] = tableDims[1];
    //console.log(position, last);
    //Time for a rendering loop
    for(var y=position[1]; y<last[1]; y++) {
      var row = display.rows[y].cells;
      for(var x=position[0];x<last[0];x++) {
        if(row[x]==null) {
          console.log(x,tableDims,display)
        }
        row[x].tileClass.render(forced==true);
      }
    }       
    //this.renderArea(position, last, forced==true);
    //Remember last rendered layout
    lastRendered = [position, last];
    //Remember last view
    lastView = [sb_windowTools.scrollOffset.horizontalOffset, sb_windowTools.scrollOffset.verticalOffset];
  }
  this.renderArea = function(data, B, forced) {
    //Detect non-recursion call
    if(B!=null) {
      if(this.cellRendering!=null) {
        this.cellRendering.stop(true);
      }
      this.cellRendering = new ProgressManager(function(d) {return _this.renderArea(d);},
                                                //The variable to remember where we ended up
                                                {A:data, B:B, x:data[0], y:data[1], forced: forced, size:(B[0]-data[0])*(B[1]-data[1]), done:0}
      );
      this.cellRendering.onProgress = function(e) {
        document.title = "Rendering ("+Math.round(e.progress)+"%)";
      }
      this.cellRendering.start(100);
      return;
    };
    //put x, y in variables for performance
    var x = data.x;
    var y = data.y;
    const tilesMax = 1000;
    var tiles = 0;
    
    var xmax=data.B[0];
    var ymax = data.B[1];
    for(; y<ymax&&tiles<tilesMax;) {
      var row = display.rows[y].cells;

      for(;tiles<tilesMax;x++) {
        row[x].tileClass.render(data.forced);
        tiles++;
        if(x>=xmax) {
          y++;
          x=0;
          break;        
        }
      }
    }
    
    data.x = x;
    data.y = y;
    data.done+=tiles;
    return new ProgressEvent(null, null, data.done/data.size/100)
  }
  
  //Add events to trigger rendering function
  window.addEventListener("resize", function() {_this.renderVisible();});
  window.addEventListener("scroll", function() {_this.renderVisible();});
  //Remember rendered cells and unrender them if necessary
  //This is done in background
  
  
  this.unrenderCells = function(data) {
    var cellsDone = 0;
    const cellsMax = 10;
    for(; cellsDone<cellsMax;) {
      //Get the row reference
      var row = display.rows[data.unrOffset[1]].cells;
      for(; cellsDone<cellsMax; data.unrOffset[0]++) {
        if(pointInRect(data.unrOffset, lastRendered[0],lastRendered[1])) {
          continue;
        }
        //console.log(pointInRect(data.unrOffset, lastRendered[0],lastRendered[1]),":",data.unrOffset, lastRendered[0],lastRendered[1]);
        //Unrender this cell - todo: skip rendered area
        row[data.unrOffset[0]].tileClass.unrender();
        //Increase the cell counter
        cellsDone++;
        //Reset counter and break if we reached the end of the row
        if(data.unrOffset[0]>=tableDims[0]) {
          data.unrOffset[0]=0;
          data.unrOffset[1]++;
          break;
        }
      }
      //Reset if this was the last row
      if(data.unrOffset[1]>=tableDims[1]) {
        data.unrOffset[1]=0;
      }
    }
  
    return new ProgressEvent();
  }
  this.cellUnrendering = new ProgressManager(function(d) {return _this.unrenderCells(d);},
                                            //The variable to remember where we ended up
                                            {unrOffset:[0,0]}
  );
  //this.cellUnrendering.start(8000);
  

}


function RimWorldTile(map, terrainID, roofID, rockID) {
  this.map = map;
  var _this = this;

  this.roof = function(roof, force) {
    /***PREDELAT VYKRESLOVANI, VIDITELNOST VECI**/
  
    if(typeof force!="boolean")
      force = false;
        
    //If no change is performed, act as getter
    if(roof==null) {
      return roofType;
    }
    else if(roof==roofType&&rendered&&!force) {
      return roof;    
    }
    //If elm is hidden do nothing
    if(roof==0&&roofElm==null)
      return 0;
    //If the roofs are supposed to be hidden
    if(!this.map.showRoofs) {
    
      if(roofElm!=null) {
        if(roofElm.parentNode!=null) {
          roofElm.style.display = "none";
          //Change roof type if change is requested
          if(roof!=null&&roof!=roofType) {
            //var bg = this.map.tileset.getRoofBackground(roof);
            //roofElm.style.backgroundImage = bg!=null?"url('"+bg+"')":"";
            roofElm.className = "roof roof"+roof;
          }
        }
      }
      roofHidden = true;
      if(roof!=null) {
        roofType = roof;
      }
      return;
    }
    //Set roof elm style and append it
    if(roof!=0) {
      //If the roofElm has not yet been populated, create it
      if(roofElm==null) {  
        roofElm = document.createElement("div");
        //roofElm.className = "roof";
        holder.appendChild(roofElm);
      }
      else if (roofElm.parentNode==null) {
        holder.appendChild(roofElm);
      }
      else
        roofElm.style.display = "block";
        
      //var bg = this.map.tileset.getRoofBackground(roof);
      //roofElm.style.backgroundImage = bg!=null?"url('"+bg+"')":"";
      roofElm.className = "roof roof"+roof;
      roofHidden = false;
    }else {
      roofElm.style.display = "none";
      roofHidden = true;
    }
    
    roofType = roof;  
  }
  //Properties 
  var roofType = roofID;
  var terrainType = terrainID;
  var rockType = rockID;
  var home = false;
  var fog = false;
  //Rendering info
  var rendered = false;
  var roofHidden = true;
  var debrisHidden = true;
  var fogHidden = true;
  
  
  
  //Element to display roof graphics in. It's NOT populated and appended untill needed
  var roofElm;
  //Debris layer
  var rockElm;
  //Element to display when cell is selected/highlighted by some tool
  var highlightElm;
  //Held elements holder - this is necessary because position: relative does not work with table cells
  //See more: http://stackoverflow.com/q/5148041/607407
  var holder = document.createElement("div");
  holder.className = "holder";
  holder.style.display = "none";
  //HTML element reference
  this.cell = document.createElement("td");
  this.cell.tileClass = this;
  
  
  this.render = function(forced) {
    if(rendered&&roofHidden!=this.map.showRoofs&&roofType!=0) {
      this.roof(roofType, true);
    }
    if(rendered&&forced!==true)
      return;
    if(holder.parentNode==null) {
      this.cell.appendChild(holder);
    }
    this.terrainType(terrainType);
    this.roof(roofType, forced);
    this.rock(rockType, forced);
    rendered = true;
    holder.style.display = "block";
    //this.cell.innerHTML = roofID;//terrainID;
    //this.cell.assignTooltip("Tile ID: "+terrainType+"<br />Roof ID: "+roofType);

  }
  this.unrender = function() {
    if(!this.rendered)
      return;
    holder.style.display = "none";
    rendered = false;
  }
  //Getters and setters
  this.terrain = this.terrainType = function(type) {
    if(type==null||(type==terrainType&&rendered))
      return terrainType;
    else {
      terrainType = type;
      holder.style.background = this.map.tileset.getTerrainColor(terrainType);
      return terrainType;
    }
  
  }
  this.rock = function(newd, forced) { 
    var changing = newd!=rockType;
    //console.log(rockType, newd);
    if(newd==null) {
      newd = rockType;
      changing = false;
    }
    else {
      rockType = newd;
    }
    if(changing||forced||(newd!=0&&rockElm==null)) {
      if(rockElm!=null) {
        if(newd==0||!this.map.showRock) {
          rockElm.style.display = "none";
        }
        else if(newd!=0) {
          rockElm.style.display = "block";  
        } 
        if(newd!=0) {
          rockElm.className = "stone "+this.map.inparser.translate("rock", newd);
          //console.log('A');
          if(!this.map.showRock) {
            rockElm.style.display = "none";
          }
        }
        //console.log('B'); 
      }
      else if(newd!=0) {
        rockElm = document.createElement("div");
        rockElm.className = "stone "+this.map.inparser.translate("rock", newd);
        holder.appendChild(rockElm);
      }
    } 
    else {
      //console.log('C');
      //console.log(this);
    }                
    return rockType;
  }
  this.fog = function(state) {
    var changed = false;
    if(state!=null&&state!=fog) {
      fog = state;
      changed = true;
    }
    if(changed) {
      fog?holder.addClass("fog"):holder.removeClass("fog");
    }
    return fog;
  }
  this.redrawStuff = function() {
    
  
  
  }
  
  this.home = function(state) {
    var changed = false;
    if(state!=null&&state!=home) {
      home = state;
      changed = true;
    }
    if(changed) {
      home?holder.addClass("home"):holder.removeClass("home");
    }
    return home;
  }
  
  this.highlight = function(state) {
    if(highlightElm==null) {
      highlightElm = document.createElement("div"); 
      highlightElm.className = "highlight";
      holder.appendChild(highlightElm);
    }
    if(typeof state=="string") {
      highlightElm.style.display="block";
      highlightElm.style.backgroundColor = state;    
    }
    else if(typeof state=="boolean") {
      highlightElm.style.display=state?"block":"none";
    }
    else if(state==null) {
      highlightElm.style.display="none";
    }
  }     
  
  var pos_cached = null;
  this.position = function() {
    if(this.cell.parentNode==null)
      return null;
    if(pos_cached==null) {
      pos_cached = [this.cell.cellIndex, this.cell.parentNode.rowIndex];
      //console.log("Position updated: [",pos_cached[0], ", ",pos_cached[1],"]");
    }
    return [pos_cached[0],pos_cached[1]];
  }      
  this.real_position = function() {
    if(this.cell.parentNode==null)
      return null;
    if(pos_cached==null) {
      pos_cached = [this.cell.cellIndex, this.cell.parentNode.rowIndex];
      //console.log("Position updated: [",pos_cached[0], ", ",pos_cached[1],"]");
    }
    return [pos_cached[0],this.map.world.size[1]-pos_cached[1]];
  }  
  //Assign UI event callbacks
  this.cell.addEventListener("mouseover", function(event) {
    _this.map.tileMouseOver(_this, new RimEditorEvent(event));  
  });
  this.cell.addEventListener("mouseout", function(event) {
    _this.map.tileMouseOut(_this, new RimEditorEvent(event));  
  });
  this.cell.addEventListener("click", function(event) {
    _this.map.tileMouseClick(_this, new RimEditorEvent(event));  
  });
  this.cell.addEventListener("mousedown", function(event) { 
    event.preventDefault();
    _this.map.tileMDown(_this, new RimEditorEvent(event)); 
    return false; 
  });
  this.cell.addEventListener("mouseup", function(event) {
    _this.map.tileMUp(_this, new RimEditorEvent(event));  
  });
  //this.render();
}
function RimThingRenderer() {






}

function ProgressRenderer() {
  var bar = new Progressbar();
  var finished = false;
  //bar.pending(true);      
  bar.onfinish = function() {
    this.addClass("finished");
    finished = true;
  }
  bar.addClass("hidden");

  var popup = document.createElement("div");
  popup.style.textAlign = "center";
  popup.className = "popup hidden";
  var text = popup.appendChild(document.createElement("span"));
  bar.appendTo(popup);
  
  var visible = false;
  var bar_visible = false;
  
  this.text = function(txt) {
    this.show();
    text.innerHTML = txt;
  }
  this.progress = function(perc) {
    if(!bar_visible) {
      this.show();
      bar.removeClass("hidden");
      this.align();
      bar_visible = true;
    }
    if(finished&&perc<100) {
      bar.removeClass("finished");
      finished = false; 
    }
    bar.percent(perc);
  }
  this.hide = function() {
    this.noProgress();
    popup.addClass("hidden");  
    visible = bar_visible = false;
  }
  this.noProgress = function() {
    bar.percent(0);
    bar.removeClass("finished");
    bar.addClass("hidden")
    finished = false; 
  }
  this.align = function() {
    sb_windowTools.centerElementOnScreen(popup);
  }
  this.show = function() {
    if(!visible) {
      popup.removeClass("hidden");
      if(popup.parentNode==null) {
         document.body.appendChild(popup);      
      }
      this.align();
      visible = true;
    }
  }
  
}