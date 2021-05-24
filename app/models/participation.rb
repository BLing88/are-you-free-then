class Participation < ApplicationRecord
  belongs_to :event
  belongs_to :user

  validates :event, uniqueness: { scope: :user }
end
