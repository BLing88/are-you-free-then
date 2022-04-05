require "test_helper"

class UsersJoinEventsTest < ActionDispatch::IntegrationTest
  def setup
    @alice = users(:alice)
    @alices_event = events(:one)
    @bob = users(:bob)
    @nonparticipant = users(:nonparticipant)
    @event_to_join = events(:two)
  end

  test "join event flow" do
    # click on join-event link initially not logged in
    get join_event_path(@event_to_join)
    assert_redirected_to login_url
    follow_redirect!

    log_in_as @alice
    assert_redirected_to join_event_path(@event_to_join)
    follow_redirect!
    assert_select 'p', text: /join #{@event_to_join.host.name}’s event #{@event_to_join.name}/i
    assert_select 'input[type="hidden"]', value: @event_to_join.id
    assert_select 'input[type="submit"]', value: /confirm/i

    # click confirm
    assert_not @event_to_join.participants.include?(@alice)
    assert_difference 'Participation.count', 1 do
      post participations_path, params: { participation: { event_id: @event_to_join.id } }
    end
    assert @event_to_join.participants.include?(@alice)
  end

  test "can only add join event as yourself" do
    log_in_as @alice
    assert_not Participation.exists?(event_id: @event_to_join.id, user_id: @alice.id)
    assert_not Participation.exists?(user_id: @nonparticipant.id) 
    post participations_path, params: { participation: { event_id: @event_to_join.id, user_id: @nonparticipant.id } }
    assert Participation.exists?(event_id: @event_to_join.id, user_id: @alice.id)
    assert_not Participation.exists?(user_id: @nonparticipant.id) 
  end

  test "host clicking join event link" do
    log_in_as @alice
    assert_no_difference 'Participation.count' do
      get join_event_path(@alices_event)
    end
    assert_redirected_to @alices_event
  end

  test "someone who's already a participant clicking join event link" do
    log_in_as @bob
    assert @alices_event.participants.include? @bob
    assert_no_difference 'Participation.count' do
      get join_event_path(@alices_event)
    end
    assert_redirected_to @alices_event
  end

  test "event not found" do
    log_in_as @alice
    get join_event_path(id: -1)
    assert_select 'p', text: /event not found/i
  end
end
