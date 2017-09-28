"use strict";

if (!config.tasks.compress) {
    return false;
}

const zopfli = require("gulp-zopfli");

let src = path.join(config.root.base, config.root.dest, "/**/*.{js,css}");

function compressZopfli() {
    return gulp
        .src(src)
        .pipe(zopfli())
        .pipe(
            gulp.dest(function(file) {
                return file.base;
            })
        );
}

module.exports = compressZopfli;
