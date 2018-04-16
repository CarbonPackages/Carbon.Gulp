"use strict";

if (!config.tasks.compress || !config.tasks.compress.brotli) {
    return false;
}

const BROTLI = require("gulp-brotli");

let paths = [];

for (let key in config.packages) {
    const CONFIG = config.packages[key];
    if (CONFIG.tasks.compress && CONFIG.tasks.compress.brotli) {
        paths = paths.concat(
            path.join(
                CONFIG.root.base,
                key,
                CONFIG.root.dest,
                "/**/*.{js,mjs,css,svg,html}"
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
