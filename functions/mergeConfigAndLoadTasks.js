const getInfoFromComposer = require("./getInfoFromComposer");
const mergeRootConfig = require("./mergeRootConfig");
const mergePackageConfig = require("./mergePackageConfig");

module.exports = function() {
    getInfoFromComposer();

    mergeRootConfig("gulp_global.yaml");
    mergeRootConfig("gulp_local.yaml");

    if (mode.test) {
        mergeRootConfig("gulp_test.yaml");
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
        config.packages[""] = objectAssignDeep(
            {},
            {
                info: config.info ? config.info : false,
                root: config.root ? config.root : false,
                tasks: config.tasks ? config.tasks : false
            }
        );
    }

    if (config.global.browserSync.proxyRootFolder) {
        let prepend =
            typeof config.global.browserSync.proxyRootFolder == "string"
                ? config.global.browserSync.proxyRootFolder
                : "";
        config.global.browserSync.proxy =
            prepend + path.basename(path.join(__dirname, "../../.."));
    }

    if (config.global.browserSync.enable) {
        delete config.global.browserSync.enable;
        browserSync = require("browser-sync").create();
    }

    require("./../tasks");
};
