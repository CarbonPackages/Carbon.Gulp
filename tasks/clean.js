'use strict';

if (!config.tasks.clean) {
	return false;
}

const del = require('del');

let paths = config.tasks.clean;
if (Array.isArray(paths)) {
	paths = paths.map(value => path.join(config.root.base, config.root.dest, value));
}

function clean(callback) {
	return del(paths, {force: true}, callback);
}

module.exports = clean;
