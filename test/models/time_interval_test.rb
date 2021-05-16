require "test_helper"

class TimeIntervalTest < ActiveSupport::TestCase
  def setup
    @interval = TimeInterval.new(start_time: Time.now, end_time: '2021-05-12T10:45:00')
  end
    
  test "start time, end time required" do
    assert @interval.valid?
    dup_interval = @interval.dup

    @interval.start_time = nil
    assert_not @interval.valid?
    @interval.start_time = dup_interval.start_time

    @interval.end_time = nil
    assert_not @interval.valid?
    @interval.end_time = dup_interval.end_time
  end

  test "seconds and milliseconds should be zero" do
  end

  test "minutes are a multiple of 15 (mod 60)" do

  end

  test "start_time should be before end_time" do
  end 

  test "invalid dates rejected" do
  end

  test "valid dates accepted" do
  end

  test "user and event counts can't be less than zero" do
  end

  test "time intervals should be unique" do
  end
end
