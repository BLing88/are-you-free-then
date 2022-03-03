class EventsController < ApplicationController
  before_action :logged_in_user
  before_action :is_host?, only: [:edit, :update]
  before_action :is_participant?, only: [:show]

  def new
    @event = @current_user.events.build
  end

  def show
    @suggested_days = helpers.days_from_intervals(@event.suggested_event_times)
    # @event.suggested_times.each do |time_interval|
    #   helpers.days_from_interval(time_interval.start_time, time_interval.end_time).each do |day| 
    #       @suggested_days << day
    #   end
    # end

    #logger.debug "suggested_days: #{@suggested_days}"
    @event_free_times = []
    participants = @event.participants
    #logger.debug "participants: #{participants}"
    @times = {}
    participants.each do |participant| 
      intersection = helpers.intersection_with_suggested_days(@suggested_days, participant.free_times)
      # logger.debug "intersection: #{intersection}"
      intersection.each do |interval|
        start_time = interval[:start_time]
        end_time = interval[:end_time]
        if !@times["#{start_time}_#{end_time}"].nil?
          @times["#{start_time}_#{end_time}"].participants << participant.name
        else
          @times["#{start_time}_#{end_time}"] = { start_time: start_time, end_time: end_time, participants: [participant.name]}
        end
      end
    end  
    #logger.debug("@times: #{@times}")
    @times = @times.values
  end

  def create
    @event = @current_user.events.build(event_params)
    begin
      if @event.save!
        SuggestedEventTime.transaction do
          #@event.reload
          if !params[:create_intervals].nil?
            params[:create_intervals].each do |interval|
              start_time, end_time = start_and_end_times(interval)

              if (!SuggestedEventTime.exists?(event_id: @event.id, 
                  start_time: start_time,
                  end_time: end_time))
                SuggestedEventTime.create!(event_id: @event.id,
                                           start_time: start_time,
                                           end_time: end_time)
              end
            end
          end
        end

        flash[:success] = "Event created!"
        redirect_to @event
      end
    rescue => e
      logger.debug e
      flash.now[:danger] = "There was an error. Please try again."
      render :new
    end
  end

  def edit
  end


  def update
    event_id = params[:event][:event_id]
    begin
      SuggestedEventTime.transaction do
        if !params[:create_intervals].nil?
          params[:create_intervals].each do |interval|
            start_time, end_time = start_and_end_times(interval)

            if (!SuggestedEventTime.exists?(event_id: event_id, 
                  start_time: start_time,
                  end_time: end_time))
              SuggestedEventTime.create!(event_id: event_id,
                  start_time: start_time,
                  end_time: end_time)
            end
          end
        end

        if !params[:delete_intervals].nil?
          params[:delete_intervals].each do |interval|
            start_time, end_time = start_and_end_times(interval)

            SuggestedEventTime.find_by(event_id: event_id,
                                       start_time: start_time,
                                       end_time: end_time).destroy

          end
        end
      end
      @event.update!(event_params) unless event_params.nil?
      flash[:success] = "Update successful!"
      redirect_to @event
    rescue => e
      # send error, try again
      logger.debug(e)
      flash.now[:danger] = "There was an error. Try again."
      render :edit
    end
  end

  private

  def event_params
    params.require(:event).permit(:host_id, :name)
  end

  def suggested_time_params
    params.permit(:event_id, "create_intervals[]", "delete_intervals[]")
  end

  def start_and_end_times(str)
    str.split("_")
  end

  def correct_user
    redirect_to root_url unless @current_user.events.find(params[:id])
  end

  def is_host?
    @event = Event.find(params[:id])
    if @current_user != @event.host
      flash[:danger] = "Only hosts can edit events."
      redirect_to root_url
    end
  end

  def is_participant?
    @event = Event.includes(:participants).find(params[:id])
    redirect_to root_url unless @event.participants.include?(current_user)
  end
end
