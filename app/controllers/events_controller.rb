class EventsController < ApplicationController
  before_action :logged_in_user
  def new
    @hosting_event = current_user.hosting_events.build
  end

  def create
    @hosting_event = current_user.hosting_events.build(event_params)
    if @hosting_event.save
      flash[:success] = "Event created!"
      redirect_to @hosting_event
    else
      render 'new'
    end
  end

  private
    
    def event_params
      params.require(:event).permit(:host_id, :name)
    end
end
