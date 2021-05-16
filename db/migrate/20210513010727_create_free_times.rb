class CreateFreeTimes < ActiveRecord::Migration[6.1]
  def change
    create_table :free_times do |t|
      t.references :user, null: false, foreign_key: true
      t.references :time_interval, null: false, foreign_key: true

      t.timestamps
    end
  end
end
