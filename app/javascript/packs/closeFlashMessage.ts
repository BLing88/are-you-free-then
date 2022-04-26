function closeMessage(el: Element): void {
  el.remove();
}

function trapFocus(event) {
  if (event.key === "Tab") {
    event.preventDefault();
    event.currentTarget.focus();
  }
}

document.addEventListener("turbolinks:load", () => {
  const flashMessageContainer = document.querySelector(
    ".flash-message-container"
  );

  if (flashMessageContainer) {
    const closeBtn = document.querySelector(".close-btn");
    closeBtn.focus();

    closeBtn.addEventListener("click", function () {
      closeMessage(flashMessageContainer);
      closeMessage(flashBackground);
    });

    closeBtn.addEventListener("keydown", trapFocus);
  }
});
