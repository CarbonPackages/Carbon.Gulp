const readYaml = require('./readYaml');
const mergeConfigAndLoadTasks = require('./mergeConfigAndLoadTasks');
const LIBRARIES = {
    bach: 'bach',
    cache: 'gulp-memory-cache',
    changed: 'gulp-changed',
    chmod: 'gulp-chmod',
    colors: 'ansi-colors',
    flatten: 'gulp-flatten',
    fs: 'fs',
    glob: 'glob',
    gulp: 'gulp',
    header: 'gulp-header',
    imagemin: 'gulp-imagemin',
    log: 'fancy-log',
    merge: 'merge-stream',
    noop: 'gulp-noop',
    notifier: 'node-notifier',
    objectAssignDeep: 'object-assign-deep',
    path: 'path',
    plumber: 'gulp-plumber',
    rename: 'gulp-rename',
    sourcemaps: 'gulp-sourcemaps',
    textTable: 'text-table',
    yaml: 'js-yaml',
    callbackFunc: './callbackFunc',
    callbackTimeout: './callbackTimeout',
    exportTask: './exportTask',
    getExtensions: './getExtensions',
    getFilesToWatch: './getFilesToWatch',
    getSrcPath: './getSrcPath',
    handleErrors: './handleErrors',
    pipeBanner: './pipeBanner',
    sizeOutput: './sizeOutput'
};

for (const KEY in LIBRARIES) {
    global[KEY] = require(LIBRARIES[KEY]);
}

global.env = require('minimist')(process.argv.slice(2));

global.mode = {
    beautify: env.beautify || env.b ? true : false,
    minimize: env.debug || env.d ? false : true,
    maps: env.nomaps || env.n || env.carbon ? false : true,
    debug: env.debug || env.d ? true : false,
    test: env.carbon ? true : false
};

global.config = readYaml(
    mode.test ? './config.yaml' : './Build/Gulp/config.yaml'
);

global.browserSync = null;

global.flags = {
    '--b, --beautify': " Beautify and dont't compress files",
    '--d, --debug': " Files dont't get compressed",
    '--n, --nomaps': " Don't write sourcemaps"
};

const ICON_PATH = '../assets/';

global.gulpIcons = {
    error: path.join(__dirname, ICON_PATH, 'gulp-error.png'),
    warning: path.join(__dirname, ICON_PATH, 'gulp-warning.png'),
    normal: path.join(__dirname, ICON_PATH, 'gulp.png')
};

try {
    const VERSION = {
        system: require('../package.json').version,
        root: require('../../../package.json').version
    };

    if (VERSION.system == VERSION.root) {
        log(`
                Carbon.Gulp (${VERSION.system})
        `);
    } else {
        log(
            colors.red(
                `
                package.json file has not the same version (${
                    VERSION.root
                }) as Carbon.Gulp (${VERSION.system})
                `
            )
        );
    }
} catch (e) {}

// Overwrite Config with an external files
mergeConfigAndLoadTasks();
