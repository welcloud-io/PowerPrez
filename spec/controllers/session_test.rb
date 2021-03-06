require_relative "../../controllers/slideshow"

require 'test/unit'
require 'rack/test'

disable :sessions # Mandatory to test sessions, otherwise we cannot access session object

class TestSlideShowHelper_next_user_id < Test::Unit::TestCase

  def test01 
    $db.execute_sql("update sessions set last_session_id = 0")
    assert_equal '1', next_session_id
  end

end

class TestSession < Test::Unit::TestCase
  
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end
  
  def setup
    $db.execute_sql("update sessions set last_session_id = 0")
  end  
  
  def test01_should_create_one_user_id

    session = {}
    
    get '/', {}, 'rack.session' => session
    assert_equal '1', session[:user_session_id]
    
  end
  
  def test01_should_not_create_another_user_id_when_one_exists

    session = {}
    
    get '/', {}, 'rack.session' => session
    assert_equal '1', session[:user_session_id]
    
    get '/', {}, 'rack.session' => session
    assert_equal '1', session[:user_session_id]    
    
  end  
  
  def test02_should_create_two_user_id

    session = {}
    
    get '/', {}, 'rack.session' => session
    assert_equal '1', session[:user_session_id]
    
    session = {}    
    
    get '/', {}, 'rack.session' => session
    assert_equal '2', session[:user_session_id]    
    
  end  
  
  def test03_should_always_return_0_for_teacher_session_id
    
    session = {}
    
    get '/teacher-x1973', {}, 'rack.session' => session
    assert_equal $teacher_session_id, session[:user_session_id]    
    
  end
  
  def teardown
    $db.execute_sql("update sessions set last_session_id = 0") 
  end  
  
end


class TestAttendee_name < Test::Unit::TestCase
  
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end
  
  def setup
    $db.execute_sql("update sessions set last_session_id = 0")
  end  
  
  def test01_should_create_a_session_id_with_a_user_name

    session = {}
    
    get '/', {}, 'rack.session' => session
    assert_equal '1', session[:user_session_id]
    
    get '/session_id', {}, 'rack.session' => session
    assert_equal '1', last_response.body  
    
    post '/session_id/user_name', {:user_name => 'a name'}, 'rack.session' => session
    
    get '/', {}, 'rack.session' => session
    assert_equal '1_a name', session[:user_session_id]
    
    get '/session_id', {}, 'rack.session' => session
    assert_equal '1_a name', last_response.body
    
    get '/session_id/user_name', {}, 'rack.session' => session
    assert_equal 'a name', last_response.body    
    
  end

  def test02_should_not_raise_error_when_session_name_is_empty

    session = {}

    get '/session_id/user_name', {}, 'rack.session' => session
    assert_equal '', last_response.body

  end
  
  def teardown
    $db.execute_sql("update sessions set last_session_id = 0") 
  end  
  
end