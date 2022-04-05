require "test_helper"

class FindEventsTest < ActionDispatch::IntegrationTest
#  def setup
#    @event = events(:one)
#    @alice = users(:alice)
#    @eve = users(:eve)
#  end
#
#  test "must be logged in to find event with event code" do
#    assert_no_difference "Participation.count" do
#      post participations_path, params: { event_id: @event.id }
#    end
#    assert_redirected_to login_url
#  end
#
#  test "can become event participant with event code" do
#    log_in_as @eve
#    assert_not @event.participants.include? @eve
#    assert_difference 'Participation.count', 1 do
#      post participations_path, params: { event_code: @event.event_code }
#    end
#    assert @event.participants.include? @eve
#    assert_redirected_to event_path(@event)
#  end
end
