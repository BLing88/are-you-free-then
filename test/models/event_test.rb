require "test_helper"

class EventTest < ActiveSupport::TestCase
  def setup
    @alice = users(:alice) 
    @event = Event.new(name: "Test Event", host: @alice)
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

  test "event names can't be too long" do
    @event.name = "a" * 51
    assert_not @event.valid?
  end

  test "events have hosts" do
    @event.host = nil
    assert_not @event.valid? 
  end

  test 'hosts are added as participants when creating an event' do
    event = Event.create(host: @alice, name: "Alice's event")
    assert event.participants.include?(@alice)
  end
end
