require "test_helper"

class FreeTimesControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:alice)
    @other_user = users(:bob)
  end

  test "return JSON free times for a user" do
    log_in_as(@user)
    get free_times_json_user_path(@user)
    assert_match /application\/json/, response.content_type
  end

  test "seconds and milliseconds should be zero" do
  end

  test "minutes are a multiple of 15 (mod 60)" do
  end

  test "change user_count accordingly" do
  end

  test "merges overlapping intervals" do
  end
end
