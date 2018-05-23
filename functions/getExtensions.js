module.exports = function(extensions, excludeUnderscore = true, prepend = "") {
    if (Array.isArray(extensions) && extensions.length > 1) {
        extensions = `{${extensions.join(",")}}`;
    }
    // Exclude files starting with an underscore
    return `/${prepend}${excludeUnderscore ? "[^_]" : ""}*.${extensions}`;
};
