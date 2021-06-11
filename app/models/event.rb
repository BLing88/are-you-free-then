class Event < ApplicationRecord
  before_validation :add_event_code
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

  validates :event_code, presence: true, uniqueness: true


  private
    
    def add_host_as_participant
      Participation.create(user: self.host, event: self)
    end

    def add_event_code
      if self.event_code.blank? 
        code = SecureRandom.urlsafe_base64
        while Event.exists?(event_code: code)
          code = SecureRandom.urlsafe_base64
        end
        self.event_code = code
      end
    end
end
