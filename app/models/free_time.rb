class FreeTime < ApplicationRecord
  belongs_to :user
  belongs_to :time_interval
end
