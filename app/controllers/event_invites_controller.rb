class EventInvitesController < ApplicationController
  def new
    @event = Event.find(params[:id])
    @friends = current_user.friends
    @user = current_user
  end

  def create
    @event = Event.find(params[:id])
    invitees = params[:event][:invitees]
    begin
    EventInvite.transaction do
      invitees.each do |invitee|
        @event.event_invites.create!(invitee_id: invitee) unless EventInvite.exists?(invitee_id: invitee) || invitee.blank?
      end
      flash[:success] = "#{"Paricipant".pluralize(invitees.count - 1)} successfully invited!" unless invitees.count == 1
    end
    redirect_to @event
    rescue => e
      logger.debug e
      flash.now[:danger] = "There was an error. Please try again."
      @friends = current_user.friends
      render :new
    end
  end
end
