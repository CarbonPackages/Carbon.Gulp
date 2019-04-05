function getConfig() {
    const TASK_CONFIG = [];
    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];
        const IMAGES_CONFIG = CONFIG.tasks.images;

        if (IMAGES_CONFIG) {
            TASK_CONFIG.push({
                key: KEY || CONFIG.info.package || false,
                src: path.join(
                    CONFIG.root.base || '',
                    KEY,
                    CONFIG.root.src || '',
                    IMAGES_CONFIG.src || '',
                    '**',
                    getExtensions(IMAGES_CONFIG.extensions)
                ),
                dest: path.join(
                    CONFIG.root.base || '',
                    KEY,
                    CONFIG.root.dest || '',
                    IMAGES_CONFIG.dest || ''
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
                    since: cache.lastMtime(`${task.key}images`)
                })
                .pipe(plumber(handleErrors))
                .pipe(cache(`${task.key}images`))
                .pipe(changed(task.dest)) // Ignore unchanged files
                .pipe(flatten())
                .pipe(chmod(config.global.chmod))
                .pipe(plumber.stop())
                .pipe(gulp.dest(task.dest))
                .pipe(sizeOutput(task.key, 'Images', true, false));
        })
    );
}

module.exports = exportTask('images', getTask);
