IDE_slide_html =  
HEADER + 
code_input + 
code_helpers +
author_bar +
buttons + 
code_ouput + 
FOOTER

describe("IDE UPDATE", function() {
	
  beforeEach(function () {
    slideNode = sandbox(IDE_slide_html); 
    slide = new CodeSlide(slideNode);
  });
  
  it("should show current code helper", function() {
	  
    spyOn(CodeSlide.prototype, 'showCodeHelper');	  
	  
    slide._update(0);
	  
    expect(CodeSlide.prototype.showCodeHelper.calls.length).toBe(1);
    expect(CodeSlide.prototype.showCodeHelper).toHaveBeenCalledWith(0);
	  
  });  
  
  it("should run the user last run", function() {
    spyOn(ServerExecutionContext.prototype, 'getContextOnServer').andReturn({"author": '', "code": 'last execution', "code_to_add": ''});
    spyOn(CodeSlide.prototype, 'executeCodeAt');

    slide._update(0);

    expect(ServerExecutionContext.prototype.getContextOnServer).toHaveBeenCalledWith('/code_last_execution/0');
    expect(CodeSlide.prototype.executeCodeAt).toHaveBeenCalledWith('/code_run_result');      
  });
  
  it("should NOT run the user last run when code has not changed", function() {

    slide._editor.updateWithText('last execution');
    
    spyOn(ServerExecutionContext.prototype, 'getContextOnServer').andReturn({"author": '', "code": 'last execution', "code_to_add": ''});
	  
    spyOn(CodeSlide.prototype, 'executeCode');
	  
    slide._update(0);
	  
    expect(CodeSlide.prototype.executeCode.calls.length).toBe(0);
	  
  });  
  
  it("should NOT run anything when no last run, no code to display and no code to add", function() {

    spyOn(ServerExecutionContext.prototype, 'getContextOnServer').andReturn({"author": '', "code": '', "code_to_add": ''});    
    
    slide._editor.updateWithText("print 'code remaining from previous slide'");
    
    postResource = jasmine.createSpy('postResource');
    
    slide._update(0);
    
    expect(postResource.calls.length).toBe(0); 

  });  

}); 

IDE_slide_with_code_to_display_html =  
HEADER + 
code_input + 
"<div class='code_helper'>"+
"<div class='code_to_display'>puts 'CODE TO DISPLAY'</div>"+
"</div>"+
author_bar +
buttons + 
code_ouput + 
FOOTER

describe("IDE UPDATE with CODE TO DISPLAY in Code Helper", function() {
  
  beforeEach(function () {
    slideNode = sandbox(IDE_slide_with_code_to_display_html);
    slide = new CodeSlide(slideNode);  
    spyOn(CodeSlide.prototype, 'executeCodeAt');    
  });  
	
  it("should display CODE TO DISPLAY when no execution context on server", function() {
    spyOn(ServerExecutionContext.prototype, 'getContextOnServer').andReturn({"author": '', "code": '', "code_to_add": ''});    
    expect(slide._editor.content()).toBe("");
    
    slide._update(0);

    expect(slide._editor.content()).toBe("puts 'CODE TO DISPLAY'");
    expect(CodeSlide.prototype.executeCodeAt).toHaveBeenCalledWith('/code_run_result');
  });
  
  it("should run last execution when exists", function() {
    spyOn(ServerExecutionContext.prototype, 'getContextOnServer').andReturn({"author": '', "code": 'LAST EXECUTION', "code_to_add": ''});    
    expect(slide._editor.content()).toBe("");
    
    slide._update(0);

    expect(slide._editor.content()).toBe("LAST EXECUTION");
    expect(CodeSlide.prototype.executeCodeAt).toHaveBeenCalledWith('/code_run_result');  
  });  

  it("should NOT run code that is already in editor", function() {
    spyOn(ServerExecutionContext.prototype, 'getContextOnServer').andReturn({"author": '', "code": '', "code_to_add": ''});
    expect(slide._editor.content()).toBe("");
    
    slide._update(0);

    expect(slide._editor.content()).toBe("puts 'CODE TO DISPLAY'");
    expect(CodeSlide.prototype.executeCodeAt.calls.length).toBe(1);	

    slide._update(0);

    expect(slide._editor.content()).toBe("puts 'CODE TO DISPLAY'");    
    expect(CodeSlide.prototype.executeCodeAt.calls.length).toBe(1);	
  }); 

});

IDE_slide_with_code_to_add_html =  
HEADER + 
code_input + 
"<div class='code_helper'>"+
"<div class='code_to_add'>puts 'CODE TO ADD'</div>"+
"</div>"+
author_bar +
buttons + 
code_ouput + 
FOOTER
  
describe("IDE UPDATE with code to ADD in Code Helper", function() {  
  
  beforeEach(function () {
    slideNode = sandbox(IDE_slide_with_code_to_add_html);
    slide = new CodeSlide(slideNode);   
   });	  
  
  it("should run code to add", function() {
    
    spyOn(ServerExecutionContext.prototype, 'getContextOnServer').andReturn({"author": '', "code": '', "code_to_add": ''});

    postResource = jasmine.createSpy('postResource').andReturn("CODE TO ADD");

    slide._update(0);
	  
    expect(slideNode.querySelector('#code_input').value).toBe("");	  
    expect(postResource).toHaveBeenCalledWith('/code_run_result/0', SEPARATOR + "puts 'CODE TO ADD'", SYNCHRONOUS);
    expect(slideNode.querySelector('#code_output').value).toBe("CODE TO ADD");  

  });	  
  
  it("should NOT run code that is already in editor", function() {
    
    spyOn(ServerExecutionContext.prototype, 'getContextOnServer').andReturn({"author": '', "code": 'code to execute', "code_to_add": "puts 'CODE TO ADD'" });
    spyOn(CodeSlide.prototype, 'executeCode');

    slide._editor.updateWithText('code to execute');	  
    slide._update(0);

    expect(CodeSlide.prototype.executeCode.calls.length).toBe(0);

  });  
  
  //~ it("should NOT run code if last execution exists and code to execute is empty", function() {

    //~ var slide = new CodeSlide(slideNode);    
    
    //~ spyOn(CodeSlide.prototype, 'lastExecution').andReturn({"author": '', "code": '', "code_to_add": 'ADDED CODE'});
    //~ spyOn(CodeSlide.prototype, 'executeCode');    
    
    //~ slide._editor.updateWithText('');
    //~ slide._update(0);
	  
    //~ expect(CodeSlide.prototype.executeCode.calls.length).toBe(0);    

  //~ });   
  
  it("should NOT display code to add in code editor", function() {

    spyOn(ServerExecutionContext.prototype, 'getContextOnServer').andReturn({"author": '', "code": '', "code_to_add": "puts 'CODE TO ADD'" });
    
    var slide = new CodeSlide(slideNode);
	  
    expect(slideNode.querySelector('#code_input').value).toBe("");	  
	  
    slide._update(0);	  

    expect(slideNode.querySelector('#code_input').value).toBe("");

  });
  
  //~ it("should NOT display code to add in Teacher code editor when get attendee last Send", function() {

    //~ getResource = jasmine.createSpy('getResource').andReturn('attendee name'+ '' + SEPARATOR + ''+ 'attendee code' +SEPARATOR + "puts 'CODE TO ADD'");

    //~ var slide = new CodeSlide(slideNode);
	  
    //~ expect(slideNode.querySelector('#code_input').value).toBe("");
	  
    //~ slide._update(0, 'teacher');	  

    //~ expect(slideNode.querySelector('#code_input').value).toBe("attendee code");

  //~ });
  
  it("should get last teacher run without code to add", function() {

    getResource = jasmine.createSpy('getResource').andReturn('0' + SEPARATOR + 'teacher run' + SEPARATOR + "puts 'CODE TO ADD'");
	  
    expect(slideNode.querySelector('#code_input').value).toBe("");	  
    
    slide.getAndExecuteCode()

    expect(slideNode.querySelector('#code_input').value).toBe("teacher run");

  });  

});
 
 

     