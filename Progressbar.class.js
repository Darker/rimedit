function Progressbar() {
    var percent = 0;           //Percentage loaded
    var state = 0;
    var state_strings = [
           "normal",
           "disabled",
           "pending"
    ];
    var className = "progressbar";
    var holder = document.createElement("div");       //Container
    var inner = document.createElement("div");        //Graph
    var text = document.createElement("span");        //text
    var child = null;                                 //Child graph
    holder.className = className;                 //Setting the main class name for whole object         
    holder.appendChild(inner);
    inner.style.width="0%";                          //Setting default width
    inner.appendChild(text);
    var animation = new ProgressbarAnimationDefault(holder);
    
    this.waitForChild = true;
    this.ratio = 1;                                   //How much % one input unit means
    this.percent = function(percent_new) {            //Displays percentage loaded
      if(percent_new!=null&&typeof percent == "number"&&percent_new!=percent) {   //Only if the change is valid
        percent = percent_new*this.ratio;                        
        this.update();                                //Updating DOM
      }
      return percent;    
    }
    this.add = function(value) {                      //Changing percent value relatively
      if(value!=null&&typeof value == "number"&&value!=0){
         percent+=value*this.ratio;
         this.update();      
      }    
    }
    this.disabled = function(set) {
      if((set==true||set==false)&&state!=1*set) {    //Only accept bolean, only do something when value changes
        if(state==2) {
           this.pending(false);
        }
        state=1*set;                                 //setting disabled state
        if(state==1){
          holder.addClass("disabled");
          this.ondisable();                          //firing event
        }
        else {
          holder.removeClass("disabled");
        }
      }
      return state==1;
    }
    this.pending = function(set) {                   //Animation
       if(set==true) {
          if(animation.running())                    //already started
           return true;
          if(state==1)
            holder.removeClass("disabled");          //Switch from disabled state eventually
          holder.addClass("pending");
          inner.style.width="0%";
          state = 2;
          return animation.start();
       }
       else if(set==false){
          if(!animation.running())                   //Already stopped
            return false;
          animation.stop();
          holder.removeClass("pending");
          state = 0;
          this.update();
       } 
       return animation.running();
    }
    /* Update percent information */
    this.update = function() {
      if(animation.running())
         animation.stop();
      this.onvaluechange(percent);
      if(percent>=100) {
        if(child!=null) {   
          if(child.percent()<100) {
            child.add(1); 
            if(child.percent()<100)
              percent=0;
          }
          if(child.percent()>=100||!this.waitForChild) {
              this.onfinish();
          } 
        }
        else {
          this.onfinish();
          percent=100;
        }
      }
      if(state!=2) {
        inner.style.width = percent<=100?percent+"%":"100%";
        this.updateTextElement();
      }
    }
    this.setChild = function(c) {
        if(c instanceof Progressbar) {
            child = c;
        }
    }
    this.holderElement = function() {
      return holder;
    }
    this.graphElement = function() {
      return inner;
    }
    this.child = function() {
      return child;
    }
    this.className = function(name) {
      if(typeof name == "string"&&name!=className) {
        if(name=="pending"||name=="disabled")
          this.error("Cannot use reserved class name: \""+name+"\"", "className");
        holder.removeClass(className);
        holder.addClass(name);
        className = name;
      }
    }
    this.addClass = function(name) {
      if(typeof name == "string"&&name!=className) {
        if(name=="pending"||name=="disabled")
          this.error("Cannot use reserved class name: \""+name+"\"", "className");
        holder.addClass(name);
      }
    }
    this.removeClass = function(name) {
      if(typeof name == "string"&&name!=className) {
        if(name=="pending"||name=="disabled")
          this.error("Cannot use reserved class name: \""+name+"\"", "className");
        holder.removeClass(name);
      }
    }
    this.appendTo = function(elm) {
      elm = validateElement(elm);
      if(typeof elm=="object"&&typeof elm.appendChild=="function") {
        elm.appendChild(holder);
        this.updateTextElement();
      }
      else 
        this.error("Invalid object.","appendTo");
    }
    this.replace = function(elm) {
      elm = validateElement(elm);
      if(typeof elm=="object"&&elm.parentNode!=null&&typeof elm.parentNode.replaceChild=="function") {
        elm.parentNode.replaceChild(holder,elm);
        this.updateTextElement();
      }
      else 
        this.error("Invalid object.","replace");
    }
    function validateElement(elm) {
        if(typeof elm == "string") {
          elm = document.getElementById(elm);
        }
        return elm;    
    }
    this.updateTextElement = function() {
       //console.log(this.updateText.toString());
       text.innerHTML = this.updateText(percent);
    }
    this.setText = function(data) {
       text.innerHTML = data;
       return data;
    }
    /* Folowing functions may be altered by the user */
    this.onvaluechange = function() {};
    this.ondisable = function() {};
    this.onfinish = function() {};
    this.updateText = function(perc) {
      if(perc>100)
        perc=100;
      return Math.round(perc)+"%";
    }
    this.error = function(msg,name) {
      var error = new Error();
      var stack = error.stack.split("\n");
      stack = stack[stack.length-2];
      error.message = "Progressbar::"+name+"() -> "+msg+" [called on "+stack.substr(1)+"]";
      throw error;
    }
    if(window.DOM_BOOST_DEFINED==null)
      this.error("Library domboost.js required!","__constructor");
}
function ProgressbarAnimationDefault(handler) {
    var running = false;
    var timeout_id=-1;
    var direction = 1;
    this.speed = 5;
    var size = 0;
    var div = handler.getElementsByTagName("div")[0];
    this.mode = "overflow"; //overflow, cycle
    var _this=this;
    this.start = function() {
      if(running)
        return false;
      running = true;
      tick();
      return true;
    }
    this.stop = function() {
      if(!running)
        return false;
      running = false;
      if(timeout_id!=null)
        clearTimeout(timeout_id);
      timeout_id=null;
      div.style.width = null;
      return true;
    }
    this.running = function() {
      return running;
    }
    function tick() {
       div.style.width = size+"%";
       _this["mode_"+_this.mode]();
       //console.log(["mode_"+mode, this["mode_"+mode]]);
       timeout_id = setTimeout(function() {timeout_id=null;tick();}, 50);
    }
    this.mode_overflow = function() {
       size += this.speed*direction;    
       if(size>=100)
         size=0;
    }
    this.mode_cycle = function() {
       size += this.speed*direction;    
       if(size>=100||size<=0)
         direction*=-1;
    }
    this.mode_overflow_kvadratic = function() {
       size += ((this.speed+size/4)*direction)/6;  
       if(size>=100)
         size=0;
    }
}