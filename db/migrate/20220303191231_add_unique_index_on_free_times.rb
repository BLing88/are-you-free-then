class AddUniqueIndexOnFreeTimes < ActiveRecord::Migration[6.1]
  def change
    add_index :free_times, [:start_time, :end_time], unique: true
  end
end
