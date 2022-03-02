class RequestorRequestedNotSameValidator < ActiveModel::Validator
  def validate(relationship)
    unless relationship.requestor != relationship.requested || relationship.requestor == nil && relationship.requested == nil
      relationship.errors.add :users, "Requested user cannot be the same as the requesting user."
    end
  end
end

class Relationship < ApplicationRecord
  belongs_to :requestor, class_name: "User"
  belongs_to :requested, class_name: "User"
  validates_with RequestorRequestedNotSameValidator
end
