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

ActiveRecord::Schema.define(version: 2021_05_24_183030) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "events", force: :cascade do |t|
    t.bigint "host_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "name", null: false
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

  create_table "time_intervals", force: :cascade do |t|
    t.datetime "start_time"
    t.datetime "end_time"
    t.integer "user_count", default: 0
    t.integer "event_count", default: 0
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

  add_foreign_key "events", "users", column: "host_id"
  add_foreign_key "free_times", "time_intervals"
  add_foreign_key "free_times", "users"
  add_foreign_key "participations", "events"
  add_foreign_key "participations", "users"
  add_foreign_key "relationship_statuses", "relationships"
end
