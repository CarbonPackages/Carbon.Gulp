const readYaml = require('./readYaml');

function mergeRootConfig(filename) {
    try {
        const configFromRoot = readYaml(filename);
        if (configFromRoot) {
            objectAssignDeep(config, configFromRoot);
            log(`Loaded config file ${colors.red(filename)} from root`);
        }
    } catch (error) {}
}

function mergePackageConfig(path) {
    let gulpYamlFiles = [];
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(folder => {
            if (!folder.startsWith('.') && !folder.startsWith('_')) {
                const GULP_YAML_PATH = `${path}/${folder}/Configuration/Gulp.yaml`;
                if (fs.existsSync(GULP_YAML_PATH)) {
                    gulpYamlFiles.push({
                        package: folder,
                        base: path,
                        yaml: GULP_YAML_PATH
                    });
                }
            }
        });
    }
    gulpYamlFiles.forEach(file => {
        try {
            const CONFIG = {
                DEFAULT: {
                    info: config.info || false,
                    root: config.root || false,
                    tasks: config.tasks || false
                },
                BASE: {
                    root: {
                        base: `./${file.base}/`
                    }
                },
                PACKAGE: config.packages[file.package] || {},
                YAML: readYaml(file.yaml)
            };

            config.packages[file.package] = objectAssignDeep(
                {},
                CONFIG.DEFAULT,
                CONFIG.BASE,
                CONFIG.PACKAGE,
                CONFIG.YAML
            );

            log(
                `Loaded config file ${colors.red(
                    'Gulp.yaml'
                )} from the package ${colors.red(file.package)}`
            );
        } catch (error) {
            handleErrors({
                name: file.package,
                plugin: 'Error in merging configuration',
                message: 'There is an error in the Gulp.yaml file'
            });
        }
    });
}

function getInfoFromComposer(path = '') {
    try {
        let composer = require(`../../../${path}composer.json`);

        config.info.author =
            composer.author || composer.extra.author || config.info.author;
        config.info.homepage = composer.homepage || config.info.homepage;
    } catch (error) {}
}

module.exports = function() {
    getInfoFromComposer();

    mergeRootConfig('gulp_global.yaml');
    mergeRootConfig('gulp_local.yaml');

    if (mode.test) {
        mergeRootConfig('gulp_test.yaml');
    }

    if (
        config.global &&
        config.global.mergeConfigFromPackages &&
        config.global.mergeConfigFromPackages.length
    ) {
        config.global.mergeConfigFromPackages.forEach(folder => {
            mergePackageConfig(folder);
        });
    } else {
        config.packages[''] = objectAssignDeep(
            {},
            {
                info: config.info || false,
                root: config.root || false,
                tasks: config.tasks || false
            }
        );
    }

    if (config.global.browserSync.proxyRootFolder) {
        let prepend =
            typeof config.global.browserSync.proxyRootFolder == 'string'
                ? config.global.browserSync.proxyRootFolder
                : '';
        config.global.browserSync.proxy =
            typeof config.global.browserSync.proxy == 'string'
                ? prepend + config.global.browserSync.proxy
                : prepend + path.basename(path.join(__dirname, '../../..'));
    }

    if (config.global.browserSync.enable) {
        delete config.global.browserSync.enable;
        browserSync = require('browser-sync').create();
    }

    require('./../tasks');
};
