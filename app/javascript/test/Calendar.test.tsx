import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "./Calendar";

function selectDates() {
  const queries = render(<Calendar />);
  const today = new Date();
  const todaysDate = today.getDate();
  const todayCell = screen.getByText(`${todaysDate}`);
  const nextWeek = new Date(today.getTime() + 7 * 86400000);
  const nextWeekCell = screen.getByText(`${nextWeek.getDate()}`);

  const todayRegex = new RegExp(
    `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`
  );
  const nextWeekRegex = new RegExp(
    `${nextWeek.getFullYear()}-${(nextWeek.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${nextWeek.getDate().toString().padStart(2, "0")}`
  );

  expect(screen.queryByDisplayValue(todayRegex)).not.toBeInTheDocument();
  expect(screen.queryByDisplayValue(nextWeekRegex)).not.toBeInTheDocument();

  userEvent.click(todayCell);
  userEvent.click(nextWeekCell);

  return queries;
}

test("shows calendar", () => {
  const { getByText, getByRole } = render(<Calendar />);

  expect(getByText("Sun")).toBeInTheDocument();
  expect(getByText("Mon")).toBeInTheDocument();
  expect(getByText("Tue")).toBeInTheDocument();
  expect(getByText("Wed")).toBeInTheDocument();
  expect(getByText("Thu")).toBeInTheDocument();
  expect(getByText("Fri")).toBeInTheDocument();
  expect(getByText("Sat")).toBeInTheDocument();

  const dayInMilliseconds = 86400000;
  const today = new Date();
  const dayOfWeek = today.getDay();
  const days = [];
  for (let i = 0; i < 28; i++) {
    days.push(
      new Date(
        today.getTime() - dayOfWeek * dayInMilliseconds + i * dayInMilliseconds
      )
    );
  }
  for (const day of days) {
    expect(getByText(`${day.getDate()}`)).toBeInTheDocument();
  }
  expect(getByRole("button", { name: /forward/i })).toBeInTheDocument();
  expect(getByRole("button", { name: /back/i })).toBeInTheDocument();

  expect(getByRole("button", { name: /select times/i })).toBeInTheDocument();
});

test("clicking creates inputs", async () => {
  render(<Calendar />);
  const today = new Date();
  const todaysDate = today.getDate();
  const todayCell = screen.getByText(`${todaysDate}`);
  const nextWeek = new Date(today.getTime() + 7 * 86400000);
  const nextWeekCell = screen.getByText(`${nextWeek.getDate()}`);

  const todayRegex = new RegExp(
    `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`
  );
  const nextWeekRegex = new RegExp(
    `${nextWeek.getFullYear()}-${(nextWeek.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${nextWeek.getDate().toString().padStart(2, "0")}`
  );

  expect(screen.queryByDisplayValue(todayRegex)).not.toBeInTheDocument();
  expect(screen.queryByDisplayValue(nextWeekRegex)).not.toBeInTheDocument();

  userEvent.click(todayCell);
  userEvent.click(nextWeekCell);

  expect(screen.getByDisplayValue(todayRegex)).toBeInTheDocument();
  expect(screen.getByDisplayValue(nextWeekRegex)).toBeInTheDocument();
});

test("can select times for dates", () => {
  selectDates();

  userEvent.click(screen.getByRole("button", { name: /select times/i }));
  expect(
    screen.getByRole("button", { name: /select dates/i })
  ).toBeInTheDocument();
  expect(screen.getByText(/select times for/i)).toBeInTheDocument();
});
