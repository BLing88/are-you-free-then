class ParticipationsController < ApplicationController
  before_action :logged_in_user
  def create
    begin
      if !params[:event_code].blank? 
        event = Event.find_by(event_code: params[:event_code])
        Participation.create!(event_id: event.id, user_id: @current_user.id)
      else
        if !correct_user? || !correct_event_invite?
          redirect_to root_url
          return
        end
        Participation.transaction do
          Participation.create!(event_id: params[:event_id], user_id: @current_user.id)
          if event_invite = EventInvite.find_by(event_id: params[:event_id], invitee_id: params[:user_id])
            event_invite.destroy!
          end
        end
        event = Event.find(participation_params[:event_id])
      end
      flash[:success] = "You are now a participant of #{event.name}!"
      redirect_to event_path(event)
    rescue
      flash[:danger] = "There was an error."
      redirect_to root_url
    end
  end

  private

  def participation_params
    params.permit(:event_id, :user_id)
  end

  def correct_user?
    @current_user.id.to_s == params[:user_id]
  end

  def correct_event_invite?
    EventInvite.exists?(event_id: params[:event_id], invitee_id: params[:user_id])
  end
end
