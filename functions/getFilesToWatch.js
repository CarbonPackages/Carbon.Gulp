const sureArray = require('./sureArray');
const getExtensions = require('./getExtensions');

module.exports = function(taskName, configuration = config, key = '') {
    const TASK_CONF = configuration.tasks[taskName];
    const WATCH_CONFIG = sureArray(configuration.root.watch);
    const DONT_WATCH = sureArray(configuration.root.dontWatch);

    let filesToWatch = [];

    if (TASK_CONF && WATCH_CONFIG && WATCH_CONFIG.length) {
        if (TASK_CONF.watchOnlySrc) {
            filesToWatch.push(
                path.join(
                    configuration.root.base || '',
                    key,
                    configuration.root.src || '',
                    TASK_CONF.src || '',
                    '/**',
                    getExtensions(TASK_CONF.extensions, false)
                )
            );
        } else {
            filesToWatch = WATCH_CONFIG.map(value =>
                path.join(
                    configuration.root.base || '',
                    key,
                    value,
                    getExtensions(TASK_CONF.extensions, false)
                )
            );
        }

        if (DONT_WATCH && DONT_WATCH.length) {
            DONT_WATCH.forEach(value => {
                if (value) {
                    filesToWatch.push(
                        '!' +
                            path.join(
                                configuration.root.base || '',
                                key,
                                value,
                                getExtensions(TASK_CONF.extensions, false)
                            )
                    );
                }
            });
        }

        if (taskName === 'css') {
            WATCH_CONFIG.forEach(value => {
                filesToWatch.push(
                    '!' +
                        path.join(
                            configuration.root.base || '',
                            key,
                            value,
                            '**/_{all,allsub}.scss'
                        )
                );
            });
        }
    }
    return filesToWatch;
};
