require "test_helper"

class UsersLoginTest < ActionDispatch::IntegrationTest
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
    post login_path, params: { session: { email: "",
                                          password: "" } }
    assert_select "h1", /log in/i
    assert_not flash.empty?
    get root_path
    assert flash.empty?
  end
end
