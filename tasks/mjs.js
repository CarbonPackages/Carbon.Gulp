"use strict";

if (!config.tasks.mjs) {
    return false;
}

module.exports = require("./jsRenderShared")("mjs");
