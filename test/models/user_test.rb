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
end
