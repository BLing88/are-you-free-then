import React from "react";

interface ForwardButtonProps {
  onClickHandler: () => void;
}

export const ForwardButton = ({
  onClickHandler,
}: ForwardButtonProps): JSX.Element => (
  <button type="button" className="forward-btn" onClick={onClickHandler}>
    <small>Forward</small> &#x3009;
  </button>
);
