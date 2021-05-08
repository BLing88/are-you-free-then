require "test_helper"

class UsersLoginTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:alice)
  end

  test "login path" do
    get login_path
    assert_select "h1", /log in/i
    assert_select "label", /email/i
    assert_select "input[id=?]", "session_email"
    assert_select "label", /password/i
    assert_select "input[id=?]", "session_password"
    assert_select "a[href=?]", signup_url
  end

  test "log in with invalid information" do
    get login_path
    assert_not is_logged_in?
    post login_path, params: { session: { email: "",
                                          password: "" } }
    assert_not is_logged_in?
    assert_select "h1", /log in/i
    assert_not flash.empty?
    get root_path
    assert flash.empty?
  end

  test "log in with valid information" do
    get login_path
    assert_not is_logged_in?
    post login_path, params: { session: { email: @user.email,
                                          password: 'example_password' } } 
    assert is_logged_in?
    assert_redirected_to @user
    follow_redirect!
    assert_select "a[href=?]", login_path, count: 0
    assert_select "a[href=?]", logout_path
    assert_select "a[href=?]", user_path(@user)
    delete logout_path
    assert_not is_logged_in?
    assert_redirected_to root_url
    follow_redirect!
    assert_select "a[href=?]", login_path
    assert_select "a[href=?]", logout_path, count: 0
    assert_select "a[href=?]", user_path(@user), count: 0
  end

  test "log in with valid email/invalid password" do
    get login_path
    assert_not is_logged_in?
    post login_path, params: { session: { email: @user.email,
                                          password: "invalid" } }
    assert_not is_logged_in?
    assert_select 'h1', /log in/i
    assert_not flash.empty?
    get root_path
    assert flash.empty?
  end
end
