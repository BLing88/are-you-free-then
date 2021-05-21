class User < ApplicationRecord
  attr_accessor :remember_token
  before_save { self.email = email.downcase }
  validates :name, presence: true, length: { maximum: 50 }
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  validates :email, presence: true, length: { maximum: 255 },
    format: { with: VALID_EMAIL_REGEX },
    uniqueness: true
  has_secure_password
  validates :password, presence: true, length: { minimum: 8 }, allow_nil: true

  has_many :free_times, dependent: :destroy
  has_many :time_intervals, through: :free_times

  has_many :relationships, ->(user) { unscope(:where).where(requestor_id: user.id).or(Relationship.where(requested_id: user.id)) }, dependent: :destroy

  # note the unscope call to remove default relationship.user_id = user.id check, which doesn't exist
  has_many :friendships, ->(user) { joins(:relationship_status).unscope(:where).where(relationship_statuses: { name: "Accepted" }).where(requestor_id: user.id).or(Relationship.where(relationship_statuses: { name: "Accepted" }).where(requested_id: user.id)) }, class_name: :Relationship
  has_many :requested_friends, ->(user) { where.not(relationships: { requestor_id: user.id }) }, through: :friendships, source: :requestor
  has_many :accepted_friends, ->(user) { where.not(relationships: { requested_id: user.id })  }, through: :friendships, source: :requested
  has_many :sent_pending_friends, ->(user) { Relationship.joins(:relationship_status).unscope(:where).where(relationship_statuses: { name: "Pending" }).where(requestor_id: user.id) }, through: :relationships, source: :requested
  has_many :received_pending_friends, ->(user) { Relationship.joins(:relationship_status).unscope(:where).where(relationship_statuses: { name: "Pending" }).where(requested_id: user.id) }, through: :relationships, source: :requestor

  def friends
    requested_friends + accepted_friends
  end
  # Returns the hash digest of the given string
  def self.digest(string)
    cost = ActiveModel::SecurePassword.min_cost ? 
      BCrypt::Engine::MIN_COST :
      BCrypt::Engine.cost
    BCrypt::Password.create(string, cost: cost)
  end

  def self.new_token
    SecureRandom.urlsafe_base64
  end

  # Remembers a user in the database for use in persistent sessions
  def remember
    self.remember_token = User.new_token
    update_attribute(:remember_digest, User.digest(remember_token))
    remember_digest
  end
  
  # Returns a session token to prevent session hijacking
  # We reuse the remember digest for convenience
  def session_token
    remember_digest || remember
  end

  def authenticated?(remember_token)
    return false if remember_digest.nil?
    BCrypt::Password.new(remember_digest).is_password?(remember_token)
  end

  def forget
    update_attribute(:remember_digest, nil)
  end

  def send_friend_request(other_user)
    Relationship.create(requestor: self, requested: other_user) unless self == other_user
  end
end
