class EventInvitesController < ApplicationController
  before_action :logged_in_user
  before_action :correct_user, only: [:destroy]
  def new
    @event = Event.find(params[:id])
    @friends = @current_user.friends
    @user = @current_user
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
      @friends = @current_user.friends
      render :new
    end
  end
  
  def destroy
    if EventInvite.find(params[:id]).destroy
      flash[:success] = "Invite successfully deleted!"
      redirect_to invites_user_path(current_user)
    else
      redirect_to root_url
    end
  end

  private
    
    def correct_user
      invite = EventInvite.find(params[:id])
      redirect_to root_url unless @current_user == invite.invitee
    end
end
