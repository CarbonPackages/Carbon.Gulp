# Configuration

@ul

*   Configuration is stored in `config.yaml`
*   Adjustable via `.yaml` files
*   Adjustable on the root level and also on a per-package-basis
*   **The settings from the different yaml files get merged together**

@ulend

+++

## Example of an configuration file

```yaml
global:
  notifications: true
  browserSync:
    proxyRootFolder: false
```

+++

## Configuration on the root level

If you want to write your settings on the root directory, you can create
there `gulp_local.yaml` (Just for you) or `gulp_global.yaml` (Also for your workbuddies)

+++

## Configuration in the package

Every package who has a `Gulp.yaml` inside the `Configuration` folder, get
a entry into the configuration. If you don't want to overwrite the default settings,
you have to create an empty `Gulp.yaml` file like this:

```yaml
---
```

+++

## Show the merged configuration

You can output the merged configuration with `yarn showConfig`. To reduce output
to a path, you can pass a slash-seperated path ("/") with the argument `--path`:  
Example: `yarn showConfig --path tasks/js/rollup/plugins`
