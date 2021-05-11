import React from "react";
import { render } from "react-dom";
import { Calendar } from "./components/Calendar";

document.addEventListener("turbolinks:load", () => {
  const container = document.getElementById("react-calendar-input");
  if (container) {
    render(<Calendar />, container);
  }
});
