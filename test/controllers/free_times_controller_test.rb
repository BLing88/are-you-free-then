require "test_helper"

class FreeTimesControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:alice)
    @other_user = users(:bob)
  end

  test 'redirects to login if not logged in' do
    assert_no_difference 'FreeTimes.count', do
      post free_times_path
  end

  test "return error if input start_time or end_time not in simplified ISO 8601 format" do
    log_in_as(@user)
    assert_difference 'FreeTimes.count', 2 do 
      post free_times_path, params: { 
                                      create_intervals[]: "2021-05-17T18:30:00.000Z_2021-05-17T19:30:00.000Z",
                                      create_intervals[]: "2021-05-17T20:15:00.000Z_2021-05-17T21:15:00.000Z" }
    end
  end

  test "seconds and milliseconds should be zero" do
  end

  test "minutes are a multiple of 15 (mod 60)" do
  end

  test "change user_count accordingly" do
  end
end
