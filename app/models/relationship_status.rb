class RelationshipStatus < ApplicationRecord
  belongs_to :relationship
  validates :relationship, presence: true
  validates :name, presence: true
end
