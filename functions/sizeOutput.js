const size = require("gulp-size");

module.exports = (key, title, showFiles = true) => {
    return size({
        title: `${key ? `${key} ` : ""}${title}:`,
        showFiles: showFiles
    });
};
