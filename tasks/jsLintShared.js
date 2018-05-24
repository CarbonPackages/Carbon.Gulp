const ESLINT = require("gulp-eslint");

function getConfig(taskName) {
    const TASK_CONFIG = [];
    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];

        if (CONFIG.tasks.jsLint) {
            TASK_CONFIG.push({
                key: KEY
                    ? KEY
                    : CONFIG.info.package
                        ? CONFIG.info.package
                        : false,
                watch: getFilesToWatch(taskName, CONFIG, KEY)
            });
        }
    }

    return TASK_CONFIG;
}

function jsLint(taskName) {
    const TASK_CONFIG = getConfig(taskName);

    return merge(
        TASK_CONFIG.map(packageConfig => {
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
        })
    );
}

module.exports = jsLint;
