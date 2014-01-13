(function() {
  var tooltip = document.createElement("div");
  //tooltip.style.position = "fixed";
  tooltip.style.position = "absolute";
  //tooltip.style.backgroundColor = "rgba(0,0,0,0.8)";
  //tooltip.style.border = "1px solid black";
  //tooltip.style.color = "white";
  //tooltip.style.minWidth = "100px";
  //tooltip.style.minHeight = "40px";
  tooltip.style.zIndex = "9999999";
  tooltip.style.display = "none";
  
  tooltip.className = "js_tooltip";
  tooltip.innerHTML = "Tooltip";  
  window.TOOLTIP_ELEMENT = tooltip;
  
  //document.body.appendChild(tooltip);
  
  function assignTooltip(element, callback, cache) {
      element.tooltipEvents = {
        "move": function(event){
            showTooltip(event, cache?this.cachedTooltip:(typeof element.tooltipCallback!="function"?callback:callback(element)))
            
        },
        "in":   function(event){this.cachedTooltip=(typeof callback=="string"?callback:callback(element))},
        "out":  function(event){tooltip.style.display="none";}
      }
      if(typeof element.addEventListener=="function") {
        element.addEventListener("mousemove",element.tooltipEvents.move);
        element.addEventListener("mouseout",element.tooltipEvents.out);
      }   
      else {
        //Nahrada za addEventListener:
        element.onmousemove = element.tooltipEvents.move;
        element.onmouseout = element.tooltipEvents.out;
      }
      //element.setAttribute("onmouseout", element.tooltipEvents.out.toString());
      if(cache==true) {
        element.cachedTooltip=(typeof callback=="string"?callback:callback(element));
        if(typeof element.addEventListener=="function") {
          element.addEventListener("mouseover", element.tooltipEvents['in']);
        }
        else {
          element.onmouseover = element.tooltipEvents['in'];
        }
      }
  }
  HTMLElement.prototype.setTooltip = HTMLElement.prototype.assignTooltip = function(callback, cache) {
    assignTooltip(this, callback, cache);
  }
  window.assignTooltip = assignTooltip;
  
  function showTooltip(event, content) {
     //Assign tooltip to the document tree on the first call
     if(tooltip.parentNode==null)
       document.body.appendChild(tooltip);
     if(content==false||content==null||content=="") {
       if(tooltip.style.display!="none")
         tooltip.style.display = "none";
       return;
     }
     var x, y;
     if (document.all!=null) { // grab the x-y pos.s if browser is IE
        x = event.clientX + document.body.scrollLeft;
        y = event.clientY + document.body.scrollTop;
     }
     else {  // grab the x-y pos.s if browser is NS
        x = event.pageX;
        y = event.pageY;
     }  
     tooltip.innerHTML = content;
     tooltip.style.top = (y*1+10)+"px";
     tooltip.style.left = (x*1+10)+"px";
     //console.log("Tooltip at ["+tooltip.style.top+", "+tooltip.style.left+"].");
     //console.log(tooltip);
     if(tooltip.style.display!="block") {
       tooltip.style.display = "block";
     }
  }
})();