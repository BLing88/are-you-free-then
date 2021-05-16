class ChangeUserCountAndEventCountDefaultsOnTimeInterval < ActiveRecord::Migration[6.1]
  def change
    change_column_default :time_intervals, :user_count, 0
    change_column_default :time_intervals, :event_count, 0
  end
end
