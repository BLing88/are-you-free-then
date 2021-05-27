class EventInvite < ApplicationRecord
  belongs_to :event
  belongs_to :invitee, class_name: "User"
end
