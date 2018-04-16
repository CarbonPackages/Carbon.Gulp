"use strict";

if (!config.tasks.jsLint || !config.tasks.mjs) {
    return false;
}

module.exports = require("./jsLintShared")("mjs");
