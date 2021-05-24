require "test_helper"

class EventTest < ActiveSupport::TestCase
  def setup
    @event = Event.new(name: "Test Event", host: users(:alice))
  end

  test "validates events" do
    assert @event.valid?
  end

  test "events have non-blank names" do
    @event.name = ''
    assert_not @event.valid?
    @event.name = nil
    assert_not @event.valid?
  end

  test "events have hosts" do
    @event.host = nil
    assert_not @event.valid? 
  end
end
