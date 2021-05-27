class Event < ApplicationRecord
  after_create :add_host_as_participant
  belongs_to :host, class_name: :User
  has_many :participations, dependent: :destroy
  has_many :participants, through: :participations, source: :user
  has_many :suggested_event_times, dependent: :destroy
  has_many :suggested_times, through: :suggested_event_times, source: :time_interval
  has_many :event_invites, dependent: :destroy
  has_many :invitees, through: :event_invites

  validates :name, presence: true, length: { maximum: 50 }, 
            uniqueness: { scope: :host } 


  private
    
    def add_host_as_participant
      Participation.create(user: self.host, event: self)
    end
end
