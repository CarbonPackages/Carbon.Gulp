function getConfig() {
    TASK_CONFIG = [];
    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];
        const STATIC_CONFIG = CONFIG.tasks.static;

        if (STATIC_CONFIG) {
            TASK_CONFIG.push({
                key: KEY || CONFIG.info.package || false,
                src: path.join(
                    CONFIG.root.base || '',
                    KEY,
                    CONFIG.root.src || '',
                    STATIC_CONFIG.src || '',
                    '**',
                    getExtensions(STATIC_CONFIG.extensions)
                ),
                dest: path.join(
                    CONFIG.root.base || '',
                    KEY,
                    CONFIG.root.dest || '',
                    STATIC_CONFIG.dest || ''
                )
            });
        }
    }
    return TASK_CONFIG;
}

function getTask() {
    const TASK_CONFIG = getConfig();
    return merge(
        TASK_CONFIG.map(task => {
            return gulp
                .src(task.src, {
                    since: cache.lastMtime(`${task.key}static`)
                })
                .pipe(plumber(handleErrors))
                .pipe(cache(`${task.key}static`))
                .pipe(changed(task.dest)) // Ignore unchanged files
                .pipe(chmod(config.global.chmod))
                .pipe(plumber.stop())
                .pipe(gulp.dest(task.dest))
                .pipe(sizeOutput(task.key, 'Static Files', true, false));
        })
    );
}

module.exports = exportTask('static', getTask);
