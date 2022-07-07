function closeMessage(el: HTMLElement): void {
  el.remove();
}

function trapFocus(event) {
  if (event.key === "Tab") {
    event.preventDefault();
    event.currentTarget.focus();
  }
}

document.addEventListener("turbolinks:load", () => {
  const flashMessageContainer: HTMLElement = document.querySelector(
    ".flash-message-container"
  );

  if (flashMessageContainer) {
    const closeBtn: HTMLElement = document.querySelector(".close-btn");
    closeBtn.focus();

    const flashBackground: HTMLElement = document.querySelector(
      ".flash-message-background"
    );

    closeBtn.addEventListener("click", function () {
      closeMessage(flashMessageContainer);
      closeMessage(flashBackground);
    });

    closeBtn.addEventListener("keydown", trapFocus);
  }
});
