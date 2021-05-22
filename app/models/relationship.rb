class RequestorRequestedNotSameValidator < ActiveModel::Validator
  def validate(relationship)
    unless relationship.requestor != relationship.requested || relationship.requestor == nil && relationship.requested == nil
      relationship.errors.add :users, "Requested user cannot be the same as the requesting user."
    end
  end
end

class Relationship < ApplicationRecord
  after_create :create_pending_status
  has_one :relationship_status, dependent: :destroy
  belongs_to :requestor, class_name: "User"
  belongs_to :requested, class_name: "User"
  validates_with RequestorRequestedNotSameValidator

  private 
    
    def create_pending_status
      RelationshipStatus.create(relationship: self, name: "Pending")
    end
end
