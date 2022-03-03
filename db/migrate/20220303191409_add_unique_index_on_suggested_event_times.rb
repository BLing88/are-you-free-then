class AddUniqueIndexOnSuggestedEventTimes < ActiveRecord::Migration[6.1]
  def change
    add_index :suggested_event_times, [:start_time, :end_time], unique: true
  end
end
