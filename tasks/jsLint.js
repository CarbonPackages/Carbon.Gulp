function getTask() {
    return require("./jsLintShared")("js");
}

module.exports = exportTask("jsLint", getTask, !!config.tasks.js);
