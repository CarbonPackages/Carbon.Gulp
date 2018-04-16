"use strict";

if (!config.tasks.compress || !config.tasks.compress.zopfli) {
    return false;
}

const ZOPFLI = require("gulp-zopfli");

let paths = [];

for (let key in config.packages) {
    const CONFIG = config.packages[key];
    if (CONFIG.tasks.compress && CONFIG.tasks.compress.zopfli) {
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

function compressZopfli() {
    return gulp
        .src(paths)
        .pipe(ZOPFLI(config.tasks.compress.zopfli))
        .pipe(
            gulp.dest(function(file) {
                return file.base;
            })
        );
}

module.exports = compressZopfli;
