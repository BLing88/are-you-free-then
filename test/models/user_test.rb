require "test_helper"

class UserTest < ActiveSupport::TestCase
  def setup
    @user = User.new(name: "Example User",
                     email: "foobar@example.com",
                     password: "foobarpass",
                     password_confirmation: "foobarpass")
  end

  test "user should have a name" do
    assert @user.valid?
    @user.name = "    "
    assert_not @user.valid?
  end

  test "user should have an email" do
    assert @user.valid?
    @user.email = "   " 
    assert_not @user.valid?
  end

  test "user's name should not be too long" do
    assert @user.valid?
    @user.name = "b" * 50
    assert @user.valid?
    @user.name = "b" * 51
    assert_not @user.valid?
  end

  test "user's email should not be too long" do
    assert @user.valid?
    @user.email = "a" * 243 + "@example.com"
    assert @user.valid?
    @user.email = "a" * 244  + "@example.com"
    assert_not @user.valid?
  end

  test "valid emails should pass validation" do
    valid_addresses = %w[user@example.com USER@foo.COM A_US-ER@foo.bar.org
                             first.last@foo.jp alice+bob@baz.cn]
    valid_addresses.each do |valid_address|
      @user.email = valid_address
      assert @user.valid?, "#{valid_address.inspect} should be valid"
    end
  end

  test "invalid emails should be rejected" do
    invalid_addresses = %w[user@example,com user_at_foo.org user.name@example.
                                   foo@bar_baz.com foo@bar+baz.com]
    invalid_addresses.each do |invalid_address|
      @user.email = invalid_address
      assert_not @user.valid?, "#{invalid_address.inspect} should be invalid"
    end
  end

  test "email addresses should be unique" do
    duplicate_user = @user.dup
    @user.save
    assert_not duplicate_user.valid?
  end

  test "email addresses should be saved as lowercase" do
    mixed_case_email = "FooBaR@ExampLe.cOM"
    @user.email = mixed_case_email
    @user.save
    assert_equal mixed_case_email.downcase, @user.reload.email
  end

  test "password should be present (nonblank)" do
    @user.password = @user.password_confirmation = " " * 5
    assert_not @user.valid?
  end

  test "password should have a minimum length" do
    minimum_length = 8
    @user.password = @user.password_confirmation = "a" * (minimum_length - 1)
    assert_not @user.valid?
  end

  test "authenticated? should return false for a user with a nil digest" do
    assert_not @user.authenticated?('')
  end

  test "can befriend another user" do
     first_user = users(:bob)
     second_user = users(:eve)
     assert_not first_user.sent_pending_friends.include?(second_user)

     first_user.send_friend_request(second_user)
     assert first_user.sent_pending_friends.include?(second_user)
     
  end

  test "cannot befriend oneself" do
    assert_not @user.friends.include?(@user)
    @user.send_friend_request(@user)
    assert_not @user.sent_pending_friends.include?(@user)
  end
end
