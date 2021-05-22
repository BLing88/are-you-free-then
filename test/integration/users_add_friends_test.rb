require "test_helper"

class UsersAddFriendsTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:alice)
    @other_user = users(:bob)
  end

  test "redirect to login if not logged in viewing friends" do
    get friends_user_path(@user)
    assert_redirected_to login_path
    log_in_as(@other_user)
    get friends_user_path(@user)
    assert_redirected_to root_url
  end

  test "can see one's friends when logged in" do
    log_in_as(@user)
    get friends_user_path(@user)
    assert_select 'div', text: /your friends/i
    @user.friends.each do |friend|
      assert_select 'li', text: Regexp.new("#{friend.name}")
    end
  end

  test "can befriend another user only when logged in" do
  end

  test "cannot befriend oneself" do
  end
end
