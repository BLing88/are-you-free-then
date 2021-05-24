require "test_helper"

class ParticipationTest < ActiveSupport::TestCase
  def setup
    @participation = participations(:one)
  end

  test "participations have a user" do
    assert @participation.valid?
    @participation.user = nil
    assert_not @participation.valid?
  end

  test "participations have an event" do
    assert @participation.valid?
    @participation.event = nil
    assert_not @participation.valid?
  end

  test 'participations are unique' do
    dup_participation = @participation.dup
    dup_participation.save
    assert_not dup_participation.valid?
  end
end
