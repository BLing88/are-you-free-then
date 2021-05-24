require "test_helper"

class ParticipationTest < ActiveSupport::TestCase
  def setup
    @participation = participations(:one)
  end

  test 'participations are unique' do
    dup_participation = @participation.dup
    dup_participation.save
    assert_not dup_participation.valid?
  end
end
