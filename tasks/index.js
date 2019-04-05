let task = {};

for (const TASK_NAME of [
    'clean',
    'css',
    'fonts',
    'images',
    'js',
    'optimizeImages',
    'optimizeSvg',
    'showConfig',
    'static',
    'svgSprite'
]) {
    let func = require(`./${TASK_NAME}`);
    if (typeof func !== 'function') {
        func = callbackFunc;
    }
    task[TASK_NAME] = func;
}

for (const TASK_WITH_TIMEOUT of ['scss']) {
    let func = require(`./${TASK_WITH_TIMEOUT}`);
    if (typeof func !== 'function') {
        task[TASK_WITH_TIMEOUT] = callbackFunc;
    } else {
        task[TASK_WITH_TIMEOUT] = bach.series(func, callbackTimeout);
    }
}

task.info = callback => {
    let content = [];

    if (config.info.homepage) {
        content.push(['  Homepage', ':', config.info.homepage]);
    }
    if (config.info.author) {
        content.push(['  Author', ':', config.info.author]);
    }

    if (content.length) {
        let table = textTable(content, { align: ['r', 'c', 'l'] });
        log(`\n\n${colors.dim(table)}\n\n`);
    }
    callback();
};

gulp.task('showConfig', task.showConfig);
gulp.task('showConfig').description = 'Show the merged configuration';
gulp.task('showConfig').flags = {
    '--p, --path': ` Pass path from the json file to reduce output. Slash ("/") seperated`
};

if (config.tasks.css) {
    gulp.task('css', bach.series(task.scss, task.css));
    gulp.task('css').description = 'Render CSS Files';
    gulp.task('css').flags = flags;
}

if (config.tasks.scss) {
    gulp.task('scss', task.scss);
    gulp.task('scss').description =
        'Render _all.scss, _allsub.scss and _allFusion.scss Files';
}

if (config.tasks.js) {
    gulp.task('js', task.js);
    gulp.task('js').description = 'Render Javascript Files';
    gulp.task('js').flags = flags;
}

if (config.tasks.images && config.tasks.optimizeImages) {
    gulp.task('optimizeImages', task.optimizeImages);
    gulp.task('optimizeImages').description =
        'Optimize images and overwrite them in the public folder';
}

if (config.tasks.svgSprite) {
    gulp.task('sprite', task.svgSprite);
    gulp.task('sprite').description = 'Create SVG Sprite';
}

if (config.tasks.optimizeSvg) {
    gulp.task('optimizeSvg', task.optimizeSvg);
    gulp.task('optimizeSvg').description = 'Optimize SVGs and overwrite them';
}

// Build Task
task.build = bach.series(
    task.clean,
    task.info,
    bach.parallel(
        task.scss,
        task.fonts,
        task.images,
        task.static,
        task.svgSprite
    ),
    bach.parallel(task.css, task.js)
);

gulp.task('build', task.build);
gulp.task('build').description = `${colors.inverse(
    ' Generates all '
)} Assets, Javascript and CSS files`;

gulp.task('build').flags = flags;

task.reload = function(done) {
    if (browserSync) {
        browserSync.reload();
    }
    done();
};

// Watch
task.watch = () => {
    const WATCH_TASK = ['css', 'js', 'fonts', 'images', 'static', 'svgSprite'];

    if (browserSync) {
        browserSync.init(config.global.browserSync);
    }

    function watchTask(taskName, filesToWatch) {
        if (
            taskName &&
            filesToWatch &&
            filesToWatch.length &&
            config.tasks[taskName]
        ) {
            switch (taskName) {
                case 'css':
                    gulp.watch(filesToWatch, task.css);
                    break;
                case 'js':
                    gulp.watch(filesToWatch, bach.series(task.js, task.reload));
                    break;
                default:
                    gulp.watch(filesToWatch, task[taskName]).on(
                        'change',
                        cache.update(`${task.key}${taskName}`)
                    );
            }
        }
    }

    const WATCH_KEY = config.global.mergeConfigFromPackages ? '**' : '';
    WATCH_TASK.forEach(taskName => {
        let filesToWatch = [];
        for (const KEY in config.packages) {
            const CONFIG = config.packages[KEY];
            filesToWatch = filesToWatch.concat(
                getFilesToWatch(taskName, CONFIG, WATCH_KEY)
            );
        }
        watchTask(taskName, filesToWatch);
    });

    log(colors.dim('\n\n     Watching source files for changes\n\n'));
};

gulp.task('watch', task.watch);
gulp.task('watch').description = 'Watch files and regenereate them';

// Default Task
gulp.task('default', gulp.series('build', 'watch'));
gulp.task('default').description = `${colors.inverse(
    ' Generates all '
)} Assets, Javascript and CSS files & ${colors.inverse(' watch them ')}`;

gulp.task('default').flags = flags;

function setPipelineEnvironment(callback) {
    global.mode.pipeline = true;
    callback();
}

if (config.tasks.pipeline && typeof config.tasks.pipeline == 'object') {
    let series = gulp.series(
        setPipelineEnvironment,
        config.tasks.pipeline.filter(task => !!task[task] || task == 'build')
    );
    gulp.task('pipeline', series);
    gulp.task('pipeline').description = 'Make files production ready';
}

if (mode.test) {
    const test = require('./test');
    gulp.task(
        'test',
        bach.series(
            task.build,
            bach.series(task.optimizeImages, callbackTimeout),
            bach.series(task.optimizeSvg, callbackTimeout),
            test
        )
    );
}
