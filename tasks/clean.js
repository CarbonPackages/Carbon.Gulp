"use strict";

if (!config.tasks.clean) {
    return false;
}

const DEL = require("del");
let assets = [];

for (let key in config.packages) {
    const CONFIG = config.packages[key];
    let entries = CONFIG.tasks.clean;

    if (typeof entries == "string") {
        entries = [entries];
    }

    assets = assets.concat(
        entries.map(entry =>
            path.join(CONFIG.root.base, key, CONFIG.root.dest, entry)
        )
    );

    if (CONFIG.root.inlineAssets) {
        assets.push(
            path.join(
                CONFIG.root.base,
                key,
                CONFIG.root.src,
                CONFIG.root.inlinePath
            )
        );
    }
}

function clean(callback) {
    return DEL(assets, { force: true }, callback);
}

module.exports = clean;
