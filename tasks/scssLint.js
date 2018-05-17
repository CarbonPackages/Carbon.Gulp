"use strict";

if (!config.tasks.scssLint || !config.tasks.css) {
    return false;
}

const PACKAGES_CONFIG = [];
const FUNCTIONS = require("../functions");
const STYLELINT = require("gulp-stylelint");

for (const KEY in config.packages) {
    const CONFIG = config.packages[KEY];

    if (CONFIG.tasks.scssLint) {
        PACKAGES_CONFIG.push({
            key: KEY ? KEY : CONFIG.info.package ? CONFIG.info.package : false,
            watch: FUNCTIONS.getFilesToWatch("css", CONFIG, KEY)
        });
    }
}

function scssLint(callback) {
    let tasks = PACKAGES_CONFIG.map(packageConfig => {
        return gulp
            .src(packageConfig.watch)
            .pipe(plumber(handleErrors))
            .pipe(
                STYLELINT({
                    failAfterError: false,
                    reporters: [
                        { formatter: "string", console: true },
                        {
                            formatter: resultList => {
                                if (config.global.notifications) {
                                    resultList
                                        .filter(
                                            result => result.warnings.length
                                        )
                                        .forEach(result => {
                                            let errors = result.warnings.filter(
                                                warning =>
                                                    warning.severity == "error"
                                            ).length;
                                            let warnings = result.warnings.filter(
                                                warning =>
                                                    warning.severity != "error"
                                            ).length;

                                            notifyText({
                                                title:
                                                    "Stylelint " +
                                                    (errors
                                                        ? "error"
                                                        : "warning"),
                                                subtitle:
                                                    "Filename: " +
                                                    path.basename(
                                                        result.source
                                                    ),
                                                errors: errors,
                                                warnings: warnings
                                            });
                                        });
                                }
                                return true;
                            }
                        }
                    ]
                })
            )
            .pipe(plumber.stop());
    });

    return merge(tasks);
}

module.exports = scssLint;
