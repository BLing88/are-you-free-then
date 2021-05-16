class ChangeEventCountAndUserCountDefaultsOnTimeIntervals < ActiveRecord::Migration[6.1]
  def change
    change_column_default :time_intervals, :event_count, from: 1, to: 0
    change_column_default :time_intervals, :user_count, from: 1, to: 0
  end
end
