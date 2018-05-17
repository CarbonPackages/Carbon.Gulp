"use strict";

if (!config.tasks.jsLint) {
    return false;
}

const PACKAGES_CONFIG = [];
const FUNCTIONS = require("../functions");
const ESLINT = require("gulp-eslint");

for (const KEY in config.packages) {
    const CONFIG = config.packages[KEY];

    if (CONFIG.tasks.jsLint) {
        PACKAGES_CONFIG.push({
            key: KEY ? KEY : CONFIG.info.package ? CONFIG.info.package : false,
            watch: FUNCTIONS.getFilesToWatch("js", CONFIG, KEY)
        });
    }
}

function lint() {
    let tasks = PACKAGES_CONFIG.map(packageConfig => {
        return gulp
            .src(packageConfig.watch)
            .pipe(plumber(handleErrors))
            .pipe(ESLINT())
            .pipe(
                ESLINT.results(results => {
                    notifyText({
                        warnings: results.warningCount,
                        errors: results.errorCount,
                        subtitle: `${
                            packageConfig.key ? `${packageConfig.key} ` : ""
                        }ES Lint`
                    });
                })
            )
            .pipe(ESLINT.format())
            .pipe(plumber.stop());
    });

    return merge(tasks);
}

module.exports = lint;
