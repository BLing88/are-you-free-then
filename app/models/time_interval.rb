class TimeInterval < ApplicationRecord
  has_many :free_times
  has_many :users, through: :free_times
  
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :user_count, numericality: { only_integer: true, 
                                         greater_than_or_equal_to: 0 }
  validates :event_count, numericality: { only_integer: true, 
                                         greater_than_or_equal_to: 0 }
  validate :user_count_event_count_cannot_both_be_zero

  def user_count_event_count_cannot_both_be_zero
    errors.add(:user_event_counts, "User and event counts can't both be zero") if user_count == 0 && event_count == 0
  end


end
