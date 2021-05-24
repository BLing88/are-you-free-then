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
    assert_select "input[name=?]", 'event[name]'
    assert_select 'label', /name/i
    assert_select "input[name=?]", 'event[host_id]'
  end

  test "blank name shows error" do
    log_in_as @alice
    get new_event_path
    post events_path, params: { event: { name: "" } }
    assert_select 'li', text: /name can't be blank/i
  end
  
  test "successful event creation" do
    log_in_as @alice
    event_name = "Another event"
    assert_difference 'Event.count', 1 do
      post events_path, params: { event: { name: event_name } }
    end
    assert_redirected_to Event.find_by(name: event_name, host: @alice)
  end
end
