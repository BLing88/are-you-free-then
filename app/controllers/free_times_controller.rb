class FreeTimesController < ApplicationController
  before_action :logged_in_user, only: [:create, :destroy]
  # before_action :correct_user, only: [:destroy]

  def create
    begin
      TimeInterval.transaction do
        if !params[:create_intervals].nil?
          params[:create_intervals].each do |interval|
            start_time, end_time = start_and_end_times(interval)
            time_interval = TimeInterval.find_by(start_time: start_time,
                                                 end_time: end_time)
            if !time_interval.nil?
              time_interval.update_attribute(:user_count, time_interval.user_count + 1) unless FreeTime.find_by(user_id: current_user.id, time_interval_id: time_interval.id)
            else
              time_interval = TimeInterval.create!(
                start_time: start_time,   
                end_time: end_time,
                user_count: 1,
                event_count: 0)
            end


            if (!FreeTime.find_by(user_id: current_user.id, 
                time_interval_id: time_interval.id))
              FreeTime.create!(user_id: current_user.id,
                               time_interval_id: time_interval.id)
            end
          end
        end

        if !params[:delete_intervals].nil?
          params[:delete_intervals].each do |interval|
            start_time, end_time = start_and_end_times(interval)
            time_interval = TimeInterval.find_by(start_time: start_time, end_time: end_time)

            FreeTime.find_by(user_id: current_user.id, time_interval_id: time_interval.id).destroy

            new_user_count = time_interval.user_count - 1
            if new_user_count == 0
              time_interval.destroy
            else
              time_interval.update_attribute(:user_count, new_user_count)
            end 
          end
        end
      end
      flash[:success] = "Update successful!"
      redirect_to free_times_user_path(current_user)
    rescue => e
      # send error, try again
      logger.debug(e)
      flash[:danger] = "There was an error. Try again."
      redirect_to free_times_user_path(current_user)
    end
  end

  private

  def free_time_params
    params.permit("create_intervals[]", "delete_intervals[]")
  end

  def start_and_end_times(str)
    str.split("_")
  end
end
