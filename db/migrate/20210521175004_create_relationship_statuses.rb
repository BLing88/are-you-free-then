class CreateRelationshipStatuses < ActiveRecord::Migration[6.1]
  def change
    create_table :relationship_statuses do |t|
      t.text :name
      t.references :relationship, null: false, foreign_key: true, unique: true

      t.timestamps
    end
  end
end
