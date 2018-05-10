"use strict";

if (!config.tasks.compress || !config.tasks.compress.brotli) {
    return false;
}

const BROTLI = require("gulp-brotli");

let paths = [];

for (const KEY in config.packages) {
    const CONFIG = config.packages[KEY];
    if (CONFIG.tasks.compress && CONFIG.tasks.compress.brotli) {
        paths = paths.concat(
            path.join(
                CONFIG.root.base,
                KEY,
                CONFIG.root.dest,
                "/**/*.{js,css,svg,html}"
            )
        );
    }
}

function compressBrotli() {
    return gulp
        .src(paths)
        .pipe(BROTLI.compress(config.tasks.compress.brotli))
        .pipe(
            gulp.dest(function(file) {
                return file.base;
            })
        );
}

module.exports = compressBrotli;
