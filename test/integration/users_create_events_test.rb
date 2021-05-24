require "test_helper"

class UsersCreateEventsTest < ActionDispatch::IntegrationTest
  def setup
    @alice = users(:alice)
  end

  test "redirect create event page if not logged in" do
    get new_event_path
    assert_redirected_to login_url
    assert_equal 1, flash.count
    log_in_as @alice
    assert_redirected_to new_event_path
  end

  test "create event page" do
    log_in_as @alice
    get new_event_path
    assert_select "title", text: /Create event/i
    assert_select "h1", text: /create a new event/i
  end
end
