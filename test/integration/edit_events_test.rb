require "test_helper"

class EditEventsTest < ActionDispatch::IntegrationTest
  def setup
    @event = events(:one)
    @alice = users(:alice)
    @bob = users(:bob)
  end

  test "must be logged in to edit" do
    get edit_event_path(@event)
    assert_redirected_to login_url
    assert_not flash.empty?
  end

  test "only hosts can edit events" do
    log_in_as @bob
    get edit_event_path(@event)
    assert_redirected_to root_url
    assert_not flash.empty?
  end

  test "successful update" do
    log_in_as @alice
    new_name = "New event name"
    patch event_path(@event), params: { event: { name: new_name, event_id: @event.id } }
    follow_redirect!
    assert @event.reload.name = new_name
    assert_not flash.empty?
    end
end
