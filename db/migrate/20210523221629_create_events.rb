class CreateEvents < ActiveRecord::Migration[6.1]
  def change
    create_table :events do |t|
      t.references :host, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end
