"use strict";

if (!config.tasks.compress || !config.tasks.compress.zopfli) {
    return false;
}

const ZOPFLI = require("gulp-zopfli");

let paths = [];

for (const KEY in config.packages) {
    const CONFIG = config.packages[KEY];
    if (CONFIG.tasks.compress && CONFIG.tasks.compress.zopfli) {
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
