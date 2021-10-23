/*
  Usage:
  1. npm install //To install all dev dependencies of package
  2. npm run dev //To start development and server for live preview
  3. npm run prod //To generate minifed files for live server
*/

const { src, dest, task, watch, series, parallel } = require("gulp");
const del = require("del"); //For Cleaning build/dist for fresh export
const options = require("./config"); //paths and other options from config.js
const browserSync = require("browser-sync").create();

const postcss = require("gulp-postcss"); //For Compiling tailwind utilities with tailwind config
const concat = require("gulp-concat"); //For Concatinating js,css files
const uglify = require("gulp-terser"); //To Minify JS files
const imagemin = require("gulp-imagemin"); //To Optimize Images
const cleanCSS = require("gulp-clean-css"); //To Minify CSS files
const purgecss = require("gulp-purgecss"); // Remove Unused CSS from Styles

//Note : Webp still not supported in major browsers including firefox
//const webp = require('gulp-webp'); //For converting images to WebP format
//const replace = require('gulp-replace'); //For Replacing img formats to webp in html
const logSymbols = require("log-symbols"); //For Symbolic Console logs :) :P

//Load Previews on Browser on dev
function livePreview(done) {
  browserSync.init({
    server: {
      baseDir: options.paths.dist.base,
    },
    port: options.config.port || 5000,
  });
  done();
}

// Triggers Browser reload
function previewReload(done) {
  console.log("\n\t" + logSymbols.info, "Reloading Browser Preview.\n");
  browserSync.reload();
  done();
}

//Development Tasks
function devHTML() {
  return src(`./src/views/**/*.html`).pipe(dest(options.paths.dist.base));
}

function devStyles() {
  const tailwindcss = require("tailwindcss");
  return src(`./src/css/*.css`)
    .pipe(dest(options.paths.src.css))
    .pipe(
      postcss([tailwindcss(options.config.tailwindjs), require("autoprefixer")])
    )
    .pipe(concat({ path: "styles.css" }))
    .pipe(dest(options.paths.dist.css));
}

function devScripts() {
  return src([`./src/js/*.js`])
    .pipe(concat({ path: "scripts.js" }))
    .pipe(dest(options.paths.dist.js));
}

function devImages() {
  return src(`./src/img/*`).pipe(dest(options.paths.dist.img));
}

function watchFiles() {
  watch(`./src/views/**/*.html`, series(devHTML, devStyles, previewReload));
  watch(
    [options.config.tailwindjs, `./src/css/*.css`],
    series(devStyles, previewReload)
  );
  watch(`${options.paths.src.js}/**/*.js`, series(devScripts, previewReload));
  watch(`${options.paths.src.img}/**/*`, series(devImages, previewReload));
  console.log("\n\t" + logSymbols.info, "Watching for Changes..\n");
}

function devClean() {
  console.log(
    "\n\t" + logSymbols.info,
    "Cleaning dist folder for fresh start.\n"
  );
  return del([options.paths.dist.base]);
}

exports.default = series(
  devClean, // Clean Dist Folder
  parallel(devStyles, devScripts, devImages, devHTML), //Run All tasks in parallel
  livePreview, // Live Preview Build
  watchFiles // Watch for Live Changes
);
