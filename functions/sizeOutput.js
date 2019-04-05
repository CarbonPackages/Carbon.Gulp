const size = require('gulp-size');

module.exports = (key, title, publicFolder = true, showFiles = true) => {
    return size({
        title: `${key ? `${key} › ` : ''}${
            publicFolder ? 'Public ' : 'Private'
        } › ${title} `,
        showFiles: showFiles
    });
};
