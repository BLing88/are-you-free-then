class EventsController < ApplicationController
  before_action :logged_in_user
  def new
    @hosting_event = current_user.hosting_events.build
  end

  def show
    @event = Event.includes(:participants, :suggested_times).find(params[:id])
    
    @suggested_days = helpers.days_from_intervals(@event.suggested_times)
   # @event.suggested_times.each do |time_interval|
   #   helpers.days_from_interval(time_interval.start_time, time_interval.end_time).each do |day| 
   #       @suggested_days << day
   #   end
   # end

    #logger.debug "suggested_days: #{@suggested_days}"
    @event_free_times = []
    participants = @event.participants.includes(:time_intervals)
    #logger.debug "participants: #{participants}"
    @times = {}
    participants.each do |participant| 
      intersection = helpers.intersection_with_suggested_days(@suggested_days, participant.time_intervals)
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
    @hosting_event = current_user.hosting_events.build(event_params)
    begin
      if @hosting_event.save
      TimeInterval.transaction do
        @hosting_event.reload
        if !params[:create_intervals].nil?
          params[:create_intervals].each do |interval|
            start_time, end_time = start_and_end_times(interval)
            time_interval = TimeInterval.find_by(start_time: start_time,
                                                 end_time: end_time)
            if !time_interval.nil?
              time_interval.update_attribute(:event_count, time_interval.user_count + 1) unless SuggestedEventTime.find_by(event_id: @hosting_event.id, time_interval_id: time_interval.id)
            else
              time_interval = TimeInterval.create!(
                start_time: start_time,   
                end_time: end_time,
                user_count: 0,
                event_count: 1)
            end

            if (!SuggestedEventTime.find_by(event_id: @hosting_event.id, 
                time_interval_id: time_interval.id))
              SuggestedEventTime.create!(event_id: @hosting_event.id,
                               time_interval_id: time_interval.id)
            end
          end
        end
      end

      flash[:success] = "Event created!"
      redirect_to @hosting_event
      end
    rescue => e
      logger.debug e
      flash[:danger] = "There was an error. Please try again."
      render 'new'
    
    end
  end


  def update
    event_id = params[:event][:event_id]
    @event = Event.find(event_id)
    begin
      TimeInterval.transaction do
        if !params[:create_intervals].nil?
          params[:create_intervals].each do |interval|
            start_time, end_time = start_and_end_times(interval)
            time_interval = TimeInterval.find_by(start_time: start_time,
                                                 end_time: end_time)
            if !time_interval.nil?
              time_interval.update_attribute(:event_count, time_interval.user_count + 1) unless SuggestedEventTime.find_by(event_id: event_id, time_interval_id: time_interval.id)
            else
              time_interval = TimeInterval.create!(
                start_time: start_time,   
                end_time: end_time,
                user_count: 0,
                event_count: 1)
            end

            if (!SuggestedEventTime.find_by(event_id: event_id, 
                time_interval_id: time_interval.id))
              SuggestedEventTime.create!(event_id: event_id,
                               time_interval_id: time_interval.id)
            end
          end
        end

        if !params[:delete_intervals].nil?
          params[:delete_intervals].each do |interval|
            start_time, end_time = start_and_end_times(interval)
            time_interval = TimeInterval.find_by(start_time: start_time, end_time: end_time)

            SuggestedEventTime.find_by(event_id: event_id, time_interval_id: time_interval.id).destroy

          end
        end
      end
      flash[:success] = "Update successful!"
      redirect_to @event
    rescue => e
      # send error, try again
      logger.debug(e)
      flash[:danger] = "There was an error. Try again."
      redirect_to @event
    end
  end

  private
    
    def event_params
      params.require(:event).permit(:host_id, :name, :event_id)
    end

    def suggested_time_params
      params.permit(:event_id, "create_intervals[]", "delete_intervals[]")
    end
   
    def start_and_end_times(str)
      str.split("_")
    end
end
