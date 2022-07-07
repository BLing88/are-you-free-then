import React from "react";
import { render } from "react-dom";
import { UserHomePage } from "./components/UserHomePage";

export const renderUserHomePage = (): void => {
  const userHomePageContainer = document.getElementById("react-user-home-page");
  if (userHomePageContainer) {
    render(<UserHomePage />, userHomePageContainer);
  }
};
