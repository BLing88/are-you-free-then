require "test_helper"

class UsersCreateFreeTimesTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:alice)
    @other_user = users(:bob)
  end

  test "get free times redirects to login if not logged in" do
    get free_times_json_user_path(@user)
    assert_redirected_to login_url
  end

  test "get free times sends unauthorized error if wrong user" do
    log_in_as @other_user
    get free_times_json_user_path(@user)
    assert_response :unauthorized
  end

  test "posting free times redirects to login if not logged in" do
    assert_no_difference "FreeTime.count" do
      post free_times_path, params: { "create_intervals[]" => "2021-05-12T05:15:00.000Z_2021-05-12T07:00:00.000Z" }
    end
    assert_redirected_to login_url
  end

  test "can create free times" do
    log_in_as(@user)
    assert_difference 'FreeTime.count', 2 do
      post free_times_path, params: {
        create_intervals: ["2021-05-17T18:30:00.000Z_2021-05-17T19:30:00.000Z", "2021-05-17T20:15:00.000Z_2021-05-17T21:15:00.000Z"] }
    end
  end

  test 'can delete free times' do
    log_in_as(@user)
    post free_times_path, params: {
      create_intervals: ["2021-05-17T18:30:00.000Z_2021-05-17T19:30:00.000Z", "2021-05-17T20:15:00.000Z_2021-05-17T21:15:00.000Z"] }
    assert_difference 'FreeTime.count', -1 do
      post free_times_path, params: {
        delete_intervals: ["2021-05-17T18:30:00.000Z_2021-05-17T19:30:00.000Z"] }
    end
  end

  test 'can update free times' do
    log_in_as(@user)
    start_time = "2021-05-06T09:15:00.000Z"
    end_time = "2021-05-06T10:15:00.000Z"
    assert_no_difference 'FreeTime.count' do
      post free_times_path, params: {
        delete_intervals: ["#{free_times(:one).start_time}_#{free_times(:one).end_time}"],
        create_intervals: ["#{start_time}_#{end_time}"] }
    end
    assert_not @user.reload.free_times.include?(free_times(:one))
    assert_not @user.free_times.where(["start_time = ? AND end_time = ?", start_time, end_time]).nil?
  end
  
  test "users can have same free times"  do
    log_in_as @user
    assert @user.free_times.include?(free_times(:one))

    test_log_out
    log_in_as @other_user
    assert_difference 'FreeTime.count', 1 do
      post free_times_path, params: {
        create_intervals: ["#{free_times(:one).start_time}_#{free_times(:one).end_time}"] }
    end
    assert FreeTime.exists?(user: @other_user, 
                            start_time: free_times(:one).start_time, 
                            end_time:  free_times(:one).end_time)

    assert_no_difference 'FreeTime.count' do
      post free_times_path, params: {
        create_intervals: ["#{free_times(:one).start_time}_#{free_times(:one).end_time}"] }
    end
  end
end
