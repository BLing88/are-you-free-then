# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_06_10_235448) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "event_invites", force: :cascade do |t|
    t.bigint "event_id", null: false
    t.bigint "invitee_id", null: false
    t.text "status", default: "Pending"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["event_id", "invitee_id"], name: "index_event_invites_on_event_id_and_invitee_id", unique: true
    t.index ["event_id", "status"], name: "index_event_invites_on_event_id_and_status"
    t.index ["event_id"], name: "index_event_invites_on_event_id"
    t.index ["invitee_id", "status"], name: "index_event_invites_on_invitee_id_and_status"
    t.index ["invitee_id"], name: "index_event_invites_on_invitee_id"
  end

  create_table "events", force: :cascade do |t|
    t.bigint "host_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "name", null: false
    t.string "event_code"
    t.index ["event_code"], name: "index_events_on_event_code", unique: true
    t.index ["host_id", "name"], name: "index_events_on_host_id_and_name", unique: true
    t.index ["host_id"], name: "index_events_on_host_id"
  end

  create_table "free_times", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "time_interval_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["time_interval_id"], name: "index_free_times_on_time_interval_id"
    t.index ["user_id"], name: "index_free_times_on_user_id"
  end

  create_table "participations", force: :cascade do |t|
    t.bigint "event_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["event_id"], name: "index_participations_on_event_id"
    t.index ["user_id", "event_id"], name: "index_participations_on_user_id_and_event_id", unique: true
    t.index ["user_id"], name: "index_participations_on_user_id"
  end

  create_table "relationship_statuses", force: :cascade do |t|
    t.text "name"
    t.bigint "relationship_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["relationship_id"], name: "index_relationship_statuses_on_relationship_id"
  end

  create_table "relationships", force: :cascade do |t|
    t.integer "requestor_id"
    t.integer "requested_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["requested_id"], name: "index_relationships_on_requested_id"
    t.index ["requestor_id", "requested_id"], name: "index_relationships_on_requestor_id_and_requested_id", unique: true
    t.index ["requestor_id"], name: "index_relationships_on_requestor_id"
  end

  create_table "suggested_event_times", force: :cascade do |t|
    t.bigint "event_id", null: false
    t.bigint "time_interval_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["event_id"], name: "index_suggested_event_times_on_event_id"
    t.index ["time_interval_id"], name: "index_suggested_event_times_on_time_interval_id"
  end

  create_table "time_intervals", force: :cascade do |t|
    t.datetime "start_time"
    t.datetime "end_time"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["start_time", "end_time"], name: "index_time_intervals_on_start_time_and_end_time", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "password_digest"
    t.string "remember_digest"
    t.boolean "admin", default: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "event_invites", "events"
  add_foreign_key "event_invites", "users", column: "invitee_id"
  add_foreign_key "events", "users", column: "host_id"
  add_foreign_key "free_times", "time_intervals"
  add_foreign_key "free_times", "users"
  add_foreign_key "participations", "events"
  add_foreign_key "participations", "users"
  add_foreign_key "relationship_statuses", "relationships"
  add_foreign_key "suggested_event_times", "events"
  add_foreign_key "suggested_event_times", "time_intervals"
end
