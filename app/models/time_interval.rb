class TimeInterval < ApplicationRecord
  has_many :free_times
  has_many :users, through: :free_times
  
  validates :start_time, presence: true
  validates :end_time, presence: true, uniqueness: { scope: :start_time }
  validate :start_time_is_before_end_time

  def start_time_is_before_end_time
    errors.add(:start_before_end, "start_time should be before end_time") if !start_time.nil? && !end_time.nil? && start_time > end_time
  end

end
