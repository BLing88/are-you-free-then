document.addEventListener("turbolinks:load", () => {
  const menuContainer: HTMLElement = document.querySelector(".header-menu-li");
  if (menuContainer) {
    const headerMenu: HTMLElement = document.querySelector(".header-menu");
    const headerMenuIcon = document.querySelector(".header-menu-btn");
    headerMenuIcon.addEventListener("click", () => {
      headerMenu.style.visibility =
        headerMenu.style.visibility === "hidden" ? "visible" : "hidden";
    });
  }
});
