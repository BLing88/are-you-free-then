require "test_helper"

class UsersEditTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:alice)
  end

  test 'unsuccessful edit' do
    log_in_as(@user)
    get edit_user_path(@user)
    assert_select 'h1', /update your profile/i
    patch user_path(@user), params: { user: { name: "",
                                             email: "invalid@address",
                                             password: 'foo',
                                             password_confirmation: 'bar' } }
    assert_select 'h1', /update your profile/i
    assert_select 'div', /form contains 4 errors/i
  end

  test "successful edit including password" do
    log_in_as(@user)
    get edit_user_path(@user)
    assert_select 'h1', /update your profile/i
    name = "Foo Bar"
    email = "alice@foo.com"
    password = "new_password"
    patch user_path(@user), params: { user: { name: name,
                                              email: email,
                                              password: password,
                                              password_confirmation: password } }
    assert_not flash.empty?
    assert_redirected_to @user
    follow_redirect!
    assert_select 'div', /profile updated successfully/i
    @user.reload
    assert_equal name, @user.name
    assert_equal email, @user.email
    assert BCrypt::Password.new(@user.password_digest).is_password?(password)
  end
  
  test "successful edit without password with friendly forwarding" do
    get edit_user_path(@user)
    log_in_as(@user)
    assert_redirected_to edit_user_url(@user)
    follow_redirect!
    assert_select 'h1', /update your profile/i
    name = "Dog Cat"
    email = "bob@foo.com"
    patch user_path(@user), params: { user: { name: name,
                                              email: email,
                                              password: "",
                                              password_confirmation: "" } }
    assert_not flash.empty?
    assert_redirected_to @user
    follow_redirect!
    assert_select 'div', /profile updated successfully/i
    @user.reload
    assert_equal name, @user.name
    assert_equal email, @user.email
    # Check that forwarding url is reset 
    delete logout_path
    get login_path
    log_in_as(@user)
    assert_redirected_to @user
  end
end
