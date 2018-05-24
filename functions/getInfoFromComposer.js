module.exports = function(path = "") {
    try {
        let composer = require(`../../../${path}composer.json`);

        config.info.author = composer.author
            ? composer.author
            : config.info.author;
        config.info.homepage = composer.homepage
            ? composer.homepage
            : config.info.homepage;
    } catch (error) {}
};
