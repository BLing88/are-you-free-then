import React from "react";

interface BackButtonProps {
  onClickHandler: () => void;
}

export const BackButton = ({ onClickHandler }: BackButtonProps) => (
  <button type="button" className="back-btn" onClick={onClickHandler}>
    &#x3008; <small>Back</small>
  </button>
);
