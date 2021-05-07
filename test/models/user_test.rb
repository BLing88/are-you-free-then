require "test_helper"

class UserTest < ActiveSupport::TestCase
  def setup
    @user = User.new(name: "Example User", email: "foobar@example.com")
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
end
