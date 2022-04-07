class ParticipationsController < ApplicationController
  before_action :logged_in_user

  def create
    begin
      event_id = participation_params[:event_id]
      event = Event.find(event_id)
      Participation.create!(event_id: event_id, user_id: @current_user.id)

#      if !params[:event_code].blank? 
#        event = Event.find_by(event_code: params[:event_code])
#        Participation.create!(event_id: event.id, user_id: @current_user.id)
#      else
#        if !correct_user? || !correct_event_invite?
#          redirect_to root_url
#          return
#        end
#        Participation.transaction do
#          Participation.create!(event_id: params[:event_id], user_id: @current_user.id)
#          if event_invite = EventInvite.find_by(event_id: params[:event_id], invitee_id: params[:user_id])
#            event_invite.destroy!
#          end
#        end
#        event = Event.find(participation_params[:event_id])
#      end
      flash[:success] = "You are now a participant of #{event.name}!"
      redirect_to event_path(event)
    rescue
      flash[:danger] = "There was an error."
      redirect_to root_url
    end
  end

  def destroy
    begin
      @participation = Participation.find(params[:id])
      if @current_user != @participation.event.host
        redirect_to root_url
        return
      end
      @participation.destroy
      respond_to do |format|
        format.html { redirect_to edit_event_url(@participation.event) }
        format.js
      end
    rescue
      flash.now[:danger] = "There was an error removing participant."
      render "events/edit"
    end
  end

  private

  def participation_params
    params.require(:participation).permit(:event_id)
  end

  def correct_user?
    @current_user.id.to_s == params[:user_id]
  end

  def correct_event_invite?
    EventInvite.exists?(event_id: params[:event_id], invitee_id: params[:user_id])
  end
end
