class CreateRelationships < ActiveRecord::Migration[6.1]
  def change
    create_table :relationships do |t|
      t.integer :requester_id
      t.integer :requested_id

      t.timestamps
    end
    add_index :relationships, :requester_id
    add_index :relationships, :requested_id
    add_index :relationships, [:requester_id, :requested_id], unique: true
  end
end
