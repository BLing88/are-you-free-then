class FreeTime < ApplicationRecord
  belongs_to :user
  validates :start_time, presence: true
  validates :end_time, presence: true, uniqueness: { scope: :start_time }
  include Timeable
  validate :start_time_is_before_end_time
  
end
