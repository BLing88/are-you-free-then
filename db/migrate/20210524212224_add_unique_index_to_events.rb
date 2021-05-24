class AddUniqueIndexToEvents < ActiveRecord::Migration[6.1]
  def change
    add_index :events, [:host_id, :name], unique: true
  end
end
