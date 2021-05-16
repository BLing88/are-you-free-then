class TimeInterval < ApplicationRecord
  has_many :free_times
  has_many :users, through: :free_times
  
  validates :start_time, presence: true
  validates :end_time, presence: true
end
