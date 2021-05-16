require "test_helper"

class TimeIntervalTest < ActiveSupport::TestCase
  def setup
    @interval = TimeInterval.new(start_time: Time.now, end_time: '2021-05-12T10:45:00', user_count: 1, event_count: 0)
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

  test "default event and user counts should be zero" do
    new_interval = TimeInterval.new(start_time: '2021-05-19T14:30:00.000Z', end_time: '2021-05-20T15:15:00.000Z')
    assert_equal 0, new_interval.user_count
    assert_equal 0, new_interval.event_count
  end

  test "event and user counts can't both be zero" do
    new_interval = TimeInterval.new(start_time: '2021-05-29T03:15:00.000Z', end_time: '2021-06-05T05:00:00.000Z')
    assert_not new_interval.valid?

    new_interval.user_count = 1
    assert new_interval.valid?

    new_interval.user_count = 0
    new_interval.event_count = 1
    assert new_interval.valid?
  end

  test "event and user counts are only nonnegative integers" do
    @interval.user_count = 23.2
    assert_not @interval.valid?

    @interval.user_count = 23
    @interval.event_count = 0.4
    assert_not @interval.valid?

    @interval.user_count = -9
    assert_not @interval.valid?
  end

  test "start_time and end_time have simplified ISO 8601 format" do
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
