"use strict";

if (!config.tasks.scssLint) {
    return false;
}

const func = require("../functions");
const stylelint = require("gulp-stylelint");
const filesToWatch = func.getFilesToWatch("css");

function scssLint(callback) {
    return gulp
        .src(filesToWatch)
        .pipe(plumber(handleErrors))
        .pipe(
            stylelint({
                reporters: [{ formatter: "string", console: true }]
            })
        );
}

module.exports = scssLint;
