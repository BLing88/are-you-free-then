class TimeInterval < ApplicationRecord
  has_many :free_times
  has_many :users, through: :free_times
  
  validates :start_time, presence: true
  validates :end_time, presence: true, uniqueness: { scope: :start_time }
  validate :start_time_is_before_end_time

  validates :user_count, numericality: { only_integer: true, 
                                         greater_than_or_equal_to: 0 }
  validates :event_count, numericality: { only_integer: true, 
                                         greater_than_or_equal_to: 0 }
  validate :user_count_event_count_cannot_both_be_zero

  def user_count_event_count_cannot_both_be_zero
    errors.add(:user_event_counts, "User and event counts can't both be zero") if user_count == 0 && event_count == 0
  end

  def start_time_is_before_end_time
    errors.add(:start_before_end, "start_time should be before end_time") if !start_time.nil? && !end_time.nil? && start_time > end_time
  end

end
