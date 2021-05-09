require "test_helper"

class UsersEditTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:alice)
    @other_user = users(:bob)
  end

  test 'should redirect edit when not logged in' do
    get edit_user_path(@user)
    assert_not flash.empty?
    assert_redirected_to login_url
  end

  test 'should redirect update when not logged in' do
    patch user_path(@user), params: { user: { name: @user.name,
                                              email: @user.email } }
    assert_not flash.empty?
    assert_redirected_to login_url
  end

  test 'should redirect edit when logged in as wrong user' do
    log_in_as(@other_user)
    get edit_user_path @user
    assert flash.empty?
    assert_redirected_to root_url
  end

  test 'should redirect update when logged in as wrong user' do
    log_in_as(@other_user)
    patch user_path(@user), params: { user: { name: @user.name,
                                              email: @user.email } }
    assert flash.empty?
    assert_redirected_to root_url
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
  
  test "successful edit without password" do
    log_in_as(@user)
    get edit_user_path(@user)
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
  end
end
