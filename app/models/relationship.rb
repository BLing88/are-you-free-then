class Relationship < ApplicationRecord
  after_create :create_pending_status
  has_one :relationship_status, dependent: :destroy
  belongs_to :requestor, class_name: "User"
  belongs_to :requested, class_name: "User"

  private 
    
    def create_pending_status
      RelationshipStatus.create(relationship: self, name: "Pending")
    end
end
