"use strict";

const FUNCTIONS = require("./functions");

const LIBRARIES = {
    bach: "bach",
    cache: "gulp-memory-cache",
    changed: "gulp-changed",
    chmod: "gulp-chmod",
    colors: "ansi-colors",
    flatten: "gulp-flatten",
    fs: "fs",
    glob: "glob",
    gulp: "gulp",
    header: "gulp-header",
    imagemin: "gulp-imagemin",
    log: "fancy-log",
    merge: "merge-stream",
    noop: "gulp-noop",
    notifier: "node-notifier",
    objectAssignDeep: "object-assign-deep",
    path: "path",
    plumber: "gulp-plumber",
    rename: "gulp-rename",
    size: "gulp-size",
    sourcemaps: "gulp-sourcemaps",
    textTable: "text-table",
    yaml: "js-yaml",
    handleErrors: "./handleErrors"
};

for (const KEY in LIBRARIES) {
    global[KEY] = require(LIBRARIES[KEY]);
}

global.env = require("minimist")(process.argv.slice(2));

global.mode = {
    beautify: env.beautify || env.b ? true : false,
    minimize: env.debug || env.d ? false : true,
    maps: env.nomaps || env.n || env.carbon ? false : true,
    debug: env.debug || env.d ? true : false,
    test: env.carbon ? true : false
};

global.config = FUNCTIONS.readYaml(
    mode.test ? "./config.yaml" : "./Build/Gulp/config.yaml"
);

global.browserSync = null;

global.flags = {
    "--b, --beautify": " Beautify and dont't compress files",
    "--d, --debug": " Files dont't get compressed",
    "--n, --nomaps": " Don't write sourcemaps"
};

global.gulpIcons = {
    error: path.join(__dirname, "assets/gulp-error.png"),
    warning: path.join(__dirname, "assets/gulp-warning.png"),
    normal: path.join(__dirname, "assets/gulp.png")
};

global.getTimestamp = FUNCTIONS.getTimestamp;
global.getExtensions = FUNCTIONS.getExtensions;
global.notifyText = FUNCTIONS.notifyText;

// Overwrite Config with an external files
FUNCTIONS.mergeConfigAndLoadTasks();
