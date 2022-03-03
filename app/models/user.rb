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

  has_many :free_times, -> { order :start_time }, dependent: :destroy

  has_many :hosting_events, class_name: :Event, foreign_key: :host_id, dependent: :destroy
  has_many :participations, dependent: :destroy
  has_many :events, through: :participations

  has_many :sent_relationships, class_name: "Relationship", dependent: :destroy, foreign_key: :requestor_id

  # friends you sent a friend request to
  has_many :requested_friends, -> { where(relationships: { status: "Accepted" }) }, class_name: "User", through: :sent_relationships, source: :requested

  has_many :sent_pending_friends, -> { where(relationships: { status: "Pending" }) }, class_name: "User", through: :sent_relationships, source: :requested
  
  has_many :received_relationships, class_name: "Relationship", dependent: :destroy, foreign_key: :requested_id
  
  # friends who sent you a request
  has_many :accepted_friends, -> { where(relationships: { status: "Accepted" }) }, class_name: "User", through: :received_relationships, source: :requestor

  has_many :event_invites, dependent: :destroy, foreign_key: :invitee_id

  def friends
    User.from("(#{accepted_friends.to_sql} UNION #{requested_friends.to_sql}) users")
  end

  #def sent_pending_friends
  #  User.joins(" INNER JOIN (#{sent_relationships.to_sql}) as relationships" \
  #             " ON users.id = relationships.requested_id").
  #             where(relationships: { status: "Pending" })
  #end
  
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
