require "test_helper"

class EventInviteTest < ActiveSupport::TestCase
  def setup
    @invitee = users(:eve)
    @event = events(:one)
    @invitation = EventInvite.new(event: @event, 
                                  invitee: @invitee)
  end

  test "validates event invite" do
    assert @invitation.valid?
  end

  test "default event invite status is Pending" do
    assert @invitation.status = "Pending"
  end

  test "status is not blank" do
    @invitation.status = ''
    assert_not @invitation.valid?
    @invitation.status = nil
    assert_not @invitation.valid? 
  end

  test "only one invite per person per event" do
    dup_invitation = @invitation.dup
    assert dup_invitation.valid?
    @invitation.save
    dup_invitation.save
    assert_not dup_invitation.valid?
  end

  test "can only invite users who aren't already participants" do
    invite = EventInvite.new(event: @event, invitee: users(:bob))
    assert_not invite.valid?
  end
end
