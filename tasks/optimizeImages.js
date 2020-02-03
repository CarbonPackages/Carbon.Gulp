function getConfig() {
    const TASK_CONFIG = [];
    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];
        const IMAGES_CONFIG = CONFIG.tasks.images;
        const IMAGEMIN_CONFIG = {
            gifsicle: {},
            mozjpeg: {},
            optipng: {},
            svgo: {}
        };
        try {
            IMAGEMIN_CONFIG.gifsicle = CONFIG.tasks.optimizeImages.gifsicle;
        } catch (error) {}
        try {
            IMAGEMIN_CONFIG.mozjpeg = CONFIG.tasks.optimizeImages.mozjpeg;
        } catch (error) {}
        try {
            IMAGEMIN_CONFIG.optipng = CONFIG.tasks.optimizeImages.optipng;
        } catch (error) {}
        try {
            IMAGEMIN_CONFIG.svgo = CONFIG.tasks.optimizeImages.svgo;
        } catch (error) {}

        if (IMAGES_CONFIG) {
            TASK_CONFIG.push({
                imagemin: IMAGEMIN_CONFIG,
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
    const imageConfig = getConfig();
    return merge(
        imageConfig.map(task => {
            return gulp
                .src(task.src)
                .pipe(plumber(handleErrors))
                .pipe(
                    imagemin(
                        [
                            imagemin.gifsicle(task.imagemin.gifsicle),
                            imagemin.mozjpeg(task.imagemin.mozjpeg),
                            imagemin.optipng(task.imagemin.optipng),
                            imagemin.svgo(task.imagemin.svgo)
                        ],
                        {
                            verbose: true
                        }
                    )
                )
                .pipe(chmod(config.global.chmod))
                .pipe(plumber.stop())
                .pipe(gulp.dest(task.dest))
                .pipe(sizeOutput(task.key, 'Optimize Images', true, false));
        })
    );
}

module.exports = exportTask('optimizeImages', getTask);
