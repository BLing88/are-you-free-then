class AddRelationshipStatusToRelationships < ActiveRecord::Migration[6.1]
  def change
    add_reference :relationships, :relationship_status, null: false, foreign_key: true
  end
end
