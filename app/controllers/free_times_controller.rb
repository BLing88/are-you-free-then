class FreeTimesController < ApplicationController
  before_action :logged_in_user, only: [:create, :destroy]
  # before_action :correct_user, only: [:destroy]

  def create
    begin
      FreeTime.update_intervals(params[:create_intervals],
                                params[:delete_intervals],
                                :user_id,
                                current_user.id)
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
end
