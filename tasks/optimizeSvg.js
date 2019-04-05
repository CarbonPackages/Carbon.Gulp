function getConfig() {
    const TASK_CONFIG = [];
    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];
        const CONFIG_OPTIMIZE_SVG = CONFIG.tasks.optimizeSvg;

        if (
            CONFIG_OPTIMIZE_SVG &&
            (CONFIG_OPTIMIZE_SVG == 'src' || CONFIG_OPTIMIZE_SVG == 'dest')
        ) {
            let configuration = {
                key: KEY || CONFIG.info.package || false,
                src: [
                    path.join(
                        CONFIG.root.base || '',
                        KEY,
                        CONFIG.root[CONFIG_OPTIMIZE_SVG] || '',
                        '**/*.svg'
                    )
                ],
                dest: path.join(
                    CONFIG.root.base || '',
                    KEY,
                    CONFIG.root[CONFIG_OPTIMIZE_SVG] || ''
                ),
                pretty: CONFIG_OPTIMIZE_SVG == 'src' ? true : false
            };

            // we don't want the Sprite to be optimized
            if (CONFIG.tasks.svgSprite) {
                configuration.src.push(
                    path.join(
                        '!' + CONFIG.root.base || '',
                        CONFIG.root.dest || '',
                        CONFIG.tasks.svgSprite.dest || '',
                        CONFIG.tasks.svgSprite.src + '.svg'
                    )
                );
                configuration.src.push(
                    path.join(
                        '!' + CONFIG.root.base || '',
                        CONFIG.root.src || '',
                        CONFIG.root.inlinePath || '',
                        CONFIG.tasks.svgSprite.src + '.svg'
                    )
                );
            }

            TASK_CONFIG.push(configuration);
        }
    }
    return TASK_CONFIG;
}

function getTask() {
    const TASK_CONFIG = getConfig();
    const SVGMIN = require('gulp-svgmin');
    const PRETTY_OPTIONS = {
        js2svg: {
            pretty: true
        }
    };
    return merge(
        TASK_CONFIG.map(task => {
            return gulp
                .src(task.src)
                .pipe(plumber(handleErrors))
                .pipe(task.pretty ? SVGMIN(PRETTY_OPTIONS) : SVGMIN())
                .pipe(chmod(config.global.chmod))
                .pipe(plumber.stop())
                .pipe(gulp.dest(task.dest))
                .pipe(
                    sizeOutput(
                        task.key,
                        'Optimize SVG Images',
                        !task.pretty,
                        false
                    )
                );
        })
    );
}

module.exports = exportTask(
    'optimizeSvg',
    getTask,
    !!(config.tasks.optimizeSvg == 'src' || config.tasks.optimizeSvg == 'dest')
);
