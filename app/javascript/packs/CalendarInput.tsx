import React from "react";
import { render } from "react-dom";
import { Calendar } from "./components/Calendar";

document.addEventListener("turbolinks:load", () => {
  render(<Calendar />, document.getElementById("react-calendar-input"));
});
