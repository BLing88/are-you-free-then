class RemoveRelationshipStatusFromRelationships < ActiveRecord::Migration[6.1]
  def change
    remove_reference :relationships, :relationship_status
  end
end
