class EventInvite < ApplicationRecord
  validate :is_already_participant?
  belongs_to :event
  belongs_to :invitee, class_name: "User"
  validates :status, presence: true
  validates :invitee, uniqueness: { scope: :event }

  private
  
    def is_already_participant?
      if event.participants.include? invitee
        errors.add(:invitee, "Invitee is already a participant.")
      end
    end
end
