require "application_system_test_case"

class EditEventsTest < ApplicationSystemTestCase
  def setup 
    @alice = users(:alice)
    @event = events(:one)
    @greg = users(:greg)
    @gregs_participation = participations(:three)
    @alices_participation = participations(:four)
  end

  test "can delete participants as host" do
    visit login_url
    fill_in "session[email]", with: @alice.email
    fill_in "session[password]", with: 'example_password'
    click_on "Login"

    visit event_url(@event)
    click_link 'Edit'

    assert_selector 'button', text: /participants/i
    assert_selector 'button', text: /details/i

    click_button 'Participants'

    assert_selector 'li', text: @alice.name
    assert_not has_link?(href: participation_path(@alices_participation))

    assert_selector 'li', text: @greg.name
    assert has_link?(href: participation_path(@gregs_participation))

    click_link href: participation_path(@gregs_participation)
    page.driver.browser.switch_to.alert.accept
    assert_selector 'li', text: @alice.name
    # wait for ajax to remove participant li
    assert_not has_link?(href: participation_path(@gregs_participation), wait: 10)
  end

  test "can delete events as host" do
    visit login_url
    fill_in "session[email]", with: @alice.email
    fill_in "session[password]", with: 'example_password'
    click_on "Login"

    assert has_link? @event.name

    visit event_url(@event)
    click_link 'Edit'
    
    click_button 'Other'
    
    click_link "Delete this event"
    page.driver.browser.switch_to.alert.accept

    assert_not has_link?(@event.name, wait: 5)

    assert_selector "p.flash-message", text: /event successfully deleted/i
  end
end
