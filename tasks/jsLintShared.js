"use strict";

const FUNCTIONS = require("../functions");
const ESLINT = require("gulp-eslint");

function getConfig(taskName) {
    const PACKAGES_CONFIG = [];
    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];

        if (CONFIG.tasks.jsLint) {
            PACKAGES_CONFIG.push({
                key: KEY
                    ? KEY
                    : CONFIG.info.package
                        ? CONFIG.info.package
                        : false,
                watch: FUNCTIONS.getFilesToWatch(taskName, CONFIG, KEY)
            });
        }
    }

    return PACKAGES_CONFIG;
}

function jsLint(taskName) {
    const PACKAGES_CONFIG = getConfig(taskName);

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

module.exports = jsLint;
