function getConfig() {
    let assets = [];

    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];
        let entries = CONFIG.tasks.clean;

        if (typeof entries == 'string') {
            entries = [entries];
        }

        assets = assets.concat(
            entries.map(entry =>
                path.join(
                    CONFIG.root.base || '',
                    KEY,
                    CONFIG.root.dest || '',
                    entry
                )
            )
        );

        if (CONFIG.root.inlinePath) {
            assets.push(
                path.join(
                    CONFIG.root.base || '',
                    KEY,
                    CONFIG.root.src || '',
                    CONFIG.root.inlinePath || ''
                )
            );
        }
    }
    return assets;
}

function getTask(callback) {
    const del = require('del');
    const assets = getConfig();
    return del(assets, { force: true }, callback);
}

module.exports = exportTask('clean', getTask);
