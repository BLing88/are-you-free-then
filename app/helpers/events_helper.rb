require 'time'
module EventsHelper
  # Takes a ISO 8601 formatted string and returns 
  def days_from_intervals(time_intervals)
    map = {}
    days = []
    time_intervals.each do |interval|
      start_time = interval.start_time # Time.iso8601(start_time)
      end_time = interval.end_time # Time.iso8601(end_time)
      duration = end_time - start_time
      # 86400 seconds in a day
      num_days = (duration / 86400).ceil

      start_day = Time.utc(start_time.year, start_time.month, start_time.day)
      num_days.times do |i|
        day = start_day + i
        if map[day].nil?
          days << day
          map[day] = true
        end
      end
    end
    return days
  end

  def intersection_with_suggested_days(suggested_days, time_intervals)
    # suggested_days consists of Time objects corresponding to 00:00:00 of each day!
    # time_intervals should consist of disjoint
    # time intervals and suggested_days and time_intervals
    # should both be sorted by increasing start_time
    #time_intervals.sort_by!(&:start_time)
    suggested_days.sort! { |a, b| a <=> b }
    suggested_day_pointer = 0
    time_interval_pointer = 0
    intersection = []
    format_string = "%Y:%m:%dT%H:%M:%S.000Z"
    while (suggested_day_pointer < suggested_days.length && time_interval_pointer < time_intervals.length) do
      suggested_day = suggested_days[suggested_day_pointer]
      start_time = time_intervals[time_interval_pointer].start_time
      end_time = time_intervals[time_interval_pointer].end_time
      intersection_start = start_time
      intersection_end = end_time
      next_day = suggested_day + 86400
      if start_time > next_day
        suggested_day_pointer += 1
        next
      elsif end_time < suggested_day
        time_interval_pointer += 1
        next
      end

      if start_time < suggested_day && end_time > suggested_day
        intersection_start = suggested_day.strftime(format_string)
      end

      if end_time > next_day && start_time < next_day
        intersection_end = next_day.strftime(format_string)
      end

      intersection << { start_time: intersection_start,
                        end_time: intersection_end }
      time_interval_pointer += 1
    end

    intersection
  end
end
