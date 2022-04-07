require "test_helper"

class EditEventsTest < ActionDispatch::IntegrationTest
  def setup
    @event = events(:one)
    @alice = users(:alice)
    @bob = users(:bob)
    @bobs_participation = participations(:one)
    @greg = users(:greg)
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
    log_in_as @bob
    new_event_name = "New event name"
    patch event_path(@event), params: { event: { name: new_event_name, event_id: @event.id } }
    assert_redirected_to root_url
    assert_not @event.reload.name == new_event_name 
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

  test "can add participants" do
    log_in_as @alice
    get event_path(@event)
    # assert_select "a[href=?]", invite_event_path(@event)
    get invite_event_path(@event)
    @alice.friends.each do |friend|
      assert_select "input[type='checkbox']", value: friend.id
      assert_select "label", text: friend.name
    end
  end

  test "can delete participants as host" do
    log_in_as @alice
    assert @event.participants.include?(@bob) 
    assert_difference 'Participation.count', -1 do
      delete participation_path(@bobs_participation)
    end
    assert_not @event.participants.include?(@bob) 
  end

  test "cannot delete participants if not host" do
    log_in_as @greg
    assert_no_difference 'Participation.count' do
      delete participation_path(@bobs_participation)
    end
    assert @event.participants.include?(@bob) 
    assert_redirected_to root_url
  end

  test "host can only delete themself as participant by deleting event" do
  end
  
  test "can uninvite participants" do
  end
end
