function getPaths(taskName) {
    let paths = [];
    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];
        if (CONFIG.tasks.compress && CONFIG.tasks.compress[taskName]) {
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
    return paths;
}

function getTask() {
    return merge(
        ["brotli", "zopfli"].map(taskName => {
            if (config.tasks.compress && config.tasks.compress[taskName]) {
                const paths = getPaths(taskName);
                const gulpPackage = require(`gulp-${taskName}`);
                const compressor =
                    typeof gulpPackage == "function"
                        ? gulpPackage
                        : gulpPackage.compress;

                return gulp
                    .src(paths)
                    .pipe(compressor(config.tasks.compress[taskName]))
                    .pipe(
                        gulp.dest(function(file) {
                            return file.base;
                        })
                    );
            } else {
                return callback;
            }
        })
    );
}

module.exports = exportTask("compress", getTask);
