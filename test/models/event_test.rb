require "test_helper"

class EventTest < ActiveSupport::TestCase
  def setup
    @event = Event.new(host: users(:alice))
  end

  test "validates events" do
    assert @event.valid?
  end

  test "events have hosts" do
    @event.host = nil
    assert_not @event.valid? 
  end
end
