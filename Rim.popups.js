function RimEditorConfigPopup() {
  var _this = this;
  /**HTML**/
  var popup = document.createElement("div");
  popup.style.textAlign = "center";
  popup.className = "popup hidden";
  var close = document.createElement("div");
  close.className = "close";
  close.title = "Close";
  close.onclick = function() {
    _this.close();
  }
  popup.appendChild(close);
  
  var caption = document.createElement("div");
  caption.className = "caption";
  popup.appendChild(caption);
  
  var visible = false;
  
  //Window will be destroyed on close, not hidden
  this.destroyOnClose = true;
  //Allows to unset ather references to window upon destroy
  this.ondestroy = null;
  //Event callbacks
  this.onfocus = null;
  this.onblur = null;
  //Active or not
  this.active = false;
  /** Variables for managing multiple popups **/
  this.popupAbove = null;
  this.popupBelow = null;
  //Name for the window manager
  this.name = null;
  //Actual manager refference
  this.manager = null;
  /** Child management**/
  this.elements = [];
  this.addTextInput = function(comment, icon, ref, refName) {
    //console.log(666);
    var elm = new RimEditorPopupTextbox();
    //console.log(elm);
    elm.initElm();
    //console.log(elm);
    elm.setComment(comment);
    if(icon!=null)
      elm.setIcon(icon);
    this.elements.push(elm);
    popup.appendChild(elm.element);
    //console.log(elm);
    if(typeof ref=="object"&&typeof refName=="string") {
      elm.setTargetRefference(ref, refName);
    }
    if(typeof ref=="function") {
      elm.onchange = ref;
      if(refName!=null) {
        elm.setValue(refName);
      }
    }
    return elm;
  }
  this.addElement = function(domElm) {
    this.elements.push(domElm);
    popup.appendChild(domElm);
  }
  //Creates centered div for text
  this.textDiv = null;
  this.text = function(string) {
    if(this.textDiv==null) {
      this.textDiv = document.createElement("div");
      this.textDiv.style.textAlign = "center";
      popup.appendChild(this.textDiv);
    }
    this.textDiv.innerHTML = string;
  }
  this.caption = function(text) {
    caption.innerHTML = "";
    caption.appendChild(document.createTextNode(text));
  }
  /** Appearance **/
  this.addClass = function(cls) {
    popup.addClass(cls);
  }
  this.setZIndex = function(num) {
    //Check if this is a managed popup
    if(this.manager!=null) {
      //Cap the z-indexes properly
      if(num>this.manager.topZIndex) {
        num = this.manager.topZIndex;
      }
      if(num<this.manager.bottomZIndex) {
        num = this.manager.bottomZIndex;
      }
    }
    
    popup.style.zIndex = num;
    this.zIndex = num;
    if(this.popupBelow!=null) {
      this.popupBelow.setZIndex(num-1);
    }
  }
  
  //Focus and blur events
  this.focus = function() {
    if(typeof this.onfocus=="function") {
      this.onfocus();
    }
    popup.addClass("active");
    this.active = true;
  }
  this.blur = function() {
    if(typeof this.onblur=="function") {
      this.onblur();
    }
    if(popup!=null)
      popup.removeClass("active");
    else
      console.log(this);
    this.active = false;
  }
  /** HIDE show methods**/
  
  this.hide = function() {
    popup.addClass("hidden");  
    visible = false;
  }
  this.align = function() {
    sb_windowTools.centerElementOnScreenFixed(popup);
  }  
  
  this.show = function(blink, nofocus) {
    if(!visible) {
      popup.removeClass("hidden");
      if(popup.parentNode==null) {
         document.body.appendChild(popup);      
      }
      this.align();
      visible = true;
      if(blink)
        this.blink(2);
    }
    else
      this.blink(2);
      
    if(nofocus!==false) {
      this.focus();
    }
  }
  this.close = function() {
    if(this.destroyOnClose)
      this.destroy();
    else
      this.hide();
  }
  /**Destructor**/
  this.destroy = function() {
    if(typeof this.ondestroy=="function") {
      this.ondestroy();
      delete this.ondestroy();
    }
    delete this.elements;
    //If managed by manager, try to fill the gap and unlink self
    /*if(this.manager!=null)
      this.manager.link(this.popupAbove, this.popupBelow);  */
    
    window.removeEventListener("mouseup", mouseupListener);
    window.removeEventListener("mouseout", mouseoutlistener);  
    document.body.removeChild(popup);
    
    popup = null;
    close = null;
  }
  
  /** Events allowing the popup to be movable**/
  var dragpos = [0,0];
  var origpos = [0,0];
  var dragged = false;
  popup.onmousedown = function(event) {
    //Focus the popup
    _this.focus();
    
    //First check if the below element does not mind dragging
    var target = event.target?event.target:event.srcElement;
    if(target.tagName.toLowerCase()=="input"||target.tagName.toLowerCase()=="textarea"||target.tagName.toLowerCase()=="select")
      return true;
    //Now calculate starting offset of movement
    var rect = popup.getBoundingClientRect();
    origpos[0] = rect.left;//-document.body.scrollLeft;
    origpos[1] = rect.top;//-document.body.scrollTop;  
    
    dragpos[0]=event.clientX;
    dragpos[1]=event.clientY; 
    dragged = true;
    event.preventDefault();
    return false;
  }     
  const mouseupListener = function() {
    dragged = false;
  }
  const mouseoutlistener = function(event) {
    if(event.target==null)
      dragged = false;
  }
  window.addEventListener("mouseup", mouseupListener);
  window.addEventListener("mouseout", mouseoutlistener);   
  /*popup.onmouseup = popup.onmouseout = function() {
    dragged = false;
  }     */
  popup.onmousemove = function(event) {
    if(dragged) {
      popup.style.left = (origpos[0]+event.clientX-dragpos[0])+"px";
      popup.style.top = (origpos[1]+event.clientY-dragpos[1])+"px";
    }
  }
  /**Animations**/
  const blink_delay = 80;
  var blink_timeout = null;
  this.blink = function(count) {
    if(blink_timeout!=null)
      clearTimeout(blink_timeout);

    popup.style.borderColor = "white";
    setTimeout(function() {unBlink(count-1);}, blink_delay);
  }
  function unBlink(count) {
    popup.style.borderColor = "";
    if(count>0) {
      setTimeout(function() {_this.blink(count);}, blink_delay);
    }
  }
  
}
function RimEditorPopupManager() {
  //Popup list
  var popups = [];
  //Self reference
  var _this = this;
  //Opens new popup, or shows existing if exists
  this.open = function(name, overwrite) {
    if(name!=null) {
      var popup = this.find(name);
      if(popup!=null&&overwrite) {
        popup.destroy();
        popup = null;    
      }
    }
    
    if(popup==null) {
      popup = new RimEditorConfigPopup();
      if(name==null) {
        name = (popups.length)+"_"+(Math.random()*1000);
      }
        
      
      popup.name = name;
      popup.manager = this;
      popup.setZIndex(this.topZIndex);
      popups.push(popup);
      //Asign focus callback to order the windows
      popup.onfocus = function() {
        _this.focus(this, true);
      }   
      //Assign callback to delete the popup
      popup.ondestroy = function() {
        //If top popup was closed, focus the one below
        if(this==_this.activeWindow) {
          if(this.popupBelow!=null)
            //This as a window below, so focus it
            this.popupBelow.focus();
          else
            //No window below => a last window
            _this.activeWindow = null;
        }
    
        //Join the two adjacent popups in the list
        _this.link(this.popupAbove, this.popupBelow);
        //Delete popup from array
        popups.splice(_this.findIndex(this), 1);
      }
    }
    return popup;
  }
  //Finds popup by name
  this.find = function(name) {
    if(name==null)
      return null;
    for(var i=0,l=popups.length;i<l;i++) {
      if(name==popups[i].name) {
        return popups[i];
      }    
    }  
  }
  //Returns array index of a popup found by name
  this.findIndex = function(object) {
    if(name==null)
      return null;
    for(var i=0,l=popups.length;i<l;i++) {
      if(object==popups[i]) {
        return i;
      }    
    }  
  }
  //Sets the z-indexes right in order
  this.activeWindow = null;
  this.topZIndex = 100;
  this.bottomZIndex = 50;
  this.focus = function(popup, fromCallback) {
    //Nothing happens when focusing the same window
    if(popup==this.activeWindow)
      return;
    //Deactivate the old top window
    if(this.activeWindow!=null)
      this.activeWindow.blur();
    //Activate new top window - but not from callback, that would be endless recursion
    if(!fromCallback)
      popup.focus();
    //Unlink active window from its "above window"
    //and make a new link to close the gap that was created
    this.link(popup.popupAbove, popup.popupBelow);
    //active window is now at top!
    popup.popupAbove = null;
    //Set former top window as "below" for new top
    this.link(popup, this.activeWindow);
    
    //Finally, update active window reference
    this.activeWindow = popup;
    //... and update z-indexes
    popup.setZIndex(this.topZIndex);
  }
  //links two windows together
  this.link = function(top, bottom) {
    if(top!=null)
      top.popupBelow = bottom;
    if(bottom!=null)
      bottom.popupAbove = top; 
    //this.printWindows();
    //console.log("Link from ",top,"to", bottom); 
  }
  //Lists the windows in their order (using popupBelow and popupAbove referrences)
  this.printWindows = function() {
    var current = this.activeWindow;
    var list = [];
    while(current!=null) {
      list.push(current);
      current = current.popupBelow;
    }
    console.log.apply(console, list);
  }
}

function RimEditorPopupTextbox() {
  //console.log("Constructor started.");
  var _this = this;
  /*if(this.element==null||this.element==66)
    this.element = document.createElement("div");
  this.element.className = "popupinput"; */
  //this.dd = 666;
  var field = document.createElement("input");
  field.className = "input";
  field.type = "text";
  field.onchange = onchange;
  field.onkeyup = onkeyup;
  
  //Call the parent class to init HTML elements
  //console.log("Calling init elm!");
  this.initElm();    
  //Now we can use this.element
  this.element.insertBefore(field, this.element.lastChild);
  
  this.numbersOnly = function() {}

  this.getValue = function() {
    return field.value;
  }
  this.setValue = function(val) {
    return field.value=val;
  }
  //Private onchange callback
  function onchange(e) {
    _this.change(e);
  }

  //Handles keyups
  function onkeyup(e) {
    if(_this.instant)
      onchange(e);
  }   
  

};

function RimEditorPopupInputElement() {
  //Dummy callback
  this.onchange = function() {}
  //Some default properties
  this.instant = false;   //Update value on every keyup
  this.element = 66;
  this.comment = null;

  
  //setters
  this.setTitle = function(title) {
    this.element.assignTooltip(title);
  }
  this.setComment = function(comment) {
    if(this.element==null)
      this.element = document.createElement("div");
    if(this.comment==null) {
      this.comment = this.element.insertBefore(document.createElement("span"), this.element.firstChild);
      this.comment.className = "comment";
    }
    this.comment.innerHTML = comment;
  }
  this.setIcon = function(url) {
    if(this.element==null)
      this.element = document.createElement("div");
    this.element.style.backgroundImage = "url('"+url+"')";
    this.element.addClass("iconised");
  }
  //Change callback, shouldn't be changed
  this.change = function(e) {
    var value = this.getValue();
    if(this.targetRef!=null&&this.targetRef[this.propName]!=null) {
      this.targetRef[this.propName] = this.getValue();
    }
    if(typeof this.onchange == "function")
      this.onchange(value);
  }
  //These two allow the class to change desired value directly, without callback
  this.targetRef = null;
  this.propName = null;
  //setter for them  
  this.setTargetRefference = function(object, prop) {
    this.targetRef = object;
    this.propName = prop;
    this.setValue(this.targetRef[this.propName]);
  }  
  /**Called by child instance to init the HTML elements**/
  this.initElm = function() {
    if(this.element==null||this.element==66)
      this.element = document.createElement("div");
    else 
      return;
    this.element.className = "popupinput";
    var clear = document.createElement("div");
    clear.style.clear = "both";
    this.element.appendChild(clear);    
  }
}

RimEditorPopupTextbox.prototype = new RimEditorPopupInputElement();

function RimEditorPawnEditor(world, pawns, popup) {
  var _this = this;
  //Create displayer instance that will render pawn info
  this.display = new pawnDisplay();
  //Check for popup
  if(popup==null)
    this.popup = new RimEditorPopup();
  else 
    this.popup = popup;
    
  //Create table and stuff
  var screen = document.createElement("table");
  screen.appendChild(document.createElement("tr"));
  //Create a cell for list of pawn names
  var listTd = screen.rows[0].appendChild(document.createElement("td"));
  var list = listTd.appendChild(document.createElement("div"));
  //This will display pawn UI
  var display = screen.rows[0].appendChild(document.createElement("td"));
  display.appendChild(this.display.main);
  //set up some styles
  list.style.overflowY = "scroll";
  list.style.height = "370px";
  //Prevent clicks from list to move the popup
  list.onmousedown = function(event) {
    event.cancelBubble = true;
  }
  
  display.style.width = "500px";
  display.style.height = "100%";
  
  //Error displayer
  var error = document.createElement("div");
  error.style.textAlign = "center";
  error.style.color = "red";
  error.style.fontWeight = "bold";
  error.style.display = "none";
  
  this.error = function(text) {
    error.style.display = "block";
    display.style.display = "none";
    error.innerHTML = text;
  }
  
  this.createPawnIndex = function(pawn) {
    var div = document.createElement("div");
    
    var team = pawn.team();
    //team = pawn.get("Team");
    if(team!=null&&team.toLowerCase!=null) 
      div.className = "pawnDiv pawn"+pawn.get("Kind")+" team"+team.toLowerCase();
    else  {
      console.log("Pawn with no team:",pawn);
      div.className = "pawnDiv pawn"+pawn.get("Kind");
    } 
    div.innerHTML = pawn.get("CharacterName");
    div.onclick = function() {
      _this.select(div, pawn);
    }
    /**Setup onchange to change and remove the elm**/
    pawn.addEventListener("change", function(name, value) {
      if(name=="CharacterName") {
        div.innerHTML = value;
      }
      if(name=="Team") {
        div.className = div.className.replace(/team[a-z]+/,"team"+value.toLowerCase());
      }
    });
    pawn.addEventListener("remove", function() {
      list.removeChild(div);
      _this.reselect();
    });
    //Append the elm    
    list.appendChild(div);
  }
  
  var selectedDiv = null;
  var selectedPawn = null;
  this.select = function(div, pawn) {
    if(selectedDiv!=null) {
      selectedDiv.removeClass("selected");
    }
    div.addClass("selected");
    selectedDiv = div;
    selectedPawn = pawn;
    this.show();
  } 
  this.show = function() {
    this.display.showPawn(selectedPawn);  
  }
  /**Finish creating HTML**/
  //Load pawns now
  for(var i=0,l=pawns.length; i<l;i++) {
    if(!pawns[i].removed)
      this.createPawnIndex(pawns[i]);
  }
  
  //Select first div
  this.reselect = function() {
    var divs = list.getElementsByTagName("div");
    if(divs.length>0)
      divs[0].onclick();
    else {
      this.display.setVisible(false);
    }
  }
  this.reselect();
  //Append to the popup
  this.popup.addElement(screen);
}
function pawnDisplay() {
  var _this = this;
  this.pawn = null;

  this.main = document.createElement("div");
  this.main.className = "pawnDisplayer";
  /**Many elements**/
  //Name
  this.nameTag = document.createElement("input");
  this.nameTag.className = "decent h2";
  this.nameTag.onkeyup = this.nameTag.onchange = function() {
    _this.pawn.set("CharacterName", this.value);
  }            
  this.nameTag.assignTooltip("Pawn's name");
  //Team
  this.teamSelect = selectFromArray(["Colonist", "Raider", "Neutral", "Psychotic"]);
  this.teamSelect.onchange = function() {
    if(this.value=="Colonist"&&_this.pawn.isAnimal()) {
      alert("Warning: adding animal to colonist team might break the game!\n  Yep, we can't play as animals yet :(");
    }
    _this.pawn.set("Team", this.value);
  }     
  this.teamSelect.assignTooltip("Pawn's team");
  //Health
  this.healthEdit = document.createElement("input");
  this.healthEdit.className = "decent";
  this.healthEdit.onkeyup = this.healthEdit.onchange = function() {
    if(_this.pawn.isHuman()&&this.value>150) {
      alert("Notice: Humans HP will automatically reset to max possible value (100 or 150) upon damage.");
    }
    if(this.value>9999) {
      alert("Warning: HP above 9999 WILL crash game as of b254!");
    }
    _this.pawn.set("HealthTracker/PawnHealth", this.value);
  } 
  this.healthEdit.assignTooltip("Pawn's health");
  //Set insane state
  this.insaneToggle = new checkboxWithLabel();
  this.insaneToggle.checkbox.onchange = function() {
     _this.pawn.hostile(this.checked==true);
  }
  this.insaneToggle.label.innerHTML = " aggresive/psychotic (does not affect team)";
  this.insaneToggle.element.assignTooltip("Turn any pawn aggresive or friendly...");
  
  //Incapacite anything
  this.incapToggle = new checkboxWithLabel();
  this.incapToggle.checkbox.onchange = function() {
     _this.pawn.incap(this.checked==true);
  }
  this.incapToggle.label.innerHTML = " Incapacited";
  this.incapToggle.element.assignTooltip("Make them lay on the floor in their own blood...");
  //Select body
  
  //Select skills
  this.skillDisplay = new PawnSkillTable();
  this.skillDisplay.table.className = "skills";
  //Kill! button 
  this.killBut = document.createElement("button");
  this.killBut.className = "simple kill red";
  this.killBut.innerHTML = "DELETE!";
  this.killBut.onclick = function() {
    if(confirm("Are you sure about that?")) {
      _this.pawn.remove();
    }
  }
  //Append the elements
  this.main.appendChild(this.nameTag);
  this.main.appendChild(this.teamSelect);
  this.main.appendChild(document.createElement("br"));
  this.main.appendChild(this.healthEdit);
  this.main.appendChild(document.createElement("br"));
  this.main.appendChild(this.insaneToggle.element);
  this.insaneToggle.element.appendChild(document.createElement("br"));
  this.main.appendChild(this.incapToggle.element);
  
  //Floating elements too
  this.main.appendChild(this.killBut);
  this.main.appendChild(this.skillDisplay.table);
  
  this.showPawn = function(pawn) {
    this.pawn = pawn;
    this.nameTag.value = pawn.get("CharacterName");
    this.healthEdit.value = pawn.getHealth();
    
    this.insaneToggle.checkbox.checked = pawn.hostile();
    this.insaneToggle.element.style.display = pawn.isAnimal()?"":"none";
    
    this.incapToggle.checkbox.checked = pawn.incap();
    
    if(!this.teamSelect.selVal(pawn.team())) {
      var newopt = document.createElement("option");
      newopt.innerHTML = newopt.value = pawn.team();
      this.teamSelect.appendChild(newopt);
      this.teamSelect.selVal(pawn.team());
    }
    
    //Skill table
    if(pawn.isHuman()) {
      this.skillDisplay.table.style.display = "";
      this.skillDisplay.showPawn(pawn);
    }
    else 
      this.skillDisplay.table.style.display = "none";
  }
  this.setVisible = function(state) {
    this.main.style.visibility =state? "visible":"hidden";
  }
}
function PawnSkillTable(pawn) {
  var _this  = this;

  this.table = document.createElement("table");
  this.rows = {};
  this.pawn = null;
  //Populate table
  for(var i=0, l=PawnSkillTable.skills.length;i<l;i++) {
    //Get skill name
    var skill = PawnSkillTable.skills[i];
    //Create row for data
    var tr = document.createElement("tr"); 
    //Display skill name here
    var name = document.createElement("td");
    name.innerHTML = skill;
    //Display level here
    var level = document.createElement("td");
    var input = document.createElement("input");
    input.className = "decent";
    input.style.fontSize = "10pt";
    input.onchange = input.onkeyup = (function(skillName) {return (
        function() {
          if(this.value>20) {
            this.value=20;
          }
          else if(this.value<1) {
            this.value = 1;
          }
          _this.updateLv(skillName, this.value);
          
        }
    )})(skill);
    input.size = "2";    
    level.appendChild(input);
    /** TODO: experience display **/
    //var exp = document.createElement("td");
    
    //Append nodes to table
    tr.appendChild(name);
    tr.appendChild(level);
    this.rows[skill] = [tr, input];
    this.table.appendChild(tr);

  }
  this.showPawn = function(pawn) {
    if(pawn.skills==null) {
      this.table.style.display = "none";
      console.warn("Invalid pawn: ",pawn);
      return false;    
    }
    for(var i in this.rows) {
      this.rows[i][1].value = pawn.skills.getLevel(i);
    }
    //remember current pawn
    this.pawn = pawn;
  }
   
  this.updateLv = function(skill, level) {
    if(this.pawn!=null&&!this.pawn.removed) {
      this.pawn.skills.set(skill, level);
    }
  }                     
  
}
PawnSkillTable.skills = [
    "Construction","Growing","Research","Mining","Shooting","Melee","Social","Cooking","Medicine","Artistic","Crafting"
];

function selectFromArray(valuepairs) {
  var select = document.createElement("select");
  var opt;
  for(var i=0,l=valuepairs.length;i<l;i++) {
    opt = document.createElement("option");
    if(typeof valuepairs[i] =="object") {
      opt.value = valuepairs[i][0];
      if(valuepairs[i].length>1)
        opt.innerHTML = valuepairs[i][1];
      else
        opt.innerHTML = valuepairs[i][0];
    }
    else {
      opt.value = opt.innerHTML = valuepairs[i];
    }
    select.appendChild(opt);  
  }
  select.selVal = function(val) {
    for(var i=0,l=this.options.length; i<l;i++) {
      if(this.options[i].value==val) {
        this.selectedIndex = i;
        return true;
      }
    }
    return false;
  
  }
  return select; 
}
function checkboxWithLabel() {
  this.checkbox = document.createElement("input");
  this.checkbox.type = "checkbox";
  this.label = document.createElement("label");
  this.checkbox.id = this.label.for = "ch"+(10000000*Math.random());
  this.element = document.createElement("span");
  this.element.appendChild(this.checkbox);
  this.element.appendChild(this.label);
}