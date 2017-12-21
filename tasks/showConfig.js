"use strict";

function showConfig(callback) {
    let prettyjson = require("prettyjson");
    let options = {
        inlineArrays: true
    };
    let path = util.env.path || util.env.p;
    let output = config;
    let render = true;
    let headline = `This is the ${util.colors.inverse(
        ` complete `
    )} merged configuration`;

    if (path) {
        path.split("/").every(part => {
            if (part) {
                if (typeof output[part] == "undefined") {
                    render = false;
                    headline = `There is no configuration for ${util.colors.inverse(
                        ` ${path} `
                    )}`;
                } else {
                    output = output[part];
                }
            }
            return render;
        });

        if (render) {
            headline = `This is the merged configuration for ${util.colors.inverse(
                ` ${path} `
            )}`;
        }
    }

    render = render ? `${prettyjson.render(output, options)}\n\n` : "";

    util.log(`\n\n ${util.colors.white(headline)}\n\n${render}`);
    return callback();
}

module.exports = showConfig;
