require "test_helper"

class TimeIntervalsControllerTest < ActionDispatch::IntegrationTest
  test "return error if input start_time and end_time not in simplified ISO 8601 format" do
   post  
  end

  test "seconds and milliseconds should be zero" do 
  end

  test "minutes are a multiple of 15 (mod 60)" do
  end

  test "change user_count accordingly" do
  end

  test "destroy time interval if both user_count and event_count become zero" do
  end
end
