class SuggestedEventTime < ApplicationRecord
  belongs_to :event
  belongs_to :time_interval
end
