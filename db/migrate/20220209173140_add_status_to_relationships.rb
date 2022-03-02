class AddStatusToRelationships < ActiveRecord::Migration[6.1]
  def change
    add_column :relationships, :status, :string, default: "Pending"
    reversible do |dir|
      dir.up do
        RelationshipStatus.all.each do |rel_status|
          rel_status.relationship.update_attribute(status: rel_status.name)
        end
      end
      dir.down do
        Relationship.all.each do |rel|
          RelationshipStatus.create(relationship: rel, name: rel.status)
        end
      end
    end

    remove_foreign_key "relationship_statuses", "relationships"
    drop_table :relationship_statuses do |t|
      t.text "name"
      t.bigint "relationship_id", null: false
      t.datetime "created_at", precision: 6, null: false
      t.datetime "updated_at", precision: 6, null: false
      t.index ["relationship_id"], name: "index_relationship_statuses_on_relationship_id"
    end
  end
end
