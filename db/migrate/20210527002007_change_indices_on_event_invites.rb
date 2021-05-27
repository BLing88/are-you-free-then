class ChangeIndicesOnEventInvites < ActiveRecord::Migration[6.1]
  def change
    remove_index :event_invites, name: "index_event_invites_on_status"
    add_index :event_invites, [:event_id, :status]
    add_index :event_invites, [:invitee_id, :status]
    add_index :event_invites, [:event_id, :invitee_id], unique: true
  end
end
