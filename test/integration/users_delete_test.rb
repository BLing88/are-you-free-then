require "test_helper"

class UsersDeleteTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:alice)
    @other_user = users(:bob)
  end

  test 'delete own account' do
    get login_path
    log_in_as(@user)
    get edit_user_path(@user)
    assert_select 'a[href=?]', user_path(@user), text: /delete account/i
    assert_difference 'User.count', -1 do
      delete user_path(@user)
    end
    assert_not is_logged_in?
    assert cookies[:user_id].blank?
    assert cookies[:remember_token].blank?
    assert_redirected_to root_url
    assert_not flash.empty?
    assert_nil User.find_by(id: @user.id)
  end
end
