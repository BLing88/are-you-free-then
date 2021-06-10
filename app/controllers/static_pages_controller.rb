class StaticPagesController < ApplicationController
  def welcome
    if logged_in?
      events = @current_user.events.includes(:host)
      @events = events.map do |event|
        { name: event.name,
          id: event.id,
          host: event.host.name
        }
      end 
      invites = @current_user.event_invites.includes(:event)
      @event_invites = invites.map do |invite|
        { event_name: invite.event.name,
          host: invite.event.host.name,
          id: invite.id,
          event_id: invite.event.id }
        end
      # @friend_requests = @current_user.friend_requests
      render 'users/home'
    end
  end
end
