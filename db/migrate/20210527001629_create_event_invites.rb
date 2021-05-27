class CreateEventInvites < ActiveRecord::Migration[6.1]
  def change
    create_table :event_invites do |t|
      t.references :event, null: false, foreign_key: true
      t.references :invitee, null: false, foreign_key: { to_table: :users } 
      t.text :status, default: "Pending"

      t.timestamps
    end
    add_index :event_invites, :status
  end
end
