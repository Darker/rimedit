//Definition of terrain marker class
//This class provides info about cell style by terrain ID ID
function TerrainMarker() {
  var colors = {
    "27":["#675138", "Concrete"],
    "28":["gray", "Rough hewn rock"],
    "29":["gray", "Rough stone"],
    "30":["#7A4F2E", "Smooth stone"], 
    "36":["#555550", "Pawed tile"],
    "37":["#6C645C", "That spaceship tiles"],
    "38":["blue", "blue carpet"],
    "39":["green", "Green carpet"], 
    "40":["red", "Red carpet"],
    "49":["#533E2B", "Gravel"],
    "50":["#A5542A", "Dirt"],
    "51":["yellow", "Dessert"],
  };
  const roofs = {
        "21": ["Metal roof", "images/thin_m_roof.png"],
        "22": ["Thin rock roof", "images/thin_r_roof.png"],
        "23": ["Thick rock roof", "images/thick_r_roof.png"],
  }
  const rock = {
        "55": ["Haul debris", "haul"],
  }

  this.getTerrainColor = function(id) {
    this.dummyTerrain(id);
    return colors[id][0];
  }  
  this.getTerrainInfo = function(id) {
    this.dummyTerrain(id);
    return colors[id];
  }  
  this.dummyTerrain = function(id) {
    if(colors[id]==null) {
      //Random color
      colors[id] = ["rgb("+rand(200,255)+","+rand(100,200)+","+rand(0,100)+")", "Unknown!"]; 
      console.log("Unknown tile: ",id);
    }
  }
  //
  this.getRoofBackground = function(roof) {
    if(roofs[roof]!=null) {
      return roofs[roof][1];    
    }
    return null;
  };
  //Roof name for info
  this.getRoofName = function(roof) {
    if(roofs[roof]!=null) {
      return roofs[roof][0];    
    }
    return null;
  }
  //Rock info
  this.getRock = function(id) {
    if(rock[id]!=null) {
      return rock[id];    
    }
    return null;
  };
}
