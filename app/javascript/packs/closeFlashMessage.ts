function closeMessage(el: Element): void {
  el.remove();
}

document.addEventListener("turbolinks:load", () => {
  const flashMessageContainer = document.querySelector(
    ".flash-message-container"
  );

  if (flashMessageContainer) {
    const closeBtn = document.querySelector(".close-btn");

    closeBtn.addEventListener("click", function () {
      closeMessage(flashMessageContainer);
    });
  }
});
