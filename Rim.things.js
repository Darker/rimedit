// JavaScript Document
function RimThingCollection(IDMap) {
  //Unset some of the array inherited methods
  //delete this.push;
  this.idMap = typeof IDMap=="object"?IDMap:{};
  //return sub collection
  this.getThingsByClass = function(className, strict) {
     if(typeof className=="object")
       return this.getThingsByClassEx(className, strict);
     var things = new RimThingCollection(this.idMap);
     for(var i=0,l=this.length; i<l;i++) {
       if(this[i].className==className) {
         things.push(this[i]);
       }
     }  
     return things;
  }
  //Returns class by comparing subclasses
  this.getThingsByClassEx = function(className,strict) {
     var things = new RimThingCollection(this.idMap);
     var add, cls;
     for(var i=0,l=this.length; i<l;i++) {
       add = true;
       cls = this[i].classNameEx;
       if(strict&&className.length!=cls.length)
         continue;
       for(var j=0; j<className.length; j++) {
         if(className[j]!=cls[j]) {
           add=false;
           break;         
         }
       }
       if(add)
         things.push(this[i]);
     }  
     return things;
  }
  this.getThingsInRect = function(A, B) {
    var things = new RimThingCollection(this.idMap);
    //Make A, B corners of the rect
    makeCorners(A,B);
    //now just compare positions
    for(var i=0,l=this.length; i<l;i++) {
       var pos = this[i].pos;
       if(pos==null)
         continue;
       if(pos[0]>A[0]&&pos[2]>A[1]&&
           pos[0]<B[0]&&pos[2]<B[1]) {
         things.push(this[i]);
       }
    }
    return things;
  }
  //For performance, I have almost the same function here twice
  this.getThingsNotInRect = function(A, B) {
    var things = new RimThingCollection(this.idMap);
    //Make A, B corners of the rect
    makeCorners(A,B);
    //now just compare positions
    for(var i=0,l=this.length; i<l;i++) {
       var pos = this[i].pos;
       if(pos==null)
         continue;
       if(!(pos[0]>A[0]&&pos[2]>A[1]&&
           pos[0]<B[0]&&pos[2]<B[1])) {
         things.push(this[i]);
       }
    }
    return things;
  }
  this.getThingById = function(id) {
    if(this.idMap[id]!=null) {
      return this.idMap[id];
    }
    for(var i=0,l=this.length; i<l;i++) {
       if(id==this[i].id) {
         this.idMap[id] = this[i];
         return this[i];
       }
    }
  }
  //each alias
  this.each = function(callback, par2) {
    if(par2!=null)
      this.eachInRange(par2);
    this.map(callback);
  }
  
  //Filtering
  this.filter = function(callback) {
    var things = new RimThingCollection(this.idMap);
    for(var i=0,l=this.length; i<l;i++) {
       var th = this[i];
       if(callback(th))
         things.push(th);
    }
    return things;
  }
  //Remove all things from global scope and all lists
  this.remove = function() {
    while(this.length>0) {
      this[0].remove();   
    }
  }
  //load external array or ELM collection
  this.use = function(ar) {
    for(var i=0,l=ar.length; i<l;i++) {
       var className = ar[i].getAttribute("Class");
       if(className=="Pawn") {
          this.push(new RimPawn(ar[i]));
       }
       else 
         this.push(new RimThing(ar[i]));
    }
  }
  //Check if thing was removed and eventually splice
  this.checkRemoved = function(index, thing) {
    if(index==null) {
      for(var i=0,l=this.length; i<l;i++) {
         if(this.checkRemoved(i, this[i])) {
           i--;
           l--;
         }
      }
      return null;
    }
    if(thing.removed) {
      this.splice(index, 1);
      return true;
    }
    return false;
  }
  

  //To remove a thing from list 
  this.removeEl = function(elm) {
    for(var i=0,l=this.length; i<l;i++) {
       if(elm==this[i]) {
         this.splice(i,1);
         return elm;
       }
    }
    return null;
  }
}
RimThingCollection.prototype = new Array();
//RimThingCollection.prototype.arPush = RimThingCollection.prototype.push;
//Override original .push
RimThingCollection.prototype.arPush = function(elm) {
     elm.lists.push(this);
     this.push(elm);
}    

function RimThing(xml) {
  //Dummy placeholders
  this.id = null;
  this.pos = null;
  //The XML element te refer to
  this.xml = null;
  //If the item is removed
  this.removed = false;
  //ClassName might be defined from child classes
  if(typeof this.className=="undefined") {
    //The class
    this.className = null;
    //Classname exploded by "_" for finding sub classes
    this.classNameEx = null;
  }
  //Array of cached values
  this.cachedValues = null;
  //Setter for values
  //Third argument will create the tag if it doesn't exist
  this.set = function(name, value, force) {
      var textVal;
      //Update position if it's being changed
      if(name=="Pos") {
        this.pos = value;
      }
      //Update id
      if(name=="ID") {
        value = this.className+value;
        this.id = value;
      }
      /*if(name=="HealthTracker/Incapacitated"&&value!="True"&&value!="False"||this.get("HealthTracker/Incapacitated")==="") {
        //alert("Empty value for INCAP tag!!!");
        console.log(this.cacheElmRef("HealthTracker/Incapacitated", force!=false));
        throw new Error("Bad incapacation tag!");
      }           */
      //Parse value to string
      if(value!=null&&typeof value == "object")
        textVal = parseValue(value);
      else
        textVal = value;
        
      //Get target element
      var target = this.cacheElmRef(name, force!=false);
      if(target!=null) {
        if(value==null) {
          target.textContent = "";
          target.setAttribute("IsNull", "True");
          this.event("change", [name, value]);        
        }
        else {
          target.textContent = value; 
          target.removeAttribute("IsNull");
          this.event("change", [name, value]);      
        }
      } 
      else
        console.warn("<"+name+"> Does not exist in",this);
  }
  //Setter methods
  this.setID = function(val) {
    this.set("ID", val);
  }
  //Called to read most important values from the XML
  //1st parameter xmlDoc is the document object context
  this.init = function(xmlDoc) {
    //Create new xml node if this is new thing
    if(this.xml == null) {
      this.xmlDoc = xmlDoc;
      this.createNew();
      this.setClass(this.className);
      return;
    }
    //Load most vital properties
    if(this.pos==null) {
      var posElm = this.cacheElmRef("Pos");
      if(posElm!=null)
        this.pos = parseValue(posElm.textContent);
      //else 
      //  console.log("Thing with no position", this);
    }
    this.id = this.cacheElmRef("ID");
    if(this.id==null) {
      console.log("Thing with no ID", this)    
    }
    else this.id = this.id.textContent;
  }
  //Will also update class name in XML
  this.setClass = function(className) { 
    //Act as getter
    if(className==null) {
      return this.className;
    }
    //Load class name from XML
    if(className==true) {
      this.className = xml.getAttribute("Class");
      this.classNameEx = this.className.split("_");
      return this.className;
    }
    //Save class name to XML
    this.className = className;
    this.xml.setAttribute("Class", className);              
    this.classNameEx = this.className.split("_");

  }
  //Getter for values
  this.get = function(name, safe) {
    var elm = this.cacheElmRef(name, false);
    if(elm==null||elm.textContent==null) {
      console.warn("<"+name+"> Does not exist in",this);
      return null;
    }
    else {
      return parseValue(elm.textContent);
    }
  }
  //Caches element DOM instances, that were retrieved by name (string)
  this.cacheElmRef = function(name, create) {
    if(this.cachedValues==null)
      this.cachedValues = {};
    if(typeof this.cachedValues[name]=="undefined"||this.cachedValues[name]==null) {   
      var elm;
      //Use faster algorithm for simple names
      if(name.indexOf("/")==-1) {     
        var elm = this.xml.getElementsByTagName(name)[0];    
        //Create node if create switch is on and node does not exist
        if(elm==null&&create) {
          elm = this.xml.ownerDocument.createElement(name);
          this.xml.appendChild(elm);
        }
      }
      //Use function for paths
      else {
        elm = this.getElementByXPath(name, create);
      }
      /*if(elm==null) {
        console.log("Element not found...");
      }  */
      //Return result (even null)
      return this.cachedValues[name]=elm;
    }
    return this.cachedValues[name];
  }
  //Get element by XPath
  this.getElementByXPath = function(path, create) {
    var current = this.xml;
    var next = null;
    path = path.split("/");
    for(var i=0; i<path.length; i++) {
      next = current.getElementsByTagName(path[i])[0];
      //If next was not found
      if(next==null) {
        if(create) {
          //Create new node and append it
          next = current.ownerDocument.createElement(path[i]);
          current.appendChild(next);
        }
        else 
          //Or exit if create is false
          return null;
      }
      //Jump one node deeper
      current = next;
    }
    //Return last element
    return current;
  }
  //To delete element from save
  this.remove = function() {
    this.event("remove");
    delete this.cachedValues;
    this.xml.parentNode.removeChild(this.xml);
    delete this.xml;
    delete this.pos;
    delete this.get;
    delete this.set;
    this.removed = true;
  }
  //Various info functions
  //A, B MUST!!! be top left and bottom right respectivelly
  this.inRect = function(A,B) {
    return this.pos[0]>A[0]&&this.pos[1]>A[1]&&
           this.pos[0]<B[0]&&this.pos[1]<B[1];
  }
  //Generating
  this.createNew = function() {
    this.xml = this.xmlDoc.createElement("Thing");
    //this.xml.setAttribute("Class", this.className);
  }
  /**Events and event listeners**/
  this.addEventListener = function(evtName, callback) {
     if(this.removeEventListener==null) {
       EventHandler.apply(this, arguments);
       return this.addEventListener(evtName, callback);
     }
  }
  this.event = function(name, args) {
    if(this.dispatchEvent!=null) {
      this.dispatchEvent(name, args);
    }
  }       
  /** helper getters and setters**/
  this.getHealth = function() {
    if(this.className=="Pawn") {
      return this.get("HealthTracker/PawnHealth");
    }
    else
      return this.get("Health");
  }
  //Team
  
  this.team = function(team) {
    if(team!=null) {
      this.set("Team", team);
    }
    team = this.get("Team");
    if(team==null||team==0)
      return "Neutral";
    else
      return team;
  }
  
  this.isAnimal = function() {
    var mind = this.cacheElmRef("Mind");
    if(mind!=null) {
      return mind.getAttribute("Class").indexOf("Pawn_MindAnimal")!=-1;
    }
    return false;
  }
  this.isHuman = function() {
    var mind = this.cacheElmRef("Mind");
    if(mind!=null) {
      return mind.getAttribute("Class").indexOf("Pawn_MindHuman")!=-1;
    }
    return false;
  }
  
  function parseValue(value) {
    if(value==null)
      return null;
    if(typeof value == "object") {
      if(value.length==3) {
         return "("+value.join(", ")+")";
      }
      else if(value.length==2) {
         return "("+value[0]+", 0, "+value[1]+")";
      }
    }
    else {
      if(value[0]=="(") {
        var matches = /\(([0-9.]+), ([0-9.]+), ([0-9.]+)\)/.exec(value);
        if(matches!=null) {
          return [1*matches[1],1*matches[2],1*matches[3]];
        }
      }
      if(1*value==value)
        return 1*value;
      else 
        return value;
    } 
  }
  //If this is called as the constructor
  if(xml!=null) {
    if(xml instanceof Document) {
      this.init(xml);
    }
    else {
      this.xml = xml;
      this.className = xml.getAttribute("Class"); //.attributes["Class"].nodeValue; 
      this.classNameEx = this.className.split("_");
      this.init();
    }
  }
}
function RimPawn(xml) {
  //Set class name
  this.className = "Pawn";
  //Init dom
  //var initParent = this.init;
  this.createPawn = function(document) {
    //Init parent class
    RimThing.apply(this, arguments);
    //Most importantly
    this.set("Def", "Pawn");
    //Name
    this.set("CharacterName", "New Pawn");
    //set fields
    this.set("Pos",[0,0,0]);
    this.set("ID", 0);
    this.set("Team", "Neutral");
    this.set("Age", Math.round(Math.random()*45+15));
    this.set("CarriedThing", null);
    //Renderer
    this.set("Drawer/Renderer/BodyName", null);
    this.set("Drawer/Renderer/HeadName", null);
    //Mind
    this.set("Mind/MindState/EnemyTarget", null);
    //No sexism!
    this.set("Sex", Math.random()>0.5?"Male":"Female");
    //Movement
    this.set("Pather", "");
    //Equipment
    this.set("Equipment/Primary", null);
    this.set("Equipment/Secondaries", "");
    //Empty inventory
    this.set("Inventory/InventoryList", "");
    //Filth
    this.set("Filth/CarriedFilth", "");  
    //Psychology
    this.set("Psychology", null);   
    //Needs
    this.setFood(100);
    this.setRest(100);
    //Stuff
    this.set("Prisoner", null);
    this.set("Ownership", null);
    this.set("Talker", null);   
    this.set("Story", null);  
    this.set("Skills", null); 
    //Traits must be present even for animals
    this.traits = new RimTraitList(this.getElementByXPath("Traits",true));                                 
  }
  //Load pawn from existing xml
  this.initPawn = function(xml) {
    //Init parent class
    RimThing.apply(this, arguments);
    //Traits must be present even for animals
    //this.traits = new RimTraitList(this.getElementByXPath("Traits",true));     
  }
  //Stats
  this.setHealth = function(health) {
    if(health==null) {
      if(RimPawn.MaxHealth[this.kind]!=null) {
        health = RimPawn.MaxHealth[this.kind];
      }
      else
        health = 100;
    }
    this.set("HealthTracker/PawnHealth", health);
  }
  //Food and rest
  this.setFood = function(rate) {
    this.set("Food/PieceFood/CurLevel", rate);
  }
  this.setRest = function(rate) {
    if(rate==null)
      this.set("Rest", null);
    else
      this.set("Rest/PieceRest/CurLevel", rate);
  }
  //Agresivity
  this.hostile = function(state) {
    if(state!=null)
      this.set("Mind/MindState/BrokenState", state?"Psychotic":"null");
    else {
      return this.get("Mind/MindState/BrokenState")=="Psychotic";
    }
  }
  //Inventory
  this.hasKey = function(state) {
    if(state) {
      this.set("Inventory/InventoryList","<Thing Class=\"ThingWithComponents\"><Def>DoorKey</Def><ID>DoorKey666"+Math.round(Math.random()*1000)+"</ID><Health>30</Health></Thing>");
    }
    else {
      this.set("Inventory/InventoryList", "");
    }

  }
  //Renderer
  this.setBody = function(body) {
    this.set("Drawer/Renderer/BodyName", body);
  }
  this.setHead = function(head) {
    this.set("Drawer/Renderer/BodyName", head);
  }
  //Incapacitation
  this.incap = function(state) {
    if(state!=null) {
      this.set("HealthTracker/Incapacitated", state?"True":"False");
      return state;
    }
    return this.get("HealthTracker/Incapacitated")=="True";
  }

  //Constructor code
  if(xml!=null) {
    this.initPawn(xml);
    if(this.isHuman()&&this.skills==null) {
       RimHuman.apply(this, arguments);
    } 
  }
  
  //Load sub-helper classes (on demand)
  this.initSub = function() {
    if(this.isHuman()&&this.skills==null) {
       RimHuman.apply(this, arguments);
    } 
  }
  
}
RimPawn.MaxHealth = {
  "Colonist" : 100,
  "Raider" : 100,
  "Muffalo": 160,
  "Boomrat": 50,
  "Squirrel": 30
}
//List of possible stories
RimPawn.MaxStory = {

}

function RimAnimal(document, type) {

  //If this is a new pawn
  if(typeof type=="string") {
    //Init parent classes
    this.createPawn(document);
    //Set animal specific stuff
    this.set("Kind", type);
    this.kind = type;
    this.set("CharacterName", type);
    this.setHealth();
    //Disabe rest at all
    this.setRest(null);
    //Configure proper AI
    this.getElementByXPath("Mind",true).setAttribute("Class", "Pawn_MindAnimal");
    //Disable setHead function
    this.setHead = function() {};
    //set proper body
    this.setBody(type);
  }
  else {
    //Init parent classes
    this.initPawn(type);
  }
  
}
RimAnimal.prototype = new RimPawn();      

function RimHuman(document, type) {

  //If this is a new pawn
  if(type==null&&this.xml==null) {
    //create new pawn instance
    this.createPawn(document);
    //Configure info
    this.set("Kind", type);
    this.kind = type;
    this.set("CharacterName", "Human");
    this.setHealth();
    //Configure proper AI
    this.getElementByXPath("Mind",true).setAttribute("Class", "Pawn_MindHuman");
    //Create story
    this.story = new RimStoryItemList(this.getElementByXPath("Story",true));
    //Populate psychology
    this.set("Psychology","");
    this.set("Psychology/LoyaltyBase/CurLevel",100);
    this.set("Psychology/PieceHappiness/CurLevel",100);
    this.set("Psychology/PieceFear/CurLevel",100);
    this.set("Psychology/PieceEnvironment/CurLevel",100);
    this.set("Psychology/PieceOpenness/CurLevel",100);
    this.set("Psychology/ThoughtHandler/ThoughtList","");
    //Thoughts will be populated ingame
    
    //Populate skills
    this.skills = new RimSkills(this);
    this.skills.populate();
  }
  else {   
    //Init parent classes
    if(this.xml==null)
      this.initPawn(type);      
    //Init some helpers
    this.story = new RimStoryItemList(this.getElementByXPath("Story",true), this.getElementByXPath("Story/StoryItems",true));
    this.skills = new RimSkills(this);
  }
}
RimHuman.prototype = new RimPawn();           

function RimStoryItemList(xml, container) {
  this.xml = xml;
  //Remove null if present
  xml.removeAttribute("IsNull");
  var childhood, adulthood;
  if(container==null) {
    childhood = xml.ownerDocument.createElement("Int32");
    childhood.textContent = 4;
    adulthood = xml.ownerDocument.createElement("Int32");
    adulthood.textContent = 5;
    container = xml.ownerDocument.createElement("StoryItems");
    container.appendChild(childhood);
    container.appendChild(adulthood);
    xml.appendChild(container);
  }
  else {
    childhood = container.children[0];
    adulthood = container.children[1];
  }
  this.add = function(num, age) {
    if(age==0) {
      childhood.textContent = num;
    }
    else {
      adulthood.textContent = num;
    }
      
  }
}

function RimTraitList(xml) {
  this.xml = xml;
  var container = xml.ownerDocument.createElement("TraitList");
  xml.appendChild(container);
  //Remove null if present
  xml.removeAttribute("IsNull");
  this.add = function(name) {
    if(this.contains(name))
      return true;
    this.arpush(name);
    var node = xml.ownerDocument.createElement("Trait");
    node.setAttribute("Class", "Trait");
    node.textContent = name;
    container.appendChild(node);      
  }
  //Remove trait
  this.remove = function(trait) {
    if(typeof trait=="string") {
      trait = this.find(trait);    
    }
    if(trait==null||trait==false) {
      return null;
    }
    container.removeChild(container.childNodes[trait]);
    this.splice(trait, 1);
    return trait;
  }
  //Overide array methods
  this.arpush = this.push;
  this.push = function(name) {
    this.add(name);
  }
  
  this.arsplice = this.splice;
  this.splice = function(start, length) {
    for(var i=0; i<length; i++)
      this.remove(start+i);
  }
}
RimTraitList.prototype = new Array();

function RimSkills(human) {
  this.populate = function() {
    human.set("Skills/Level_Construction", 5);
    human.set("Skills/XpSinceLastLevel_Construction", 0);
    human.set("Skills/Level_Growing", 5);
    human.set("Skills/XpSinceLastLevel_Growing", 0);
    human.set("Skills/Level_Research", 5);
    human.set("Skills/XpSinceLastLevel_Research", 0);
    human.set("Skills/Level_Mining", 5);
    human.set("Skills/XpSinceLastLevel_Mining", 0);
    human.set("Skills/Level_Shooting", 5);
    human.set("Skills/XpSinceLastLevel_Shooting", 0);
    human.set("Skills/Level_Melee", 5);
    human.set("Skills/XpSinceLastLevel_Melee", 0);
    human.set("Skills/Level_Social", 5);
    human.set("Skills/XpSinceLastLevel_Social", 0);
    human.set("Skills/Level_Cooking", 5);
    human.set("Skills/XpSinceLastLevel_Cooking", 0);
    human.set("Skills/Level_Medicine", 5);
    human.set("Skills/XpSinceLastLevel_Medicine", 0);
    human.set("Skills/Level_Artistic", 5);
    human.set("Skills/XpSinceLastLevel_Artistic", 0);
    human.set("Skills/Level_Crafting", 5);
    human.set("Skills/XpSinceLastLevel_Crafting", 0);
    
    human.getElementByXPath("Skills").removeAttribute("IsNull");
  }
  this.set = function(skill, level, exp) {
     skill = skill[0].toUpperCase()+skill.substr(1);
     if(level!=null)
       human.set("Skills/Level_"+skill,level);
     if(exp!=null)
       human.set("Skills/XpSinceLastLevel_"+skill, exp);
  }
  this.getLevel = function(skill) {
     skill = skill[0].toUpperCase()+skill.substr(1);
     //With the ||0 will return 0 if the node is null
     return human.get("Skills/Level_"+skill)||0;
  }
  this.getXP = function(skill) {
     skill = skill[0].toUpperCase()+skill.substr(1);
     return human.get("Skills/XpSinceLastLevel_"+skill)||0;
  }
}