require "test_helper"

class UsersSignupTest < ActionDispatch::IntegrationTest
  test "invalid signup information" do
    get signup_path
    assert_no_difference 'User.count' do
      post signup_path, params: { user: { name: "",
                                         email: "invalid@user",
                                         password: "foo",
                                         password_confirmation: "bar"
                                        } }
    end
    assert_select "h1", text: /Sign up/i
    assert_select "div", text: /form contains \d+? errors./i
  end

  test "valid signup information" do
    get signup_path
    assert flash.empty?
    name = "Example User"
    assert_difference 'User.count', 1 do
      post signup_path, params: { user: { name: name,
                                          email: "user@example.com",
                                          password: "user_password",
                                          password_confirmation: "user_password" } }
    end
    follow_redirect!
    assert is_logged_in?
    assert_select 'div', text: /#{name}/i
    assert_not flash.empty?
  end
end
