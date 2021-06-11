class AddEventCodeToEvent < ActiveRecord::Migration[6.1]
  def change
    add_column :events, :event_code, :string
    add_index :events, :event_code, unique: true
  end
end
