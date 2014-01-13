<?php
  define("included", true);
  include "updatelibs.php";
  
  define("LOCALHOST", $_SERVER["SERVER_ADDR"]=="127.0.0.1"||$_SERVER["SERVER_ADDR"]=="::1");
  if(!LOCALHOST) {
    /**Log wievs**/
    define("LOGFILE", "views.txt");
    define("IP", $_SERVER["REMOTE_ADDR"]);
    
    $views = file_exists(LOGFILE)?unserialize(file_get_contents(LOGFILE)):array();
  
    if(!isset($views[IP])) {
      $views[IP] = 1;
    }
    else {
      $views[IP]++;
    }
    file_put_contents(LOGFILE, serialize($views));
    
    if(isset($_GET["v"])) {
      header("Content-Type: text/plain; charset=utf-8");
      print_R($views);
      exit; 
    }
  }
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <meta name="generator" content="PSPad editor, www.pspad.com">
  <meta name="author" content="Jakub Mareda">
  <title>Rim world editor</title>
  <link rel="stylesheet" href="Progressbar.class.css" />
  <style type="text/css">
      body, html {
        margin:0px;
        padding:0px;
      }
     
      .h2 {
        font-size: 15pt;
        font-family: Arial;
      }
      input.decent, textarea.decent {
        border: 1px dashed black;
        background-color: transparent;
      }
      button.simple {
        color:black;
        background-color: white;
        border: 1px solid black;
      }
      button.simple.red {
        color:white;
        background-color: #FF3E15;
        border-color: red;
      }
      button.simple.red:hover {
        background-color: #FF4C23;
      }
      button.simple.red:active {
        background-color: white;
        border-color: red;
        color: #FF3E15;
      }
     
     
     table.map td {
       width: 20px;
       min-width: 20px;
       min-height: 20px;
       height: 20px;  
       padding: 0px;
       margin: 0px;
     }
     table.map { 
       margin: 0px;
       border-spacing: 0;
       border-collapse: collapse;
       table-layout: fixed;
     }
     table.map td div.holder {
       width: 20px;
       min-width: 20px;
       min-height: 20px;
       height: 20px;  
       padding: 0px;
       margin: 0px; 
       position: relative;  
     } 
     table.map td div.holder div {
       margin: 0px;
       top: 0px;
       left:0px;
       width:100%;
       height:100%;
       position:absolute;
       
     }

     div#viewport {
       overflow: hidden;
     
     }
     
     div.info {
       position:fixed;
       bottom: 70px;
       width:200px;
       /*height:300px;  */
       /*background: rgba(0,0,0,0.1);*/
       z-index: 7;
       color: white;
       padding:5px;
     }
     div.tools {
       position:fixed;
       left: 0px;
       bottom: 0px;
       /*width:100%;*/
       height:70px;
       z-index: 8;
       padding:0px;
       margin: 0px;
       overflow: hidden;
     }
     
     div.tools div.button {
       display: inline-block;
       background-color: rgba(0,0,0,0.5);  
       position: relative;
       width:64px;
       height: 64px;
       margin: 5px;
       cursor: pointer;
     } 
     div.tools div.button.selected div {
       display: none;
       position: absolute;
       z-index:8;
       width: 100%;
       height: 100%;
     }
     div.tools div.button.selected div {
       display: block;
       background-image: url("images/selected.png");
     }
     div.tools div.button img {
       position: absolute;
       z-index:7;
     }
     
     
div.tools.toolbox {
  position:fixed;
  left: 5px;
  bottom: 70px;
  width:230px;
  height: auto;
  background: rgba(0,0,0,0.5);
  border: 1px solid black;
  z-index: 7;
  color: white;
  padding:5px;
}

#spodek {
  display: none;
}
div.js_tooltip {
  background-color: rgba(0,0,0,0.8);
  border: 1px dashed black;
  color: white;
  font-family: monospace;
  font-size: 13pt;
  padding: 2px;
}
/**POPUPS**/
div.popup {
  position: fixed;
  z-index: 666;
  /*top: 0px;
  bottom: 0px; */
  margin-left: auto;
  margin-right: auto;
  
  border: 1px solid #AAAAAA;
  background-color: #CCCCE0;
  /*color:#517AFF;  */
  color: black;
  
  padding: 30px;
  
  /*min-height: 200px; */
  min-width: 200px;
  
  font-weight: bold; 
}
div.popup.hidden {
  display: none;
}
div.popup div.close {
  position:absolute;
  right: 5px;
  top:5px;
  width: 10px;
  height: 10px;
  background-color: red;
  cursor: pointer;
}

div.popup.error {
  color:white;
  background: #E61F00;
  max-width: 400px;
  border:1px solid black;
}
div.popup.error div {
  cursor: default;
}
div.popup.error div.close {
  background-color: #FFCB00;
}
.progressbar.hidden {
  display: none;
}

div.popupinput {
  width: 100%;
  text-align: left;

}
div.popupinput .input {
  float: right;
}
div.popupinput .comment {
  font-weight: bold;
}
div.popupinput.iconised {
  padding-left: 20px;
  background-position: left center; 
  background-repeat: no-repeat;
  background-size: 20px 20px;
}
/**PAWN manager css**/
/*Pawn list*/
div.pawnDiv {
  padding: 3px;
  background-color: #95A5E0;
  color: black; 
  border: 1px solid #195BFF;
  margin: 2px;
  cursor: default;
}
div.pawnDiv.teamcolonist {
  background-color: #93D942;
  border-color: #3FA000;
}
div.pawnDiv.teamcolonist:hover {
  background-color: #AFFF4D;
}
div.pawnDiv.teampsychotic, div.pawnDiv.teamraider {
  background-color: #FF876D;
  border-color: red;
}
div.pawnDiv.teampsychotic:hover, div.pawnDiv.teamraider:hover {
  background-color: #FFAB80;
}
div.pawnDiv.teamcolonist:hover {
  background-color: #AFFF4D;
}
div.pawnDiv.teamneutral:hover, div.pawnDiv.teamneutral:hover {
  background-color: #769AE0;
}
div.pawnDiv.selected {
  background-color: #2E4CE0;
  color: white;
}
div.pawnDiv.selected:hover {
  background-color: #2E63E0;
  color: white;
}
/*Pawn editor inputs*/
button.kill {
  position: absolute;
  bottom: 0px;
  right: 0px;
}


/*Big pawn screen*/
div.pawnDisplayer {
  width: 100%;
  height: 100%;
  position: relative;
}
div.pawnDisplayer table.skills {
  position:absolute;
  right: 0px;
}
/**Loader iframe**/
iframe.hidden {
  width: 0px;
  height: 0px;
  visibility: hidden;
}

/**ROCK TYPES**/
div.stone {
  background-position: center center; 
  background-repeat: no-repeat;
  background-size: contain;
}
div.stone.haul_debris {
  background-image: url('images/haul_debris.png');
}
div.stone.slag_debris {
  background-image: url('images/slag_debris.png');
}
div.stone.mineral {
  background-image: url('images/mineral.png');
}
div.stone.rock {
  background-image: url('images/rock.png');
}
/**ROOF TYPES**/
div.roof {
  background-position: center center; 
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0.5;
  z-index: 6;
}
div.roof.roof21 {
  background-image: url('images/thin_m_roof.png');
}
div.roof.roof22 {
  background-image: url('images/thin_r_roof.png');
}
div.roof.roof23 {
  background-image: url('images/thick_r_roof.png');
}
/**Fog of no fog**/
div.holder.fog {
  opacity: 0.8;
}
/**Highlighting of cells**/
div.highlight {
  z-index: 7;
}


  </style>
  </head>
  <body>
    <div id="beginning">
      Please select the savegame file: <input type="file" id="file_input" onchange="readMyData(this);" /><br /d>
      Or you can <a href="javascript: void(0);" onclick="loadAjax('Wasteland4.rim')">load sample world by AJAX</a>.
      There is also  <a href="javascript: void(0);" onclick="loadAjax('tiny.rim')">tiny world</a> that loads fast.<br>
      However, tiny world may not load in game. But <a href="javascript: void(0);" onclick="loadAjax('allremovedtest.rim')">here's a world</a> that has removed all things and works.
    
      <p>
        I will gladly read any feedback - the editor is buggy and I have a hard time finding out where. 
        <a href="http://ludeon.com/forums/index.php?action=post;topic=1560.0">Please let me know on the forums!</a>
      </p>
    </div>
    <div id="viewport">
    
    
    </div>
    <div id="spodek"><endora></div>
    


    <script type="text/javascript">

    
    
    
      /**This function just reads the XML from input and passes it as string**/
      function readMyData(input) {
          document.getElementById("beginning").style.display = "none";
          var file = input.files[0];
          if (file) {
              var reader = new FileReader();
              PROGRESS.text("Opening the file...");
              reader.readAsText(file, "UTF-8");
              reader.onload = function (evt) {
                  PROGRESS.text("File opened.");
                  startWorld(evt.target.result);
              }
              reader.onerror = function (evt) {
                  //Just ignore it
              }
          }
      }
      /**This function downloads sample world from server**/
      function loadAjax(name) {
        document.getElementById("beginning").style.display = "none";
        var req = HTTPRequest();
        req.open("GET", name, true);
        PROGRESS.text("Connecting...");
        req.onloadstart = function() {
          PROGRESS.text("Downloading file...");
        }
        req.onreadystatechange = req.onprogress = function() {
          var length = this.getResponseHeader("Content-Length");
          //console.log(length);
          if(length!=null) {
            //document.title = "Downloading file ("+Math.round((this.responseText.length/length)*100)+"%)";
            PROGRESS.progress((this.responseText.length/length)*100);
          }
        }
        req.onload = function() {
          //console.log(this.responseText);
          startWorld(this.responseText);
        }
        req.send();
      }      
      /**This function starts the editor itself**/
      function startWorld(data) {
        
        window.world = new RimWorld();
        //window.world.disableRendering = true;
        window.world.openXML(data);
      }
      
      function HTTPRequest() {
          if(typeof XMLHttpRequest != 'undefined') {
              return new XMLHttpRequest();
          }
          else if(typeof window.ActiveXObject != 'undefined')
          {
              return new ActiveXObject("Microsoft.XMLHTTP");
          }
      }
    </script>                           
    <script type="text/javascript" src="pagetools.js"></script>
    <script type="text/javascript" src="domboost.js"></script>
    <script type="text/javascript" src="tooltip.class.js"></script>
    <script type="text/javascript" src="Rim.class.js"></script>
    <script type="text/javascript" src="Rim.tools.js"></script>
    <script type="text/javascript" src="Rim.popups.js"></script>
    <script type="text/javascript" src="Rim.renderers.js"></script>
    <script type="text/javascript" src="Rim.things.js"></script>
    <script type="text/javascript" src="Rim.parsers.js"></script>
    <script type="text/javascript" src="tiles.js"></script>
    <script type="text/javascript" src="Progressbar.class.js"></script>
    <script type="text/javascript">
    /**This initiates a global instance of progress bar renderer**/
    //Same instance will be used all the time
    var PROGRESS = new ProgressRenderer();
    //PROGRESS.text("Pokus");
    
    
    
    function popupError(error) {
      var test = new RimEditorConfigPopup();
      test.text(error);
      test.addClass("error");
      test.show();
    }
    </script>                                       
  </body>
</html>
