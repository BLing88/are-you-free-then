require "test_helper"

class RelationshipStatusTest < ActiveSupport::TestCase
  def setup
    @status = RelationshipStatus.new(relationship: relationships(:one), name: "Pending")
  end

  test "validates valid relationship status" do
    assert @status.valid?
  end

  test "has a non-nil relationship" do
    @status.relationship = nil
    assert_not @status.valid?    
  end

  test "has a name" do
    @status.name = ''
    assert_not @status.valid?
    @status.name = nil
    assert_not @status.valid?
  end
end
