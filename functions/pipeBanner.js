const getTimestamp = require("./getTimestamp");

module.exports = function(task) {
    return task.key &&
        task.info.banner &&
        task.info.author &&
        task.info.homepage
        ? header(task.info.banner, {
              package: task.key,
              author: task.info.author,
              homepage: task.info.homepage,
              timestamp: getTimestamp()
          })
        : noop();
};
