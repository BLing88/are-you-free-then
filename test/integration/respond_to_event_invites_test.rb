require "test_helper"

class RespondToEventInvitesTest < ActionDispatch::IntegrationTest
#  def setup
#    @alice = users(:alice)
#    @bob = users(:bob)
#    @invite_to_alice = event_invites(:one)
#    @event = @invite_to_alice.event
#    @user_with_no_invites = users(:greg)
#  end
#
#  test "must be logged in to view event invites" do
#    get invites_user_path(@alice)
#    assert_redirected_to login_url
#  end
#
#  test "only view your own invitations" do
#    log_in_as @bob
#    get invites_user_path(@alice)
#    assert_redirected_to root_url
#    test_log_out
#    log_in_as @alice
#    get invites_user_path(@alice)
#    assert_response :success 
#  end
#
#  test "invitation page" do
#    log_in_as @alice
#    get invites_user_path(@alice)
#    assert_select 'h1', /your event invitations/i
#    @alice.event_invites.each do |invite|
#      assert_select 'li.event-invite', text: Regexp.new(invite.event.name)
#      assert_select 'li.event-invite', text: Regexp.new(invite.event.host.name)
#      assert_select 'form[action=?]', participations_path
#      assert_select 'input[value=?]', invite.event.id.to_s
#      assert_select 'input[value=?]', invite.invitee.id.to_s
#      assert_select 'input[type=submit]', value: /accept/i
#      assert_select 'a[href=?]', event_invite_path(invite.id), text: /delete/i
#    end
#  end
#
#  test "no invites message" do
#    log_in_as @user_with_no_invites
#
#    get invites_user_path(@user_with_no_invites)
#    assert_select 'p', /you currently have no invitations/i
#  end
#
#  test 'must be logged in as correct user to accept an event invite' do
#    assert_no_difference 'Participation.count' do
#    post participations_path, params: { event_id: @invite_to_alice.event.id, 
#                                        user_id: @alice.id }
#
#    end
#    assert_redirected_to login_url
#
#    log_in_as @bob
#    assert_no_difference 'Participation.count' do
#    post participations_path, params: { event_id: @invite_to_alice.event.id, 
#                                        user_id: @alice.id }
#    end
#    assert_redirected_to root_url
#  end
#
#  test 'can accept an event invite' do
#    log_in_as @alice
#    assert_difference  'Participation.count' => 1, 'EventInvite.count' => -1  do
#      post participations_path, params: { event_id: @invite_to_alice.event.id, 
#                                          user_id: @alice.id }
#    end
#    assert_redirected_to @event
#  end
#
#  test "must be logged in as correct user to delete an event invite"do
#    delete event_invite_path(@invite_to_alice)
#    assert_redirected_to login_path
#
#    log_in_as @bob
#    delete event_invite_path(@invite_to_alice)
#    assert_redirected_to root_url
#  end
#
#  test "can delete event invites" do
#    log_in_as @alice
#    assert_difference 'EventInvite.count', -1 do
#      delete event_invite_path(@invite_to_alice)
#    end
#    assert_not flash.empty?
#    assert_not @alice.event_invites.include? @invite_to_alice
#    assert_redirected_to invites_user_path(@alice)
#  end
end
