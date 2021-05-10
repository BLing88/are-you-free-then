import React from "react";
import { render } from "react-dom";
import { Calendar } from "./components/Calendar";

document.addEventListener("DOMContentLoaded", () => {
  render(<Calendar />, document.getElementById("calendar"));
});
