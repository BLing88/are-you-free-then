class CreateSuggestedEventTimes < ActiveRecord::Migration[6.1]
  def change
    create_table :suggested_event_times do |t|
      t.references :event, null: false, foreign_key: true
      t.references :time_interval, null: false, foreign_key: true

      t.timestamps
    end
  end
end
