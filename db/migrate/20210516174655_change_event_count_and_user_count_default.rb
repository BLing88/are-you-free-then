class ChangeEventCountAndUserCountDefault < ActiveRecord::Migration[6.1]
  def change
    change_column_default :time_intervals, :event_count, 1
    change_column_default :time_intervals, :user_count, 1
  end
end
