function RimMapParser(world) {
  this.world = world;
  
  /**These methods should be used for saving and loading**/
  //They might be overriden by other save/load parsers
  this.loadTerrain = function() {
    return this.load("terrain");
  }
  this.loadRoofs = function() {
    return this.load("roofs");
  }
  this.loadRock = function() {
    return this.load("rock");
  }
  this.loadFog = function() {
  
  }
  this.loadHome = function() {
  
  }
  this.saveTerrain = function(terrain) {
    this.save("terrain", terrain);
  }
  this.saveRock = function(rock) {
    this.save("rock", rock);
  }
  this.saveRoofs = function(roofs) {
    this.save("roofs", roofs);
  }
  /**General save/load for current public release**/
  this.load = function(stuffname) {
    return this.makeInts(this.decodebase64(this.world.getField(this.dataPaths[stuffname]).textContent));
  }
  this.save = function(stuffname, array) {
    var string = "";
    for(var i=0,l=array.length;i<l;i++) {
      string+=String.fromCharCode(array[i]);
    }
    this.world.getField(this.dataPaths[stuffname]).textContent = btoa(string);
  }
  
  this.makeInts = function(string) {
    var array = [];
    for(var i=0,l=string.length; i<l; i++) {
      array.push(string.charCodeAt(i));
    }
    return array;
  }
  this.decodebase64 = function(data) {
    return atob(data.replace(/[\s\n]*/gm,""));
  }
  this.encodebase64 = function(string) {
    return btoa(string);
  }
  
  this.bitsInByte = 6;

  this.decompressBools = function(string, array) {
    for(var i=0,l=_this.world.size[2];i<l;i++) {
       for(var bitrr=0;bitrr<this.bitsInByte;bitrr++) {
         array.push(((string.charCodeAt(i) >> bitrr) & 1)==1);
       }
    }
  }
  
  this.compressBools = function() {
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
  this.tiledef = {
  
  
  }
  this.rockdef = [
     [53,"rock"],
     [54,"mineral"],
     [55,"haul_debris"],
     [56,"slag_debris"],
  ];
  this.dataPaths = {
    terrain: "TerrainGrid/TerrainMap",
    rock   : "CompressedThingMap",
    roofs  : "RoofGrid/Roofs",
  }
  this.translate = function(type, id) {
    var ar = this[type+"def"];
    for(var i=0; i<ar.length; i++) {
      if(ar[i][0]==id)
        return ar[i][1];
    } 
    return "unknown"; 
  }
  this.untranslate = function(type, name) {
    var ar = this[type+"def"];
    for(var i=0; i<ar.length; i++) {
      if(ar[i][0]==id)
        return ar[i][1];
    } 
    return "unknown"; 
  }
  
  this.init = function() {
    var ver = this.world.getVersion();
    switch(ver) {
      case 254 : RimMapParser254.apply(this, arguments);break;
      case 317 : RimMapParser317.apply(this, arguments);break;
      default : console.warn("Unknown world version: ", ver)
    }
  }
  this.init();
}

// JavaScript Document
function RimMapParser254() {


}

function RimMapParser317() {
  this.loadRock = function() {
    var terrain = this.load("rock");
    //Decrease rock ids by 1
    for(var i=0,l=terrain.length; i<l; i++) {
      terrain[i]--;
    } 
    return terrain;
  }     
  this.saveRock = function(rockIds) {
    var string = "";
    for(var i=0,l=rockIds.length;i<l;i++) {
      string+=String.fromCharCode(rockIds[i]+1);
    }
    this.world.getField(this.dataPaths["rock"]).textContent = btoa(string);
    //popupError("S aving 253 as 317? Not a good idea...");
  }  
  popupError("Build 317 not yet fully implemented!<br /><em>...you may try to save, but I've no idea what happens...</em>");
  /*this.rockdef = [
     [54,"rock"],
     [55,"mineral"],
     [56,"haul_debris"],
     [57,"slag_debris"],
  ]; */
}