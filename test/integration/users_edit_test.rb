require "test_helper"

class UsersEditTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:alice)
  end

  test 'unsuccessful edit' do
    get edit_user_path(@user)
    assert_select 'h1', /update your profile/i
    patch user_path(@user), params: { user: { name: "",
                                             email: "invalid@address",
                                             password: 'foo',
                                             password_confirmation: 'bar' } }
    assert_select 'h1', /update your profile/i
    assert_select 'div', /form contains 4 errors/i
  end
end
