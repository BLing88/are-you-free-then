class ChangeRequesterColumnName < ActiveRecord::Migration[6.1]
  def change
    rename_column :relationships, :requester_id, :requestor_id 
  end
end
