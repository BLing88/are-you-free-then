import React from "react";
import { render, screen } from "@testing-library/react";
import { TimeSelector } from "./TimeSelector";

test("shows input times", () => {
  const today = new Date();
  render(<TimeSelector dates={[today]} />);
  expect(
    screen.getByText(new RegExp(`${today.toDateString()}`, "i"))
  ).toBeInTheDocument();
});
