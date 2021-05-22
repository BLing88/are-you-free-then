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

  test 'creates a pending RelationshipStatus after creating a new Relationship' do
    rel = Relationship.new(requestor: users(:bob), requested: users(:eve))
    assert_difference ['Relationship.count', 'RelationshipStatus.count'], 1 do
        rel.save
      end
    assert_equal 'Pending', rel.relationship_status.name
  end

  test 'requestor cannot be same as requested user' do
    rel = Relationship.new requestor: @user, requested: @user
    assert_not rel.valid?
    assert_equal 1, rel.errors.full_messages.count
  end

  test 'deleting a relationship deletes associated relationship status' do
    rel = @user.relationships.first
    status = rel.relationship_status
    assert_not_nil RelationshipStatus.find(status.id)
    rel.destroy
    assert_nil RelationshipStatus.find_by(id: status.id)
  end
end
