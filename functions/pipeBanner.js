function getTimestamp() {
    const NOW = new Date();
    let value = NOW.getFullYear().toString();
    value += '-';
    value += (NOW.getMonth() < 9 ? '0' : '') + (NOW.getMonth() + 1).toString();
    value += '-';
    value += (NOW.getDate() < 10 ? '0' : '') + NOW.getDate().toString();
    value += ' ';
    value += (NOW.getHours() < 10 ? '0' : '') + NOW.getHours().toString();
    value += ':';
    value += (NOW.getMinutes() < 10 ? '0' : '') + NOW.getMinutes().toString();
    return value;
}

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
