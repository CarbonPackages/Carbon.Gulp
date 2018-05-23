function getConfig() {
    const TASK_CONFIG = [];
    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];

        if (CONFIG.tasks.scssLint) {
            TASK_CONFIG.push({
                key: KEY
                    ? KEY
                    : CONFIG.info.package
                        ? CONFIG.info.package
                        : false,
                watch: getFilesToWatch("css", CONFIG, KEY)
            });
        }
    }
    return TASK_CONFIG;
}

function stylelintFormatter() {
    return resultList => {
        if (config.global.notifications) {
            resultList
                .filter(result => result.warnings.length)
                .forEach(result => {
                    let errors = result.warnings.filter(
                        warning => warning.severity == "error"
                    ).length;
                    let warnings = result.warnings.filter(
                        warning => warning.severity != "error"
                    ).length;

                    notifyText({
                        title: "Stylelint " + (errors ? "error" : "warning"),
                        subtitle: "Filename: " + path.basename(result.source),
                        errors: errors,
                        warnings: warnings
                    });
                });
        }
        return true;
    };
}

function getTask() {
    const STYLELINT = require("gulp-stylelint");
    const TASK_CONFIG = getConfig();
    const FORMATTER = stylelintFormatter();
    return merge(
        TASK_CONFIG.map(task => {
            return gulp
                .src(task.watch)
                .pipe(plumber(handleErrors))
                .pipe(
                    STYLELINT({
                        failAfterError: false,
                        reporters: [
                            { formatter: "string", console: true },
                            {
                                formatter: FORMATTER
                            }
                        ]
                    })
                )
                .pipe(plumber.stop());
        })
    );
}

module.exports = exportTask("scssLint", getTask, !!config.tasks.css);
