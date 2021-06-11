require "test_helper"

class EventTest < ActiveSupport::TestCase
  def setup
    @alice = users(:alice) 
    @event = Event.create(name: "Test Event", host: @alice)
    @bob = users(:bob)
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

  test "event names are unique for a given host" do
    dup_event = @event.dup
    assert_not dup_event.valid?
    bobs_event = Event.new(host: @bob, name: @event.name)
    assert bobs_event.valid?
  end

  test 'hosts are added as participants when creating an event' do
    event = Event.create(host: @alice, name: "Alice's event")
    assert event.participants.include?(@alice)
  end

  test "events have nonblank, unique event codes" do
    assert @event.valid?
    other_event = Event.new host: @bob, name: "asfkjoa", event_code: @event.event_code

    @event.event_code = ""
    @event.valid?
    assert @event.event_code != ""

    @event.event_code = nil
    @event.valid?
    assert @event.event_code != nil

    assert @event.valid?
    assert_not other_event.valid?

    other_event.event_code = SecureRandom.urlsafe_base64 
    assert other_event.valid?
  end
end
