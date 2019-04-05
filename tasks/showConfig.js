function getTask(callback) {
    const PRETTYJSON = require('prettyjson');
    let options = {
        inlineArrays: true
    };
    let path = env.path || env.p;
    let output = config;
    let render = true;
    let headline = `This is the ${colors.inverse(
        ` complete `
    )} merged configuration`;

    if (path) {
        path.split('/').every(part => {
            if (part) {
                if (typeof output[part] == 'undefined') {
                    render = false;
                    headline = `There is no configuration for ${colors.inverse(
                        ` ${path} `
                    )}`;
                } else {
                    output = output[part];
                }
            }
            return render;
        });

        if (render) {
            headline = `This is the merged configuration for ${colors.inverse(
                ` ${path} `
            )}`;
        }
    }

    render = render ? `${PRETTYJSON.render(output, options)}\n\n` : '';
    log(`\n\n ${colors.white(headline)}\n\n${render}`);
    return callback();
}

module.exports = exportTask('showConfig', getTask);
