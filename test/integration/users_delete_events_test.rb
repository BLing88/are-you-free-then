require "test_helper"

class UsersDeleteEventsTest < ActionDispatch::IntegrationTest
  def setup
    @alice = users(:alice)
    @bob = users(:bob)
    @alices_event = events(:one)
    @bobs_participation = participations(:one)
    @gregs_participation = participations(:three)
  end
  
  test "only hosts can delete events" do
    log_in_as @bob
    assert_no_difference 'Event.count' do
      delete event_path(@alices_event)
    end
    assert_redirected_to root_url
    follow_redirect!
    assert_select 'p.flash-message', text: /Only hosts can edit events./i

    log_in_as @alice
    assert_difference -> { Event.count } => -1, -> { Participation.count } => -(@alices_event.participants.count) do
      delete event_path(@alices_event)
    end
    assert_redirected_to root_url
    follow_redirect!
    assert_select 'p.flash-message', text: /event successfully deleted/i 
  end

  test "participants can remove themselves from events they've joined" do
    log_in_as @bob
    get event_path(@alices_event)

    assert_select "a", text: /leave/i
    assert @bob.events.include? @alices_event
    assert_difference "Participation.count",  -1 do
      delete participation_path(@bobs_participation)
    end
    assert_not @bob.events.include? @alices_event
  end

  test "participants cannot remove other participants" do
    log_in_as @bob
    assert_no_difference "Participation.count" do
      delete participation_path(@gregs_participation)
    end
  end
end
