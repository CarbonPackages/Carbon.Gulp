"use strict";

if (!config.tasks.svgSprite) {
    return false;
}

const SVG_SPRITE = require("gulp-svg-sprite");
const PACKAGES_CONFIG = [];

for (let key in config.packages) {
    const CONFIG = config.packages[key];
    const SPRITE_CONFIG = CONFIG.tasks.svgSprite;

    if (SPRITE_CONFIG && SPRITE_CONFIG.config) {
        let config = JSON.stringify(SPRITE_CONFIG.config);
        config = JSON.parse(
            config.replace(/%srcFolderName%/g, SPRITE_CONFIG.src)
        );

        PACKAGES_CONFIG.push({
            key: key,
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
            svgo: SPRITE_CONFIG.svgo,
            config: config
        });
    }
}

function svgSprite() {
    let tasks = PACKAGES_CONFIG.map(packageConfig => {
        let preSprite = gulp
            .src(packageConfig.src, {
                since: cache.lastMtime("svgSprite")
            })
            .pipe(plumber(handleErrors))
            .pipe(
                rename(file => {
                    file.basename = "icon-" + file.basename.toLowerCase();
                })
            )
            .pipe(cache("svgSprite"))
            .pipe(imagemin([imagemin.svgo({ plugins: [packageConfig.svgo] })]));

        let privateTask = packageConfig.inlinePath
            ? preSprite
                  .pipe(SVG_SPRITE(packageConfig.config.private))
                  .pipe(chmod(config.global.chmod))
                  .pipe(gulp.dest(packageConfig.inlinePath))
            : false;

        let svgTasks = [
            preSprite
                .pipe(SVG_SPRITE(packageConfig.config.public))
                .pipe(chmod(config.global.chmod))
                .pipe(gulp.dest(packageConfig.dest))
                .pipe(
                    size({
                        title: `${packageConfig.key} SVG:`,
                        showFiles: true
                    })
                )
        ];

        if (privateTask) {
            svgTasks.unshift(privateTask);
        }

        return merge(svgTasks);
    });
    return merge(tasks);
}

module.exports = svgSprite;
