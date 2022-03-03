require "active_support/concern"

module Timeable
  def start_time_is_before_end_time
    errors.add(:start_before_end, "start_time should be before end_time") if !start_time.nil? && !end_time.nil? && start_time > end_time
  end
end
