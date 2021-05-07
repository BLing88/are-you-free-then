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
end
