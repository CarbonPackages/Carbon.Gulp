module.exports = function(...tasks) {
    tasks.forEach(task => {
        if (!config.tasks[task]) {
            return false;
        }
    });
    return true;
};
