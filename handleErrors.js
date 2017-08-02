'use strict';

function handleErrors(error) {
	// Output an error message in the console
	util.log(util.colors.red(error.name + ' (' + error.plugin + '): ' + error.message));

	if (config.root.notifications) {
		notifier.notify({
			title: error.name,
			subtitle: error.plugin,
			message: error.message,
			icon: gulpIcons.error,
			wait: true,
			sound: 'Basso'
		});
	}

	this.emit('end');
}

module.exports = handleErrors;
