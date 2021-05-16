require "test_helper"

class TimeIntervalTest < ActiveSupport::TestCase
  def setup
    @interval = TimeInterval.new(start_time: '2021-05-11T04:15:00.000Z', end_time: '2021-05-12T10:45:00', user_count: 1, event_count: 0)
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
    assert_equal 1, new_interval.errors.count

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

  test "start_time and end_time have correct format" do
    @interval.start_time = "42j5l245"
    assert_not @interval.valid?
    
    @interval.start_time = 20
    assert_not @interval.valid?

    @interval.start_time = '2021-04-22T17:30:00.000Z'
    @interval.end_time = '2021-3'
    assert_not @interval.valid?
  end

  test "start_time should be before end_time" do
    @interval.start_time = '2021-09-18T19:45:00.000Z'
    @interval.end_time = '2021-08-19T20:45:00.000Z'
    assert_not @interval.valid?
  end 

  test "invalid dates rejected" do
    @interval.start_time = "20223-05-01T15:00:00.000Z"
    assert_not @interval.valid?
    @interval.start_time = "2021-05-01T15:00:00.000Z"
    assert @interval.valid?

    @interval.end_time = "2021-13-01T15:00:00.000Z"
    assert_not @interval.valid?
    @interval.end_time = "2021-12-01T15:00:00.000Z"
    assert @interval.valid?

    @interval.start_time = "2021-02-32T02:30:00.000Z"
    assert_not @interval.valid?
    @interval.start_time = "2021-02-20T02:30:00.000Z"
    assert @interval.valid?

    @interval.end_time = '2021-06-09T25:45:00.000Z'
    assert_not @interval.valid?

    @interval.end_time = '2021-06-09T23:60:00.000Z'
    assert_not @interval.valid?
  end

  test "time intervals should be unique" do
    dup_interval = @interval.dup
    assert dup_interval.valid?

    @interval.save
    assert_not dup_interval.valid?
  end
end
