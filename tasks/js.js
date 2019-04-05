function getTask() {
    return require('./jsRenderShared')('js');
}

module.exports = exportTask('js', getTask);
