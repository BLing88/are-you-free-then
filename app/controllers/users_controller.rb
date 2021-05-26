class UsersController < ApplicationController
  before_action :logged_in_user, only: [:edit, :update, :destroy, :free_times, :friends]
  before_action :correct_user, only: [:edit, :update, :free_times, :friends]
  
  def new
    @user = User.new
  end

  def show
    @user = User.find(params[:id])
    @events = @user.events
  end

  def create
    @user = User.new(user_params)
    if  @user.save
      reset_session
      log_in @user
      flash[:success] = "Welcome!"
      redirect_to @user
    else
      render :new
    end
  end
  
  def edit
    @user = User.find(params[:id])
  end

  def update
    @user = User.find(params[:id])
    if @user.update(user_params)
      flash[:success] = "Profile updated successfully"
      redirect_to @user
    else
      render 'edit'
    end
  end

  def destroy
    user = User.find(params[:id])
    if current_user?(user)
      delete_account(user)
      flash[:success] = "Account deleted"
      redirect_to root_url
    else 
      flash[:danger] = "Permission denied."
      redirect_to root_url
    end
  end

  def free_times
    @user = User.find(params[:id])
    @free_times = @user.time_intervals
  end

  def free_times_json
    user = User.find(params[:id])
    if current_user?(user)
      render json: user.time_intervals
    else
      render status: :unauthorized, json: { error: { message: "Not authenticated"} }
    end
  end

  def friends
    @friends = @user.friends
  end

  private

    def user_params
      params.require(:user).permit(:name, :email, :password,
                                   :password_confirmation)
    end

    # Confirms a logged-in user
    def logged_in_user
      unless logged_in?
        store_location
        flash[:danger] = "Please log in"
        redirect_to login_url
      end
    end

    # Confirms the correct user
    def correct_user
      @user = User.find(params[:id])
      redirect_to(root_url) unless current_user?(@user)
    end
end
