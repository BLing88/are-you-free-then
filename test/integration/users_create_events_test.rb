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
    assert_select 'label', /Event name/i
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
      post events_path, params: { event: { name: event_name, 
                                           host_id: @alice.id,
                                           create_intervals: ["2022-12-05T12:00:00.000Z_2022-12-05T18:30:00.000Z"] } }
    end
    assert_redirected_to Event.find_by(name: event_name, host: @alice)
    follow_redirect!
    assert_select 'h1', text: event_name
    assert_select 'title', text: full_title(event_name)
  end
end
