class SuggestedEventTime < ApplicationRecord
  belongs_to :event
  include Timeable
end
