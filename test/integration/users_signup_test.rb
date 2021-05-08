require "test_helper"

class UsersSignupTest < ActionDispatch::IntegrationTest
  test "invalid signup information" do
    get signup_path
    assert_no_difference 'User.count' do
      post users_path, params: { user: { name: "",
                                         email: "invalid@user",
                                         password: "foo",
                                         password_confirmation: "bar"
                                        } }
    end
    assert_select "h1", text: /Sign up/i
    assert_select "div", text: /form contains \d+? errors./i
  end
end
