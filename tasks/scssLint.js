"use strict";

if (!config.tasks.scssLint) {
    return false;
}

const PACKAGES_CONFIG = [];
const FUNCTIONS = require("../functions");
const STYLELINT = require("gulp-stylelint");

for (let key in config.packages) {
    const CONFIG = config.packages[key];

    if (CONFIG.tasks.scssLint) {
        PACKAGES_CONFIG.push({
            key: key,
            watch: FUNCTIONS.getFilesToWatch("css", CONFIG, key)
        });
    }
}

function scssLint(callback) {
    let tasks = PACKAGES_CONFIG.map(packageConfig => {
        return gulp
            .src(packageConfig.watch)
            .pipe(plumber(handleErrors))
            .pipe(STYLELINT({
                reporters: [{ formatter: "string", console: true }]
            }))
    });

    return merge(tasks);
}

module.exports = scssLint;
