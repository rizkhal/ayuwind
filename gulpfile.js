/**
 * Imports
 */
const { src, dest, watch, parallel } = require("gulp");
const browserSync = require("browser-sync").create();
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const imagemin = require("gulp-imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const nunjucks = require("gulp-nunjucks");
const color = require("gulp-color");
const nodePath = require("path");

/**
 * Configuration
 * @type {String}
 */
var cssDir = "./src/css",
  jsDir = "./src/js",
  htmlDir = "./src/views",
  imgDir = "./src/img";

/**
 * Helpers
 */

function _compile_html(path, onEnd, log = true, ret = false) {
  if (log) _log("[HTML] Compiling: " + path, "GREEN");

  let compile_html = src(path, { base: htmlDir })
    .pipe(plumber())
    .pipe(
      nunjucks.compile(
        {
          version: "1.0",
          site_name: "Ayuwind",
        },
        /**
         * Nunjucks options
         */
        {
          trimBlocks: true,
          lstripBlocks: true,
          /**
           * Nunjucks filters
           * @type {Object}
           */
          filters: {
            is_active: (str, reg, page) => {
              reg = new RegExp(reg, "gm");
              reg = reg.exec(page);
              if (reg != null) {
                return str;
              }
            },
          },
        }
      )
    )
    .pipe(
      rename({
        dirname: "",
        extname: ".html",
      })
    )
    .on("error", console.error.bind(console))
    .on("end", () => {
      if (onEnd) onEnd.call(this);

      if (log) _log("[HTML] Finished", "GREEN");
    })
    .pipe(dest("pages"))
    .pipe(plumber.stop());

  if (ret) return compile_html;
}

function _compile_css(path, onEnd, log = true, ret = false) {
  if (log) _log("[SCSS] Compiling:" + path, "GREEN");

  let compile_css = src(path)
    .pipe(plumber())
    .on("error", console.error.bind(console))
    .on("end", () => {
      if (onEnd) onEnd.call(this);

      if (log) _log("[SCSS] Finished", "GREEN");
    })
    .pipe(postcss([autoprefixer()]))
    .pipe(dest(cssDir))
    .pipe(plumber.stop());

  if (ret) return compile_css;
}

function _log(str, clr) {
  if (!clr) clr = "WHITE";
  console.log(color(str, clr));
}

/**
 * End of helper
 */

/**
 * Execution
 */

function folder() {
  return src("*.*", { read: false })
    .pipe(dest("./assets/css"))
    .pipe(dest("./assets/js"))
    .pipe(dest("./assets/img"));
}

function image() {
  return src(imgDir + "/**/*.*")
    .pipe(plumber())
    .pipe(imagemin([imageminMozjpeg({ quality: 80 })]))
    .pipe(dest(imgDir))
    .pipe(plumber.stop());
}

function compile_css() {
  return _compile_css(cssDir + "/**/*.css", null, false, true);
}

function compile_html() {
  return _compile_html(htmlDir + "/**/*.njk", null, false, true);
}

function watching() {
  compile_css();
  compile_html();

  /**
   * BrowserSync initialization
   * @type {Object}
   */
  browserSync.init({
    server: {
      baseDir: "./",
    },
    startPath: "pages/index.html",
    port: 8080,
  });

  /**
   * Watch ${htmlDir}
   */
  watch([
    htmlDir + "/**/*.njk",
    cssDir + "/**/*.css",
    jsDir + "/**/*.js",
    imgDir + "/**/*.*",
  ]).on("change", (file) => {
    file = file.replace(/\\/g, nodePath.sep);

    if (file.indexOf(".css") > -1) {
      _compile_css(cssDir + "/**/*.css", () => {
        return browserSync.reload();
      });
    }

    if (file.indexOf("layouts") > -1 && file.indexOf(".njk") > -1) {
      _compile_html(htmlDir + "/*.njk", () => {
        return browserSync.reload();
      });
    } else if (file.indexOf(".njk") > -1) {
      _compile_html(file, () => {
        return browserSync.reload();
      });
    }

    if (file.indexOf(jsDir) > -1 || file.indexOf(imgDir) > -1) {
      return browserSync.reload();
    }
  });
}

// Create folder first
exports.folder = folder;

// Minify images
exports.image = image;

// Compile SCSS
exports.css = compile_css;

// Compile HTML
exports.html = compile_html;

// Dist
exports.dist = parallel(folder, compile_css, compile_html);

// Run this command for dev.
exports.default = watching;
