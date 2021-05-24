require "test_helper"

class UsersCreateEventsTest < ActionDispatch::IntegrationTest
  def setup
    @alice = users(:alice)
  end

  test 'hosts are added as participants when creating an event' do
    event = Event.create(host: @alice, name: "Alice's event")
    assert event.participants.include?(@alice)
  end
end
