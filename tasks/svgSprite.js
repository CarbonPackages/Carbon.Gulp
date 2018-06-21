function getConfig() {
    const TASK_CONFIG = [];
    for (let key in config.packages) {
        const CONFIG = config.packages[key];
        const SPRITE_CONFIG = CONFIG.tasks.svgSprite;

        if (SPRITE_CONFIG && SPRITE_CONFIG.config) {
            let config = JSON.stringify(SPRITE_CONFIG.config);
            config = JSON.parse(
                config.replace(/%srcFolderName%/g, SPRITE_CONFIG.src)
            );

            TASK_CONFIG.push({
                key: key
                    ? key
                    : CONFIG.info.package
                        ? CONFIG.info.package
                        : false,
                src: path.join(
                    CONFIG.root.base,
                    key,
                    CONFIG.root.src,
                    SPRITE_CONFIG.src,
                    getExtensions(SPRITE_CONFIG.extensions)
                ),
                dest: path.join(
                    CONFIG.root.base,
                    key,
                    CONFIG.root.dest,
                    SPRITE_CONFIG.dest
                ),
                inlinePath: CONFIG.root.inlineAssets
                    ? path.join(
                          CONFIG.root.base,
                          key,
                          CONFIG.root.src,
                          CONFIG.root.inlinePath
                      )
                    : false,
                publicAssets: CONFIG.root.publicAssets,
                svgo: SPRITE_CONFIG.svgo,
                config: config
            });
        }
    }
    return TASK_CONFIG;
}

function getTask() {
    const SVG_SPRITE = require("gulp-svg-sprite");
    const TASK_CONFIG = getConfig();
    return merge(
        TASK_CONFIG.map(task => {
            const PRE_SPRITE = gulp
                .src(task.src, {
                    since: cache.lastMtime(`${task.key}svgSprite`)
                })
                .pipe(plumber(handleErrors))
                .pipe(cache(`${task.key}svgSprite`))
                .pipe(
                    rename(file => {
                        file.basename = "icon-" + file.basename.toLowerCase();
                    })
                )
                .pipe(imagemin([imagemin.svgo({ plugins: [task.svgo] })]));

            const PRIVATE_TASK = task.inlinePath
                ? PRE_SPRITE.pipe(SVG_SPRITE(task.config.private))
                      .pipe(chmod(config.global.chmod))
                      .pipe(plumber.stop())
                      .pipe(gulp.dest(task.inlinePath))
                : false;

            const PUBLIC_TASK = task.publicAssets
                ? PRE_SPRITE.pipe(SVG_SPRITE(task.config.public))
                      .pipe(chmod(config.global.chmod))
                      .pipe(plumber.stop())
                      .pipe(gulp.dest(task.dest))
                      .pipe(sizeOutput(task.key, "SVG Sprite"))
                : false;

            const SVG_TASKS = [];

            if (PRIVATE_TASK) {
                SVG_TASKS.push(PRIVATE_TASK);
            }
            if (PUBLIC_TASK) {
                SVG_TASKS.push(PUBLIC_TASK);
            }

            return merge(SVG_TASKS);
        })
    );
}

module.exports = exportTask("svgSprite", getTask);
