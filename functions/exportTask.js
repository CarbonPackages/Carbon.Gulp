const customTask = require("./customTask");

module.exports = function(name, getTask, additionalCheck = true) {
    if (config.tasks[name] && additionalCheck) {
        const task = config.tasks[name]["custom"] ? customTask(name) : getTask;
        return task;
    } else {
        return callbackFunc;
    }
};
