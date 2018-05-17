"use strict";

if (!config.tasks.js) {
    return false;
}

module.exports = () => require("./jsRenderShared")("js");
