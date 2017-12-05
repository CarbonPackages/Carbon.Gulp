"use strict";

if (!config.tasks.compress || !config.tasks.compress.zopfli) {
    return false;
}

const zopfli = require("gulp-zopfli");

let src = path.join(config.root.base, config.root.dest, "/**/*.{js,css,svg,html}");

function compressZopfli() {
    return gulp
        .src(src)
        .pipe(zopfli(config.tasks.compress.zopfli))
        .pipe(
            gulp.dest(function(file) {
                return file.base;
            })
        );
}

module.exports = compressZopfli;
