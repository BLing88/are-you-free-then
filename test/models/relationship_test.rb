require "test_helper"

class RelationshipTest < ActiveSupport::TestCase
  def setup
    @user = users(:alice)
  end

  test 'requestor and requested are required' do
    rel = Relationship.new(requestor_id: nil, requested_id: nil)
    assert_not rel.valid?
    assert_equal 2, rel.errors.full_messages.count
  end

  test 'requestor cannot be same as requested user' do
    rel = Relationship.new requestor: @user, requested: @user
    assert_not rel.valid?
    assert_equal 1, rel.errors.full_messages.count
  end
end
