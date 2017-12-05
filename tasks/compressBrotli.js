"use strict";

if (!config.tasks.compress || !config.tasks.compress.brotli) {
    return false;
}

const brotli = require("gulp-brotli");

let src = path.join(config.root.base, config.root.dest, "/**/*.{js,css,svg,html}");

function compressBrotli() {
    return gulp
        .src(src)
        .pipe(brotli.compress(config.tasks.compress.brotli))
        .pipe(
            gulp.dest(function(file) {
                return file.base;
            })
        );
}

module.exports = compressBrotli;
