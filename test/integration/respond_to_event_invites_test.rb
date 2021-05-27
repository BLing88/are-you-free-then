require "test_helper"

class RespondToEventInvitesTest < ActionDispatch::IntegrationTest
  def setup
    @alice = users(:alice)
    @event = events(:one)
    @bob = users(:bob)
    @invite_to_alice = event_invites(:one)
  end

  test "must be logged in to view event invites" do
    get invites_user_path(@alice)
    assert_redirected_to login_url
  end

  test "only view your own invitations" do
    log_in_as @bob
    get invites_user_path(@alice)
    assert_redirected_to root_url
    test_log_out
    log_in_as @alice
    get invites_user_path(@alice)
    assert_response :success 
  end

  test "invitation page" do
    log_in_as @alice
    get invites_user_path(@alice)
    assert_select 'h1', /your event invitations/i
    @alice.event_invites.each do |invite|
      assert_select 'li.event-invite', text: Regexp.new(invite.event.name)
      assert_select 'li.event-invite', text: Regexp.new(invite.event.host.name)
      assert_select 'a[href=?]', participations_path(event: invite.event.id, user: invite.invitee.id), text: /accept/i
      assert_select 'a[href=?]', event_invite_path(invite.id), text: /delete/i
    end
  end

  test "must be logged in as correct user to delete an event invite"do
    delete event_invite_path(@invite_to_alice)
    assert_redirected_to login_path

    log_in_as @bob
    delete event_invite_path(@invite_to_alice)
    assert_redirected_to root_url
  end

  test "can delete event invites" do
    log_in_as @alice
    assert_difference 'EventInvite.count', -1 do
      delete event_invite_path(@invite_to_alice)
    end
    assert_not flash.empty?
    assert_not @alice.event_invites.include? @invite_to_alice
    assert_redirected_to invites_user_path(@alice)
  end
end
