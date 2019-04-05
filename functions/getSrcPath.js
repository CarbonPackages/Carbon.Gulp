function checkFile(file) {
    let files = {
        inline: [],
        extern: []
    };

    if (typeof file == 'string') {
        file = [file];
    }
    if (Array.isArray(file)) {
        file.forEach(item => {
            files[
                item.startsWith('Inline.') || item.includes('.Inline.')
                    ? 'inline'
                    : 'extern'
            ].push(item);
        });
    }

    return {
        inline: joinFiles(files.inline),
        extern: joinFiles(files.extern)
    };
}

function joinFiles(files) {
    return files.length
        ? files.length > 1
            ? `{${files.join(',')}}`
            : files[0]
        : '';
}

module.exports = function({
    basePath,
    extensions,
    inline = false,
    file = null
}) {
    if (Array.isArray(extensions) && extensions.length > 1) {
        extensions = `{${extensions.join(',')}}`;
    }
    let excludeUnderscore = '[^_]';

    if (file) {
        let checkFiles = checkFile(file);
        let files = inline ? checkFiles.inline : checkFiles.extern;
        return files ? path.join(basePath, files) : false;
    }

    if (inline) {
        return path.join(
            basePath,
            `{Inline,${excludeUnderscore}*.Inline}.${extensions}`
        );
    }

    return [
        path.join(basePath, `${excludeUnderscore}*.${extensions}`),
        '!' + path.join(basePath, `Inline.${extensions}`),
        '!' + path.join(basePath, `*.Inline.${extensions}`)
    ];
};
