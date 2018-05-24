function getConfig() {
    const TASK_CONFIG = [];
    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];
        const IMAGES_CONFIG = CONFIG.tasks.images;
        const IMAGEMIN_CONFIG = {
            gifsicle: {},
            jpegtran: {},
            optipng: {},
            svgo: {}
        };
        try {
            IMAGEMIN_CONFIG.gifsicle =
                CONFIG.tasks.css.postcss.imagemin.gifsicle;
        } catch (error) {}
        try {
            IMAGEMIN_CONFIG.jpegtran =
                CONFIG.tasks.css.postcss.imagemin.jpegtran;
        } catch (error) {}
        try {
            IMAGEMIN_CONFIG.optipng = CONFIG.tasks.css.postcss.imagemin.optipng;
        } catch (error) {}
        try {
            IMAGEMIN_CONFIG.svgo = CONFIG.tasks.css.postcss.imagemin.svgo;
        } catch (error) {}

        if (IMAGES_CONFIG) {
            TASK_CONFIG.push({
                imagemin: IMAGEMIN_CONFIG,
                key: KEY
                    ? KEY
                    : CONFIG.info.package
                        ? CONFIG.info.package
                        : false,
                src: path.join(
                    CONFIG.root.base,
                    KEY,
                    CONFIG.root.src,
                    IMAGES_CONFIG.src,
                    "/**",
                    getExtensions(IMAGES_CONFIG.extensions)
                ),
                dest: path.join(
                    CONFIG.root.base,
                    KEY,
                    CONFIG.root.dest,
                    IMAGES_CONFIG.dest
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
                            imagemin.jpegtran(task.imagemin.jpegtran),
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
                .pipe(sizeOutput(task.key, "Optimize Images", false));
        })
    );
}

module.exports = exportTask("optimizeImages", getTask);
