class ChangeFreeTimesOnStartAndEndTimesIndex < ActiveRecord::Migration[6.1]
  def change
    remove_index :free_times, column: [:start_time, :end_time], name:  "index_free_times_on_start_time_and_end_time", if_not_exists: true
    add_index :free_times, [:user_id, :start_time, :end_time], if_not_exists: true, unique: true
  end
end
