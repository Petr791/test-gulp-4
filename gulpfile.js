//"use strict"


/* =============================================== */
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const fileInclude = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
const sass = require('gulp-sass')(require('sass'));
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
//const webp = require('gulp-webp'); //проблема
//const webp2 = require('imagemin-webp');


const fonter = require('gulp-fonter');



const size = require("gulp-size");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");
const mediaqueries = require("gulp-group-css-media-queries"); // устарел!

const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const stream = require("webpack-stream");
const webpack = require("webpack");

const browserSync = require("browser-sync").create();
const srcPath = "./src/";
const distPath = "./public/";


const path = {
    build: {

        //html: distPath +"html/",
        html: distPath,
        css: distPath + "css/",
        js: distPath + "js/",
        img: distPath + "img/",
        fonts: distPath + "fonts/"
    },
    src: {
        //html: srcPath + "*.html",
        html: srcPath + "html/*.html",
        css: srcPath + "scss/*.scss",
        //css: [{ "./src/scss/style.scss" }, { "./src/scss/style2.scss" }],
        js: srcPath + "js/*.js",
        img: srcPath + "img/**/*.{jpeg,png,svg,webp,jpg,gif,ico,xml,json}",
        fonts: srcPath + "fonts/**/*.{otf,eot,woff,woff2,ttf,svg}"
    },
    watch: {
        html: srcPath + "html/**/*.html",
        css: srcPath + "scss/**/*.scss",
        js: srcPath + "js/**/*.js",
        img: srcPath + "img/**/*.{jpeg,png,svg,webp,jpg,gif,ico,xml,json}",
        fonts: srcPath + "fonts/**/*.{otf,eot,woff,woff2,ttf,svg}"
    },
    //clean: "./" + distPath
    clean: distPath

}



const html = () => {

    return gulp.src(path.src.html)

    .pipe(plumber({
        errorHandler: function(err) {
            notify.onError({
                title: "Ошибка в html",
                message: "<%= error.message %>"
            })(err);
        }
    }))

    .pipe(fileInclude())
        .pipe(size())
        .pipe(gulp.dest("./public"))

    //min
    .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(size())

    .pipe(rename({
        suffix: ".min",
        extname: ".html"
    }))

    .pipe(gulp.dest("./public"))
        .pipe(browserSync.stream());
}


const css = () => {

    //return gulp.src(path.src.css)
    return gulp.src("./src/scss/style.css")
        //return gulp.src(["./src/scss/style.scss", "./src/scss/style2.scss"])
        // return gulp.src(["./src/scss/style2.scss", "./src/scss/style.scss"], { sourcemaps: true })
        .pipe(plumber({
            errorHandler: function(err) {
                notify.onError({
                    title: "Ошибка в css",
                    message: "<%= error.message %>"
                })(err);
            }
        }))

    .pipe(sourcemaps.init()) // настройка в самом gulp

    .pipe(sass())

    .pipe(concat("style.css"))
        //overrideBrowserslist старый вариант
        .pipe(autoprefixer())

    .pipe(mediaqueries())
        .pipe(size())
        //.pipe(gulp.dest("./public/css"))
        .pipe(gulp.dest(path.build.css))

    //min

    //.pipe(htmlmin({ collapseWhitespace: true }))
    //.pipe(cleancss()) // удаляет комментарии и сжимает .min
    .pipe(cleancss({ level: { 2: { specialComments: 0 } } /* , format: 'beautify' */ }))
        //.pipe(cleancss({ level: 2 /* , format: 'beautify' */ })) // если нужен объёмный код - раскомментируй: /* , format: 'beautify' */

    .pipe(size())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))

    .pipe(sourcemaps.write()) // настройка в самом gulp
        // .pipe(gulp.dest("./public/css"))
        .pipe(gulp.dest(path.build.css))

    .pipe(browserSync.stream());
}



const js = () => {

    //return gulp.src(path.src.js)

    return gulp.src(["./src/js/index.js"])
        //return gulp.src(["./src/js/components/popup.js", "./src/js/components/slider.js", "./src/js/index.js", "./src/js/2.js"])

    .pipe(plumber({
        errorHandler: function(err) {
            notify.onError({
                title: "Ошибка в js",
                message: "<%= error.message %>"
            })(err);
        }
    }))

    .pipe(sourcemaps.init())


    .pipe(babel({
        presets: ["@babel/preset-env"]
    }))



    .pipe(size())
        //.pipe(rigger()) // сборка нескольких файлов в один
        .pipe(concat('all.js'))

    .pipe(gulp.dest(path.build.js))

    //min
    .pipe(uglify())
        .pipe(size())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))


    .pipe(sourcemaps.write()) // настройка в самом gulp
        // .pipe(gulp.dest("./public/js"))
        .pipe(gulp.dest(path.build.js))

    .pipe(browserSync.stream());
}


const img = () => {

    return gulp.src(path.src.img, {
            encoding: false
        })
        //return gulp.src("./src/scss/style.css")
        //return gulp.src(["./src/js/index.js", "./src/js/2.js"])
        //return gulp.src(["./src/js/components/popup.js", "./src/js/components/slider.js", "./src/js/index.js", "./src/js/2.js"])

    .pipe(plumber({
            errorHandler: function(err) {
                notify.onError({
                    title: "Ошибка в img",
                    message: "<%= error.message %>"
                })(err);
            }
        }))
        .pipe(newer(path.build.img))
        //.pipe(webp({ quality: 50 })) не работает
        .pipe(gulp.dest(path.build.img))


    //
    .pipe(gulp.src(path.src.img, {
        encoding: false
    }))

    .pipe(newer(path.build.img))

    .pipe(imagemin([
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),

        ], {
            verbose: true
        }

    ))

    // .pipe(gulp.dest("./public/js"))
    .pipe(gulp.dest(path.build.img))

    .pipe(browserSync.stream());
}


// Обработка шрифтов
const fonts = () => {

    return gulp.src(path.src.fonts)
        //return gulp.src("./src/scss/style.css")
        //return gulp.src(["./src/js/index.js", "./src/js/2.js"])
        //return gulp.src(["./src/js/components/popup.js", "./src/js/components/slider.js", "./src/js/index.js", "./src/js/2.js"])

    .pipe(plumber({
        errorHandler: function(err) {
            notify.onError({
                title: "Ошибка в fonts",
                message: "<%= error.message %>"
            })(err);
        }
    }))

    .pipe(newer(path.build.fonts))
        .pipe(gulp.dest(path.build.fonts))
        .pipe(browserSync.stream());
}


const clear = () => {
    // return del("./public")
    return del(path.clean)
}


//

function server() {

    browserSync.init({
        server: {
            //baseDir: "./public"
            baseDir: distPath
        },
        port: 3000,
        notify: false
    });
}


// отслеживание
function watcher() {

    //gulp.watch("./src/html/**/*.html", html);
    gulp.watch(path.watch.html, html);
    //gulp.watch(path.watch.html).on('change', browserSync.reload); если нет функции html
    gulp.watch(path.src.css, css);
    gulp.watch(path.src.js, js);
    gulp.watch(path.src.img, img);
    gulp.watch(path.src.fonts, fonts);

}

const dev = gulp.series(clear, html, img, fonts, css, js, gulp.parallel(watcher, server));


exports.html = html;
exports.css = css;
exports.js = js;
exports.img = img;
exports.fonts = fonts;
exports.watcher = watcher;
exports.clear = clear;
exports.server = server;
exports.dev = dev;

exports.default = dev;