const gulp = require('gulp')
const nodemon = require('gulp-nodemon')
const plumber = require("gulp-plumber")
const rename = require("gulp-rename")
const browserSync = require('browser-sync').create()
const browserify = require('browserify')
const sourcemaps = require('gulp-sourcemaps')

// SASS -> CSS
const sass = require('gulp-sass')
const postcss = require("gulp-postcss")
const autoprefixer = require("autoprefixer")
const cssnano = require("cssnano")

// HTML
const htmlmin = require('gulp-htmlmin')

// JavaScript / TypeScript
const terser = require('gulp-terser-js');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const src = './src' 
const public = './public'
const views = './views'

// Reload the browser
const reload = (done) => {
  browserSync.reload()
  done()
}

// Serve the dev-server in the browser
const serve = (done) => {
  browserSync.init({
      proxy: "http://localhost:9090"
  })
  done()
}

const nodemonserver = (done) => {
  nodemon({
    script: 'server.js',
    ext: 'js',
    env: { 'NODE_ENV': 'development' }
  })
  .on('start', () => {
    console.log('>> nodemon started')
    done()
  })
  .on('restart', function() {
    console.log('>> nodemon restart')
    done()
  })
}

// Compile .html to minified .html
const ejs = () => {
  // Find HTML
  return gulp.src(`${src}/templates/**/*.ejs`)
      // Init Plumber
      .pipe(plumber())
      // Compile HTML to minified HTML
      .pipe(htmlmin({
          collapseWhitespace: true,
          removeComments: true,
          html5: true,
          removeEmptyAttributes: true,
          removeTagWhitespace: true,
          sortAttributes: true,
          sortClassName: true
      }))
      // Write everything to destination folder
      .pipe(gulp.dest(`${views}`))
}

// Compile SASS to CSS with gulp
const css = () => {
  // Find SASS
  return gulp.src(`${src}/styles/**/*.scss`)
      // Init Plumber
      .pipe(plumber())
      // Start sourcemap
      .pipe(sourcemaps.init())
      // Compile SASS to CSS
      .pipe(sass.sync({ outputStyle: "compressed" })).on('error', sass.logError)
      // Add suffix
      .pipe(rename({ basename: 'styles', suffix: ".min" }))
      // Add Autoprefixer & cssNano
      .pipe(postcss([autoprefixer(), cssnano()]))
      // Write sourcemap
      .pipe(sourcemaps.write(''))
      // Write everything to destination folder
      .pipe(gulp.dest(`${public}/css`))
      // Reload page
      .pipe(browserSync.stream())
}

// Compile .js to minified .js
const script = () => {
  return browserify(`${src}/js/main.js`, { debug: true })
      .transform('babelify', {
          presets: ['babel-preset-env'],
          plugins: ['babel-plugin-transform-runtime']
      }).plugin('tinyify')
      .bundle()
      .pipe(source(`main.bundle.js`))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(terser())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(`${public}/js`))
}

// Copy assets
const assets = () => {
  return gulp.src(`${src}/assets/**`)
      .pipe(gulp.dest(`${public}/assets`))
}

// Watch changes and refresh page
const watch = () => gulp.watch(
  [`${src}/templates/**/*.ejs`, `${src}/js/**/*.js`, `${src}/styles/**/*.scss`, `${src}/assets/**/*.*`],
  gulp.series(assets, css, ejs, reload));

// Development tasks
const dev = gulp.series(assets, css, ejs, nodemonserver, serve, watch)
const build = gulp.series(assets, css, script, ejs)

exports.default = dev
exports.dev = dev
exports.build = build