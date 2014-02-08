// ----------------------------------
// COMMON
// ----------------------------------

var LEFT_ARROW = 37;
var RIGHT_ARROW = 39;
var DOWN_ARROW = 40;
var UP_ARROW = 38;
var SPACE = 32;

var SYNCHRONOUS = false;
var ASYNCHRONOUS = true;

var ALT = true 
var R = 82

var queryAll = function(query) {
  nodeList = document.querySelectorAll(query);
  return Array.prototype.slice.call(nodeList, 0);
};

var postResource = function(path, params, synchronous_asynchronous) {
  var xmlhttp = new XMLHttpRequest();	
  xmlhttp.open("POST", path, synchronous_asynchronous);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.send(params);	
  return xmlhttp.responseText;
};

var getResource = function(path) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", path, false);
  xmlhttp.send();
  return xmlhttp.responseText;
};

// ----------------------------------
// SLIDE CLASS
// ----------------------------------
var Slide = function(node) {
  this._node = node;
};


Slide.prototype = {
  
  _isPollResultSlide: function() {
    return this._node.querySelectorAll('.poll_response_rate').length > 0  
  },
  
  _update: function() {
  },
  
  _isCodingSlide: function() {
    return false;
  },   

  setState: function(state) {
    this._node.className = 'slide' + ((state != '') ? (' ' + state) : '');
  },
  
  updatePoll: function() {
    rateNodes = this._node.querySelectorAll('.poll_response_rate')
    for (var i=0; i<rateNodes.length; i++) {
      rateNodeId = '#' + rateNodes[i].id;
      rateNodeValue = "(" + getResource('/' + rateNodes[i].id) + "%)"
      this._node.querySelector(rateNodeId).innerHTML = rateNodeValue;
    }
  },
  
  savePoll: function(elementId) {
    postResource('/'+elementId, '', ASYNCHRONOUS);
  }, 

};

// ----------------------------------
// CODE SLIDE EXTENDS SLIDE CLASS
// ----------------------------------
var CodeSlide = function(node) {
  Slide.call(this, node);
  this._codeHelpers = this._node.querySelectorAll('.code_helper');
  this._declareEditor();
  this._declareEvents();
};

CodeSlide.prototype = {
  _codeHelpers: [],
	
  _isCodingSlide: function() {
    return this._node.querySelector('#execute') != null;
  },  

  _declareEditor: function() {
    if (typeof ace != 'undefined') { this.code_editor = ace.edit(this._node.querySelector('#code_input')); }
  }, 
  
  _declareEvents: function() {  
    var _t = this;	  
    this._node.querySelector('#code_input').addEventListener('keydown',
      function(e) { if ( e.altKey && e.which == R) { _t.executeCode(); } else {e.stopPropagation()} }, false
    );
    this._node.querySelector('#execute').addEventListener('click',
      function(e) { _t.executeCode(); }, false
    );      
  },  

  _update: function(slide_index) {
    this.showCurrentCodeHelper(slide_index);
  },  
  
  code: function() {
    editorContent = this._node.querySelector('#code_input').value;
    if (typeof ace != 'undefined') { editorContent = this.code_editor.getValue() }
    return editorContent;
  },	  

  executeCode: function() {
    this._node.querySelector('#code_output').value = postResource("/code_run_result", this.code(), SYNCHRONOUS);
  },

  _clearCodeHelpers: function() {
    for (var i=0; i<this._codeHelpers.length; i++) {
      this._codeHelpers[i].className = 'code_helper';
    }
  },  
  
  showCurrentCodeHelper: function(slide_index) {
    if (this._codeHelpers.length == 0) return;
    this._clearCodeHelpers();
    this._codeHelpers[slide_index].className = 'code_helper current';	  
  },   

  updateEditor: function(code) {
    this._node.querySelector('#code_input').value = code;
    if (typeof ace != 'undefined') { this.code_editor.setValue(code, 1); }	  
  },	  
  
  updateEditorAndExecuteCode: function(slide_index) {
    code = getResource('/code_last_run');
    if (code == '' && this._codeHelpers[slide_index] && this._codeHelpers[slide_index].querySelector('.code_to_display') ) code = this._codeHelpers[slide_index].querySelector('.code_to_display').innerHTML;
    if (code == '') return;
    this.updateEditor(code);
    this.executeCode();	  
  }, 
  
};

for(key in Slide.prototype) {
  if (! CodeSlide.prototype[key]) CodeSlide.prototype[key] = Slide.prototype[key];
};


// ----------------------------------
// SLIDESHOW CLASS
// ----------------------------------  
var SlideShow = function(slides) {
  this._slides = (slides).map(function(element) { 
	  if (element.querySelector('#execute') != null) { 
	    return new CodeSlide(element); 
	  } else { 
	    return new Slide(element); 
	  };
  });
  this._numberOfSlides = this._slides.length;

  var _t = this;
  document.addEventListener('keydown', function(e) { _t.handleKeys(e); }, false );   

  this._show_current_slide();
  this._update_poll_slide();
  this._show_current_code_helper(); 
  this._execute_code_in_code_helper();    
};



SlideShow.prototype = {
  _slides : [],
  _currentIndex : 0,
  _currentServerIndex : 0,
  _numberOfSlides : 0,
  _isUp : true,

  _clear: function() {
    for(var slideIndex in this._slides) { this._slides[slideIndex].setState('') }
  },

  _current_slide: function() {
    if (! this._isUp) return this._coding_slide();
    return this._slides[this._currentIndex];
  },
  
  _show_current_slide: function() {
    window.console && window.console.log("_currentIndex : " + this._currentIndex);
    window.console && window.console.log("_currentServerIndex : " + this._currentServerIndex);
    if (this._current_slide()) {
      this._clear();
      this._current_slide().setState('current');
    }
  },

  _coding_slide:function() {
    return this._slides[this._numberOfSlides-1]
  },  
  
  _show_coding_slide: function() {
    this._coding_slide().setState('current');
  },	  
  
  _update_poll_slide: function() {
    if (this._current_slide() && this._current_slide()._isPollResultSlide()) {
      this._current_slide().updatePoll();
    }
  },  
  
  _show_current_code_helper:function() {
    if (this._current_slide()) this._current_slide()._update(this._currentServerIndex);
  },  
  
  _execute_code_in_code_helper: function() {
    if (this._current_slide() && this._current_slide()._isCodingSlide()) this._current_slide().updateEditorAndExecuteCode(this._currentServerIndex);	  
  },  

  _is_a_number: function(index) {
    return  !( isNaN(index) );
  },
  
  _getCurrentIndexOnServer: function() {
    serverIndex = parseInt(getResource('/teacher_current_slide'));
    if ( this._is_a_number(serverIndex) ) this._currentServerIndex = serverIndex;
    if (this._numberOfSlides == 0 ) this._currentIndex = this._currentServerIndex;
    if (this._currentServerIndex <= (this._numberOfSlides -1) ) this._currentIndex = this._currentServerIndex;
  },    

  _postCurrentIndexOnServer: function() {
    postResource('/teacher_current_slide', 'index=' + this._currentIndex, ASYNCHRONOUS);  
  },

  prev: function() {
    if (this._currentIndex <= 0) return;
    this._currentIndex -= 1;
    this._currentServerIndex = this._currentIndex;	  
    if (this._isUp) this._show_current_slide();
    this._update_poll_slide();
    this._show_current_code_helper();	  
    this._postCurrentIndexOnServer();
  },

  next: function() {
    if (this._currentIndex >= (this._numberOfSlides - 1) ) return;
    if (this._slides[this._currentIndex+1] && this._slides[this._currentIndex+1]._isCodingSlide()) return;
    this._currentIndex += 1;
    this._currentServerIndex = this._currentIndex;		  
    if (this._isUp) this._show_current_slide();
    this._update_poll_slide();
    this._show_current_code_helper();
    this._postCurrentIndexOnServer();
  },
  
  down: function() {
    this._clear();
    this._show_coding_slide();
    this._isUp = false;
    this._show_current_code_helper();  
  },
  
  up: function() {
    this._isUp = true;
    this._show_current_slide();	  
  },

  synchronise: function() {
    this._getCurrentIndexOnServer();
    if (this._isUp) this._show_current_slide(); 
    this._show_current_code_helper();
  },
};
