require "active_support/concern"

module Timeable
  extend ActiveSupport::Concern

  def start_time_is_before_end_time
    errors.add(:start_before_end, "start_time should be before end_time") if !start_time.nil? && !end_time.nil? && start_time > end_time
  end

  module ClassMethods
    def create_intervals(intervals, owner_id_name, owner_id) 
      if !intervals.nil?
        intervals.each do |interval|
          start_time, end_time = start_and_end_times(interval)
          if (!self.exists?(owner_id_name => owner_id, 
              start_time: start_time,
              end_time: end_time))
            self.create!(owner_id_name => owner_id,
                         start_time: start_time,
                         end_time: end_time)
          end
        end
      end
    end

    def delete_intervals(intervals, owner_id_name, owner_id)
      if !intervals.nil?
        intervals.each do |interval|
          start_time, end_time = start_and_end_times(interval)

          self.find_by(owner_id_name => owner_id, 
                       start_time: start_time, 
                       end_time: end_time).destroy
        end
      end
    end

    def update_intervals(intervals_to_create, intervals_to_delete, owner_id_name, owner_id) 
      self.transaction do
        create_intervals(intervals_to_create, owner_id_name, owner_id) 
        delete_intervals(intervals_to_delete, owner_id_name, owner_id) 
      end
    end

    def start_and_end_times(str)
      str.split("_")
    end
  end
end
