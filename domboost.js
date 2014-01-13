window.DOM_BOOST_DEFINED = true;
// JavaScript Document
HTMLElement.prototype.hasClass = function(classname) {
  var classes = this.className.split(" ");
  for(var i=0; i<classes.length;i++) {
	  if(classes[i]==classname)
	    return true;
	}
	return false;
}
HTMLElement.prototype.addClass = function(classname) {
  if(!this.hasClass(classname)) {
	  this.className+=" "+classname;
	  return true;
	}
	return false;
}
HTMLElement.prototype.removeClass = function(classname) {
  if(this.hasClass(classname)) {
	  this.className = this.className.replace(RegExp(classname,"g"),"");
	  this.className = this.className.replace(/[ ]+/g," ");
	  return true;
	}
	return false;
}
HTMLElement.prototype.hide = function() {
  this.style.display="none";
}
HTMLElement.prototype.show = function() {
  this.style.display=null;
  this.style.visibility=null;
}

HTMLElement.prototype.setRange = function(sta, end) {
  if(this.createTextRange) {
    var range = this.createTextRange();
    range.moveStart('character', sta);
    renge.collapse ();
    range.moveEnd('character', end);
    range.select();
  }
  else {
    if(this.selectionStart) {
       elem.focus();
       elem.setSelectionRange(start, end);
    }
    else
      elem.focus();
  }
}
/*Vrati pouze text bez HTML*/
HTMLElement.prototype.getText = Text.prototype.getText = function() {
  if(this.nodeType==3) {
    //console.log(elm);
    return this.data;      
  }
  else {
    var children = this.childNodes;
    var text = "";
    for (var i = 0, len = children.length; i < len; ++i) {
      if(children[i].nodeType == 3){
        text+=children[i].data;
      }
      else if(children[i].tagName=="BR"){
         text+="\n";
      }
      else {
         text+=children[i].getText();
      }
    }
    return text;
  }
}
 

/*
<div id="test">12<b>34</b><br>5<span>6<b>7</b>8</span>9</div>
var t = document.getElementById("test");
var index = 4
var data = t.selectionCharIndex(index);
var text=data[0].getText();
console.log(text,data);
text.substring(data[1],1);
*/
//Divnosti
/*
HTMLElement.prototype.srovnej = function(kym) {
  if(kym.parentNode!=this)
    return false;
  this.style.width = (kym.offsetWidth+10)+"px";
  this.style.height = (kym.offsetHeight+10)+"px";
  this.style.top = Math.round((windowSize()[1]-this.offsetHeight)/2)+"px";
  this.style.left = Math.round((windowSize()[0]-this.offsetWidth+2)/2)+"px";
  var _this = this;
  this.rovnani = function() {_this.srovnej(kym);};
  if(this.rovnany==null) {
    this.rovnany=true;
    window.addEventListener("resize",this.rovnani);
  }
}         */
/*ARRAY*/
Array.prototype.each = function(callback) {
  if(typeof callback!='function')
    throw new Error("Array.each requires valid callback.");
  for(var i=0; i<this.length; i++) {
    this[i] = callback(this[i]);
  }
}
Array.prototype.next = function(strict) {
   this.pointer++;
   if(this.pointer>=this.length) {
     if(strict==true)
       return null; 
     else
       this.pointer=0;
   }
   return this[this.pointer];
}
Array.prototype.prew = function() {
   this.pointer--;
   if(this.pointer<0)
     this.pointer=this.length+this.pointer;
   return this[this.pointer];
}
Array.prototype.rewind = function() {
   this.pointer=-1;
}
Array.prototype.pointer = -1;
Array.prototype.contains = function(needle) {
    for(var i=0; i<this.length; i++) {
       if(this[i]==needle)
         return true;
    }
    return false;
} 
Array.prototype.find = function(needle) {
    for(var i=0; i<this.length; i++) {
       if(this[i]==needle)
         return i;
    }
    return false;
} 
Array.prototype.shuffle = function() {
    var temp = [];
    var me = [];
    
    for(var i=0; i<this.length; i++) {
      me[i] = this[i];    
    }
    
    while(me.length!=0) {
      temp.push(me.splice(Math.floor(Math.random()*me.length),1)[0]);
    }
    return temp;
}
Array.prototype.compare = function(array) {
    if(this.length!=array.length)
      return false;
    for(var i=0; i<this.length; i++) {
      if(this[i] instanceof Array&&array[i] instanceof Array){   //Compare arrays
          if(!this[i].compare(array[i]))                         //!recursion!
            return false;
      }
      else if(this[i]!=array[i]) {                     //Warning - two diferent objec instances will never be equal: {x:20}!={x:20}
          return false;
      }
    }
    return true;
}
/*STRING*/
String.prototype.countOf = function(str) {
  var count = 0;
  var me = this.valueOf();
  while(me.indexOf(str)!=-1) {
    me=me.substr(me.indexOf(str)+str.length);
    count++;
  }
  return count;
}
String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};
String.prototype.repeat = function(count) {
    var val = "";
    for(var i=0; i<count; i++) {
      val+=this.valueOf();
    }
    return val;
}
/* Form Data */
if(typeof FormData != "undefined") {
  FormData.prototype.appendFiles = function(input) {
    if(input.files.length==0)
      return this;
    else if(input.files.length==1) {
      this.append(input.name,input.files[0]);
    }
    else { 
      for(var i=0; i<input.files.length; i++){
        this.append(input.name+"[]", input.files[i]);
      }
    }
    return this;
  }
}