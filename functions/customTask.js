module.exports = function(taskName) {
    return callback =>
        require(`./../../../${config.tasks[taskName]["custom"]}`)(callback);
};
