const pluralize = require("./pluralize");

module.exports = function(object) {
    if (object.warning || object.error || object.warnings || object.errors) {
        let warning;
        let message = " found";
        let hasError = object.error || object.errors ? true : false;
        let options = {
            title: object.title ? object.title : hasError ? "Error" : "Warning",
            icon: hasError ? gulpIcons.error : gulpIcons.warning,
            wait: hasError,
            sound: hasError ? "Basso" : false
        };

        if (
            object.warning ||
            (object.error && (!object.warnings && !object.errors))
        ) {
            message = "Some issues found";
        }
        if (object.warnings) {
            warning = pluralize(" warning", object.warnings);
            message = object.warnings + warning + message;
        }
        if (object.errors) {
            let error = pluralize(" error", object.errors);
            message =
                object.errors +
                error +
                (object.warnings ? " and " : "") +
                message;
        }

        if (config.global.notifications) {
            notifier.notify({
                title: options.title,
                subtitle: object.subtitle,
                message: message,
                icon: options.icon,
                wait: options.wait,
                sound: options.sound
            });
        } else {
            // Output an error message in the console
            let text = ` (${object.subtitle}): ${message}`;
            if (hasError) {
                log(colors.red(options.title) + text);
            } else {
                log(colors.yellow(options.title) + text);
            }
        }
    }
};
