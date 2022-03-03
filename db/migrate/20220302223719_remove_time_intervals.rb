class RemoveTimeIntervals < ActiveRecord::Migration[6.1]
  def change
    add_column :free_times, :start_time, :datetime
    add_column :free_times, :end_time, :datetime
    add_column :suggested_event_times, :start_time, :datetime
    add_column :suggested_event_times, :end_time, :datetime

    reversible do |dir|
      dir.up do
        FreeTime.all.each do |free_time|
          interval = free_time.time_interval
          start_time = free_time.start_time 
          end_time = free_time.end_time 
          free_time.update(start_time: start_time,
                           end_time: end_time)
        end
        SuggestedEventTime.all.each do |suggested_event_time|
          interval = suggested_event_time.time_interval
          start_time = suggested_event_time.start_time 
          end_time = suggested_event_time.end_time 
          suggested_event_time.update(start_time: start_time,
                           end_time: end_time)
        end
      end

      dir.down do
        FreeTime.all.each do |free_time|
          start_time = free_time.start_time
          end_time = free_time.end_time
          interval = TimeInterval.create(start_time: start_time, end_time: end_time)
          free_time.update(time_interval: interval)
        end
        SuggestedEventTime.all.each do |suggested_event_time|
          start_time = suggested_event_time.start_time
          end_time = suggested_event_time.end_time
          interval = TimeInterval.create(start_time: start_time, end_time: end_time)
          suggested_event_time.update(time_interval: interval)
        end
      end
    end

    remove_foreign_key "free_times", "time_intervals"
    remove_foreign_key "suggested_event_times", "time_intervals"

    remove_column :free_times, :time_interval_id
    remove_column :suggested_event_times, :time_interval_id

    drop_table :time_intervals do |t|
      t.datetime "start_time"
      t.datetime "end_time"
      t.datetime "created_at", precision: 6, null: false
      t.datetime "updated_at", precision: 6, null: false
      t.index ["start_time", "end_time"], name: "index_time_intervals_on_start_time_and_end_time", unique: true
    end

  end
end
