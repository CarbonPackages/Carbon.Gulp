module.exports = function(extensions, excludeUnderscore = true) {
    if (Array.isArray(extensions) && extensions.length > 1) {
        extensions = `{${extensions.join(',')}}`;
    }

    // Exclude files starting with an underscore
    return `${excludeUnderscore ? '[^_]' : ''}*.${extensions}`;
};
