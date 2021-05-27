class RemoveEventAndUserCountFromTimeIntervals < ActiveRecord::Migration[6.1]
  def change
    remove_column :time_intervals, :user_count
    remove_column :time_intervals, :event_count
  end
end
