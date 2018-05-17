"use strict";

if (!config.tasks.jsLint || !config.tasks.js) {
    return false;
}

module.exports = () => require("./jsLintShared")("js");
