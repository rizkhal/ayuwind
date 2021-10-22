document.addEventListener("alpine:init", () => {
  Alpine.store("dark", {
    on: false,
    init() {
      this.on = this.getTheme();
    },
    toggle() {
      this.on = !this.on;
      this.setThemeToLocalStorage(this.on);
    },
    setThemeToLocalStorage(value) {
      window.localStorage.setItem("dark", value);
    },
    getTheme() {
      // if the local storage have dark value
      if (window.localStorage.getItem("dark")) {
        return JSON.parse(window.localStorage.getItem("dark"));
      }

      // else return their preferences
      return (
        !!window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    },
  });

  Alpine.data("sidebar", () => ({
    toggle: {
      ["@click"]() {
        this.$refs.sidebar.classList.toggle("mini-sidebar");
      },
    },
  }));

  Alpine.data("dropdown", () => ({
    open: false,
    toggle: {
      ["@click"]() {
        this.open = !this.open;
      },
    },
    dialogue: {
      ["x-show"]() {
        return this.open;
      },
    },
  }));
});
