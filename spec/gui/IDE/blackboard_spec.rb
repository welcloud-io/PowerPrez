#encoding: utf-8

require 'rspec'
require 'capybara/rspec'

## -------------------------------------------------------
## SINATRA CONTROLLER (BEGIN)
## -------------------------------------------------------

require_relative '../../../controllers/slideshow.rb'
require_relative 'helper.rb'

Capybara.app = Sinatra::Application.new

set :public_folder, 'fixtures'
set :logging, false

teacher_presentation = '/teacher/presentation'
attendee_IDE = '/attendee/IDE'

blackboard_presentation = '/blackboard/presentation'
blackboard_with_code_to_display = '/blackboard_with_code_to_display'

get teacher_presentation do
  session[:user_session_id] = $teacher_session_id
  redirect "teacher_presentation.html"
end

get attendee_IDE do
  session[:user_session_id] = '1'
  redirect "attendee_IDE.html"
end

get blackboard_presentation do
  redirect "blackboard_presentation.html"
end

get blackboard_with_code_to_display do  
  redirect "blackboard_with_code_to_display.html"
end

## -------------------------------------------------------
## SINATRA CONTROLLER (END)
## -------------------------------------------------------

describe 'Blackboard Presentation', :type => :feature, :js => true do  
	
  before(:all) do
    $db.execute_sql("delete from run_events") 
    $db.execute_sql("delete from teacher_current_slide") 
  end

  it 'should be on first slide when teacher is on first slide' do

    visit teacher_presentation
    
    expect(page).to have_content 'CODING EXERCISE - 1'
  
    visit blackboard_presentation
        
    expect(page).to have_content 'CODING EXERCISE - 1'   

  end
  
  it 'should be on second slide when teacher is on second slide' do
    
    visit teacher_presentation
    
    go_right
    
    expect(page).to have_content 'CODING EXERCISE - 2'
  
    visit blackboard_presentation
        
    expect(page).to have_content 'CODING EXERCISE - 2'  

  end

  it 'should be on IDE with code helper 2 when teacher is on IDE with code helper 2' do

    visit teacher_presentation

    go_down    

    expect(page).to have_content 'HELPER 2'

    visit blackboard_presentation

    expect(page).to have_content 'HELPER 2'       

  end
  
  it 'should be on IDE with code helper 1 when teacher is on IDE with code helper 1' do
    
    visit teacher_presentation
    
    go_left
    
    expect(page).to have_content 'HELPER 1'
  
    visit blackboard_presentation
        
    expect(page).to have_content 'HELPER 1'       

  end  

  it 'should be back on first slide' do
    
    visit teacher_presentation
    
    go_up
    
    expect(page).to have_content 'CODING EXERCISE - 1'
  
    visit blackboard_presentation
        
    expect(page).to have_content 'CODING EXERCISE - 1'       

  end
  
  after(:all) do
    $db.execute_sql("delete from run_events") 
    $db.execute_sql("delete from teacher_current_slide")    
  end   

end

describe 'Blackboard Update', :type => :feature, :js => true do  
	
  before(:each) do
    $db.execute_sql("delete from run_events") 
    $db.execute_sql("delete from teacher_current_slide") 
  end
  
  it 'should display teacher last run' do
    
    visit teacher_presentation; go_down    
    
    visit blackboard_presentation

    expect_IDE_to_be_empty
    
    visit teacher_presentation; go_down
    
    fill_IDE_with("print 'teacher run'")
    
    execute
    
    visit blackboard_presentation

    expect_IDE_to_have(code_input = "print 'teacher run'", code_output = "teacher run")

    expect_AuthorBar_to_have(author = '#', last_send_attendee_name = '')      
    
    visit teacher_presentation; go_down
    
    fill_IDE_with("print 'teacher run 2'")
    
    execute
    
    visit blackboard_presentation

    expect_IDE_to_have(code_input = "print 'teacher run 2'", code_output = "teacher run 2")    
    
    expect_AuthorBar_to_have(author = '#', last_send_attendee_name = '')      
    
  end  

  it 'should NOT display attendee run' do
    
    visit teacher_presentation
    go_down
    
    visit attendee_IDE
    
    expect_IDE_to_be_empty
    
    fill_IDE_with("print 'attendee run'")
    
    execute
    
    expect_IDE_to_have(code_input = "print 'attendee run'", code_output = "attendee run")    
    
    visit blackboard_presentation
    
    expect_IDE_to_be_empty   
  
  end

  it 'should show attendee name of last send' do
    
    visit attendee_IDE
    log_attendee_in("attendee 1")  
    fill_IDE_with('print "attendee send"')
    send_code     
    
    visit teacher_presentation
    go_down    

    visit blackboard_presentation
    
    expect_IDE_to_be_empty
    
    press_space
    
    expect_IDE_to_be_empty
    
    expect_AuthorBar_to_have(author = '#', last_send_attendee_name = 'attendee 1 >>')
    
  end
    
  it 'should NOT display attendee send when teacher does not allow it' do    
    
    visit teacher_presentation; go_down        

    visit attendee_IDE
    
    fill_IDE_with("print 'attendee send'")
    
    send_code
    
    expect_IDE_to_have(code_input = "print 'attendee send'", code_output = "attendee send")   

    visit blackboard_presentation
    
    expect_IDE_to_be_empty 
  
  end

  it 'should display attendee send when teacher allows it with its name' do

    visit attendee_IDE
    log_attendee_in("attendee 1")  
    fill_IDE_with('print "attendee send"')
    send_code 
    
    visit teacher_presentation; go_down    
    
    click_on "get_last_send"
    
    expect_IDE_to_have(code_input = 'print "attendee send"', code_output = "attendee send") 

    expect_AuthorBar_to_have(author = 'attendee 1', last_send_attendee_name = '')

    visit blackboard_presentation

    expect_IDE_to_have(code_input = 'print "attendee send"', code_output = "attendee send")
    
    expect_AuthorBar_to_have(author = 'attendee 1', last_send_attendee_name = '')
    
  end

  # it 'should live refresh IDE with teacher typing' do
    
  #   visit teacher_presentation; go_down    
    
  #   expect_IDE_to_be_empty

  #   fill_IDE_with("typing")

  #   visit blackboard_presentation

  #   expect_IDE_to_have(code_input = 'typing', code_output = "")
    
  # end

  # it 'should keep on executing teacher run after a live refresh' do
    
  #   visit teacher_presentation; go_down    
    
  #   expect_IDE_to_be_empty

  #   fill_IDE_with("print 1")

  #   visit blackboard_presentation

  #   expect_IDE_to_have(code_input = 'print 1', code_output = "")

  #   RunTimeEvent.new('0_#','run', '0', 'print 1', '1').save

  #   press_space

  #   expect_IDE_to_have(code_input = 'print 1', code_output = "1")    
    
  # end  

  after(:each) do
    $db.execute_sql("delete from run_events") 
    $db.execute_sql("delete from teacher_current_slide")    
  end   

end
  
describe 'Blackboard Navigation with code to display', :type => :feature, :js => true do  
	
  before(:all) do
    $db.execute_sql("delete from run_events") 
    $db.execute_sql("delete from teacher_current_slide") 
  end

  it 'should always show last teacher run if present' do
    
    visit teacher_presentation
    go_down
    
    visit blackboard_with_code_to_display
    
    expect_IDE_to_have(code_input = "print 'code to display'", code_output = "code to display")   
    
    visit teacher_presentation
    go_down

    fill_IDE_with("print 'teacher run'")
    
    execute

    expect_IDE_to_have(code_input = "print 'teacher run'", code_output = "teacher run") 
    
    visit blackboard_with_code_to_display
    
    expect_IDE_to_have(code_input = "print 'teacher run'", code_output = "teacher run")   
    
    press_space

    expect_IDE_to_have(code_input = "print 'teacher run'", code_output = "teacher run")   

  end

  after(:all) do
    $db.execute_sql("delete from run_events") 
    $db.execute_sql("delete from teacher_current_slide")    
  end   

end  
