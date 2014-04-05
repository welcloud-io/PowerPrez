// ----------------------------------
// BLACKBOARD SLIDESHOW CLASS / EXTENDS SLIDESHOW
// ----------------------------------
var BlackboardSlideShow = function(slides) {
  SlideShow.call(this, slides);
};

BlackboardSlideShow.prototype = {
  
  _refresh: function() {
    this._refreshPosition();  
    //~ this._showCurrentSlide();
    if (this.position.hasChanged()) { this._showCurrentSlide(); };
    this._updateCurrentSlide();
  },  
  
  handleKeys: function(e) {
    switch (e.keyCode) {
      case SPACE:  
        this._refresh();
      break;	      
    }
  },	
};

for(key in SlideShow.prototype) {
  if (! BlackboardSlideShow.prototype[key]) BlackboardSlideShow.prototype[key] = SlideShow.prototype[key];
}

// ----------------------------------
// INITIALIZE SLIDESHOW
// ----------------------------------  
var blackboardSlideShow = new BlackboardSlideShow(queryAll(document, '.slide'));
var slideshowTimer = setInterval( function(){ blackboardSlideShow._refresh(); },1000);

