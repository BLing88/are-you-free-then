require "test_helper"

class ShowEventTest < ActionDispatch::IntegrationTest
  def setup
    @alice = users(:alice)
    @event = events(:one)
    @eve = users(:eve)
  end

  test "only participants can see an event" do
    log_in_as(@alice)
    get event_path(@event)
    assert_response :success
    test_log_out
    log_in_as @eve
    get event_path(@event)
    assert_redirected_to root_url
  end
end
