require "test_helper"

class UsersCreateEventsTest < ActionDispatch::IntegrationTest
  def setup
    @alice = users(:alice)
    @alices_event = events(:one)
    @event_time = suggested_event_times(:one)
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
    assert_difference ['Event.count', 'SuggestedEventTime.count'], 1 do
      post events_path, params: { event: { name: event_name, 
                                           host_id: @alice.id
                                            },
                                  create_intervals: ["2022-12-05T12:45:00.000Z_2022-12-05T18:30:00.000Z"]}
    end
    assert_redirected_to Event.find_by(name: event_name, host: @alice)
    follow_redirect!
    assert_select 'h1', text: event_name
    assert_select 'title', text: full_title(event_name)
  end

  test "successful event update" do
    log_in_as @alice
    get event_path(@alices_event)
    assert_select 'h1', text: @alices_event.name
    new_event_name =  "New event name"
    new_start = "2021-05-07T09:00:00.000Z"
    new_end = "2021-05-07T11:00:00.000Z" 
    create_intervals = ["#{new_start}_#{new_end}"]
    delete_intervals = ["#{@event_time.start_time.utc.iso8601.to_s}_#{@event_time.end_time.utc.iso8601.to_s}"]
    patch event_path(@alices_event), params: { event: { name: new_event_name,
                                                        event_id: @alices_event.id,
                                                      },
                                               create_intervals: create_intervals,
                                               delete_intervals: delete_intervals }
    assert_redirected_to(@alices_event.reload)
    follow_redirect!
    assert_select 'h1', text: new_event_name
    assert SuggestedEventTime.exists?(event_id: @alices_event.id, start_time: new_start, end_time: new_end)
  end
end
