class Event < ApplicationRecord
  after_create :add_host_as_participant
  belongs_to :host, class_name: :User
  has_many :participations, dependent: :destroy
  has_many :participants, through: :participations, source: :user

  validates :name, presence: true, length: { maximum: 50 }


  private
    
    def add_host_as_participant
      Participation.create(user: self.host, event: self)
    end
end
