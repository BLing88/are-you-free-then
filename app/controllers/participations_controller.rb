class ParticipationsController < ApplicationController
  before_action :logged_in_user, :correct_user, :correct_event_invite
  def create
    begin
      Participation.transaction do
        Participation.create!(participation_params)
        EventInvite.find_by(event_id: params[:event_id], invitee_id: params[:user_id]).destroy!
      end
        event = Event.find(participation_params[:event_id])
        flash[:success] = "You are now a participant of #{event.name}!"
        redirect_to event_path(event)
    rescue
      flash[:danger] = "There was an error."
      redirect_to invites_user_path(current_user) 
    end
  end

  private

  def participation_params
    params.permit(:event_id, :user_id)
  end

  def correct_user
    redirect_to root_url unless @current_user.id.to_s == params[:user_id]
  end

  def correct_event_invite
    redirect_to root_url unless EventInvite.exists?(event_id: params[:event_id], invitee_id: params[:user_id])
  end
end
