import React from "react";

interface ForwardButtonProps {
  onClickHandler: () => void;
}

export const ForwardButton = ({ onClickHandler }: ForwardButtonProps) => (
  <button type="button" className="forward-btn" onClick={onClickHandler}>
    Forward &#x3009;
  </button>
);
