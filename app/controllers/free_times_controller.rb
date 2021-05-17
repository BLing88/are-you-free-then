class FreeTimesController < ApplicationController
  before_action :logged_in_user, only: [:create, :destroy]
  # before_action :correct_user, only: [:destroy]

  def create
    begin
      TimeInterval.transaction do
        params[:create_intervals].each do |interval|
          start_time, end_time = start_and_end_times(interval)
          interval = TimeInterval.find_by(start_time: start_time,
                                          end_time: end_time)
          logger.debug(interval.inspect)
          if !interval.nil?
            interval.update_attribute(user_count, interval.user_count + 1) unless FreeTime.find_by(user_id: current_user.id, time_interval_id: interval.id)
          else
            interval = TimeInterval.create!(
              start_time: start_time,   
              end_time: end_time,
              user_count: 1,
              event_count: 0)
          end

          if (!FreeTime.find_by(user_id: current_user.id, 
                                       time_interval_id: interval.id))
            free_time = FreeTime.create!(user_id: current_user.id,
                                         time_interval_id: current_user.id)
          end

        end
      end
      flash[:success] = "Update successful!"
      redirect_to free_times_user_path(current_user)
    rescue => e
      # send error, try again
      puts e
      flash[:danger] = "There was an error. Try again."
      redirect_to free_times_user_path(current_user)
    end
  end

  private

  def free_time_params
    params.only("create_intervals[]")
  end

  def start_and_end_times(str)
    str.split("_")
  end
end
