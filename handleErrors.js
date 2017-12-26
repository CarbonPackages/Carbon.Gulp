"use strict";

function handleErrors(error) {
    // Output an error message in the console
    log(
        colors.red(`${error.name} (${error.plugin}): ${error.message}`)
    );

    if (config.global.notifications) {
        notifier.notify({
            title: error.name,
            subtitle: error.plugin,
            message: error.message,
            icon: gulpIcons.error,
            wait: true,
            sound: "Basso"
        });
    }

    if (this && typeof this.emit == "function") {
        this.emit("end");
    }
}

module.exports = handleErrors;
