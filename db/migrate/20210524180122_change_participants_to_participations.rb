class ChangeParticipantsToParticipations < ActiveRecord::Migration[6.1]
  def change
    rename_table :participants, :participations
  end
end
