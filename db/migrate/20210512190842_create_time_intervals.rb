class CreateTimeIntervals < ActiveRecord::Migration[6.1]
  def change
    create_table :time_intervals do |t|
      t.datetime :start_time
      t.datetime :end_time
      t.integer :user_count
      t.integer :event_count

      t.timestamps
    end
    add_index :time_intervals, [:start_time, :end_time], unique: true
  end
end
