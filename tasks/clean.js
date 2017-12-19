"use strict";

if (!config.tasks.clean) {
    return false;
}

const DEL = require("del");
let paths = [];

for (let key in config.packages) {
    const CONFIG = config.packages[key];
    const CLEAN = CONFIG.tasks.clean;

    if (Array.isArray(CLEAN)) {
        paths = paths.concat(CLEAN.map(entry =>
            path.join(CONFIG.root.base, key, CONFIG.root.dest, entry)
        ));
    } else if (typeof CLEAN == "string") {
        paths = paths.concat(path.join(CONFIG.root.base, key, CONFIG.root.dest, CLEAN));
    }
}

function clean(callback) {
    return DEL(paths, { force: true }, callback);
}

module.exports = clean;
