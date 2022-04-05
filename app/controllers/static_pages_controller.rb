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
      render 'users/home'
    end
  end
end
