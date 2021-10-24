document.addEventListener("alpine:init", () => {
  Alpine.store("dark", {
    on: false,
    init() {
      this.on = this.getTheme();
    },
    setTheme() {
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

  Alpine.store("sidebar", {
    open: true, // true is open, else false
    init() {
      this.open = this.getSidebar();
    },
    setSidebar() {
      this.open = !this.open;
      window.localStorage.setItem("sidebar", this.open);
    },
    getSidebar() {
      if (window.localStorage.getItem("sidebar")) {
        return JSON.parse(window.localStorage.getItem("sidebar"));
      }

      return false;
    },
  });

  Alpine.data("ayu", () => ({
    init() {
      let sidebar = this.$refs.sidebar,
        w =
          window.innerWidth ||
          document.documentElement.clientWidth ||
          document.body.clientWidth;

      window.addEventListener("resize", (event) => {
        if (event.currentTarget.innerWidth < 640) {
          sidebar.classList.add("mini-sidebar");
        }

        if (event.currentTarget.innerWidth > 640) {
          sidebar.classList.remove("mini-sidebar");
        }
      });

      if (w < 640) {
        sidebar.classList.add("mini-sidebar");
      }

      if (w > 640) {
        sidebar.classList.remove("mini-sidebar");
      }
    },
    sidebarToggle: {
      ["@click"]() {
        this.$store.sidebar.setSidebar();
        this.$refs.sidebar.classList.toggle("mini-sidebar");
      },
    },
  }));

  Alpine.data("dropdown", (config) => ({
    open: config?.open ?? false,
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

  Alpine.data("dismissible", () => ({
    open: true,
    toggle: {
      ["@click"]() {
        this.open = false;
      },
    },
    dialogue: {
      ["x-show"]() {
        return this.open;
      },
    },
  }));

  Alpine.data("toast", () => ({
    counter: 0,
    list: [],
    createToast(type, title, message) {
      const index = this.list.length;
      let totalVisible =
        this.list.filter((toast) => {
          return toast.visible;
        }).length + 1;

      this.list.push({
        id: this.counter++,
        type,
        title,
        message,
        visible: true,
      });
      setTimeout(() => {
        this.destroyToast(index);
      }, 5000 * totalVisible);
    },
    destroyToast(index) {
      this.list[index].visible = false;
    },
  }));
});
