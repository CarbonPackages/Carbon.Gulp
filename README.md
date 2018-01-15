[![Latest Stable Version](https://poser.pugx.org/carbon/gulp/v/stable)](https://packagist.org/packages/carbon/gulp)
[![Total Downloads](https://poser.pugx.org/carbon/gulp/downloads)](https://packagist.org/packages/carbon/gulp)
[![License](https://poser.pugx.org/carbon/gulp/license)](LICENSE)
[![GitHub forks](https://img.shields.io/github/forks/jonnitto/Carbon.Gulp.svg?style=social&label=Fork)](https://github.com/jonnitto/Carbon.Gulp/fork)
[![GitHub stars](https://img.shields.io/github/stars/jonnitto/Carbon.Gulp.svg?style=social&label=Stars)](https://github.com/jonnitto/Carbon.Gulp/stargazers)
[![GitHub watchers](https://img.shields.io/github/watchers/jonnitto/Carbon.Gulp.svg?style=social&label=Watch)](https://github.com/jonnitto/Carbon.Gulp/subscription)
[![GitHub followers](https://img.shields.io/github/followers/jonnitto.svg?style=social&label=Follow)](https://github.com/jonnitto/followers)
[![Follow Jon on Twitter](https://img.shields.io/twitter/follow/jonnitto.svg?style=social&label=Follow)](https://twitter.com/jonnitto)

# Carbon/Gulp

Carbon/Gulp is a delicious blend of tasks and build tools poured into Gulp to
form a full-featured modern asset pipeline for Flow Framework and Neos CMS.
Based on https://github.com/jonnitto/gulpfile.js and the inspiration of
[@dfeyer](https://github.com/dfeyer) from [ttree ltd](https://github.com/ttreeagency).

You can find an example installation [here](https://github.com/jonnitto/CarbonGulpExample).

# Installation

Make sure Node & [Yarn](https://yarnpkg.com) installed.
I recommend using [NVM](https://github.com/creationix/nvm) to manage versions.

```bash
composer require --dev carbon/gulp
```

To install your development dependencies you can simple run:

```bash
sh Build/Gulp/Distribution/Installer.sh
```

You need to run this command only once, because with the script your `composer.json`
get ajusted to check and update the dependencies every time a package get installed.

If you don't want to patch your `composer.json`, you can run

```bash
sh Build/Gulp/Distribution/Update.sh
```

These scripts copies all necessary files from the [Distribution](Distribution)
folder into your root folder. If the file `package.json` already exist, the
dependencies will get merged with the `package.json` from the distribution.
Otherwise it will create you a [`package.json`](Distribution/Defaults/package.json)
with all the needed settings.

**Warning:** You need to install [json](https://www.npmjs.com/package/json) if
you want to merge the json automatically.

**It is important that you will add your own dependencies with [`yarn add`](https://yarnpkg.com/en/docs/usage).
Development dependencies will be updated on every update of the package**

## Install Dependencies

```bash
# Enable the correct nvm
nvm use
# Install the package dependencies
yarn
# Show available tasks
yarn tasks
```

You must see something like this:

```bash
Tasks
├── showConfig       Show the merged configuration
│   --p, --path      … Pass path from the configuration file to reduce output. Slash ("/") seperated
├── css              Render CSS Files
│   --b, --beautify  … Beautify and dont't compress files
│   --d, --debug     … Files dont't get compressed
│   --n, --nomaps    … Don't write sourcemaps
├── scss             Render _all.scss, _allsub.scss and _allFusion.scss Files
├── js               Render Javascript Files
│   --b, --beautify  … Beautify and dont't compress files
│   --d, --debug     … Files dont't get compressed
│   --n, --nomaps    … Don't write sourcemaps
├── lint             Lint Javascript and CSS files
├── optimizeImages   Optimize images and overwrite them in the public folder
├── sprite           Create SVG Sprite
├── optimizeSvg      Optimize SVGs and overwrite them
├── compress         Compress all CSS/JS/SVG with Brotli and Zopfli
├── build             Generates all  Assets, Javascript and CSS files
│   --b, --beautify  … Beautify and dont't compress files
│   --d, --debug     … Files dont't get compressed
│   --n, --nomaps    … Don't write sourcemaps
├── watch            Watch files and regenereate them
├─┬ default           Generates all  Assets, Javascript and CSS files &  watch them
│ │ --b, --beautify  … Beautify and dont't compress files
│ │ --d, --debug     … Files dont't get compressed
│ │ --n, --nomaps    … Don't write sourcemaps
│ └─┬ <series>
│   ├── build
│   └── watch
└─┬ pipeline         Make files production ready
  └─┬ <series>
    ├── build
    ├── optimizeImages
    └── compress
```

## Overview of commands

| Command               | Watcher | Behaviour                                                      |
| --------------------- | :-----: | -------------------------------------------------------------- |
| `yarn start`          |    ✓    | Generates all Assets, Javascript and CSS files                 |
| `yarn tasks`          |         | Show all available tasks                                       |
| `yarn build`          |         | Generates all Assets, Javascript and CSS files                 |
| `yarn pipeline`       |         | Make files production ready                                    |
| `yarn beautify`       |    ✓    | Beautify and dont't compress files                             |
| `yarn debug`          |    ✓    | Files dont't get compressed                                    |
| `yarn nomaps`         |    ✓    | Don't write sourcemaps                                         |
| `yarn css`            |         | Render CSS Files                                               |
| `yarn js`             |         | Render Javascript Files                                        |
| `yarn lint`           |         | Lint Javascript and CSS files                                  |
| `yarn scss`           |         | Render `_all.scss`, `_allsub.scss` and `_allFusion.scss` Files |
| `yarn compress`       |         | Compress all CSS/JS/SVG with Brotli and Zopfli                 |
| `yarn optimizeImages` |         | Optimize images and overwrite them in the public folder        |
| `yarn optimizeSvg`    |         | Optimize SVGs and overwrite them                               |
| `yarn showConfig`     |         | Shows the merged configuration.                                |

**You can also run `yarn gulp GULP_TASK_NAME`, for example `yarn gulp watch --nomaps`.**

# Overview of tools

| Features       | Tools Used                                                                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CSS**        | [Sass](http://sass-lang.com) ([Libsass](http://sass-lang.com/libsass) via [node-sass](https://github.com/sass/node-sass)) and [PostCSS](http://postcss.org) |
| **Javascript** | [Rollup JS](http://rollupjs.org) with [Babel](https://babeljs.io) or [Bublé](https://buble.surge.sh/guide)                                                  |
| **Images**     | Compression with [imagemin](https://www.npmjs.com/package/gulp-imagemin). Run width `gulp optimizeImages`. Overwrites files in the resource folder.         |
| **Icons**      | Auto-generated [SVG Sprites](https://github.com/jkphl/svg-sprite)                                                                                           |
| **Lint**       | [ESLint](http://eslint.org/) and [stylelint](https://stylelint.io) included                                                                                 |

# Lint

If you want to disable linting for a specific file, just make sure that it
contains `.noLinter.`. This is useful if you have to include third-party files.

# CSS

## SCSS

These small helper can make your handling with **css `@import`** life much easier.
Files with the pattern `_all?(.[A-Za-z0-9]*).scss`, `_allsub?(.[A-Za-z0-9]*).scss`
and `_allFusion?(.[A-Za-z0-9]*).scss` get filled automatically by the task `scss`.

If you want to split source files into seperated import containers, you can add
an annotation within a filename. Look at the examples to understand the pattern.  
`noLinter` is an exception, because this is for turning off the linter and prettier config.

| Filename                            | Description                                                                                           |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **`_all.scss`**                     | Every file (except the files with an annotation) from the same directory gets an `@import` statement. |
| **`_allsub.scss`**                  | Every file (except the files with an annotation) from sub directories gets an `@import` statement.    |
| **`_allFusion.scss`**               | Every file (except the files with an annotation) from the Fusion folder gets an `@import` statement.  |
| **`_all.CONTAINERNAME.scss`**       | Every file with the given annotation from the same directory gets an `@import` statement.             |
| **`_allsub.CONTAINERNAME.scss`**    | Every file with the given annotation from sub directories gets an `@import` statement.                |
| **`_allFusion.CONTAINERNAME.scss`** | Every file with the given annotation from the Fusion folder gets an `@import` statement.              |

Files and folders with beginning underscore (`_`) get ignored.

### Example

#### File structure

```
FolderName
    ├──  0-Variables.noLinter.scss
    ├──  Footer.scss
    ├──  FrameworkPart.noLinter.Inline.scss
    └──  Header.Inline.scss
FolderName.Inline
    ├──  0-Variables.noLinter.scss
    ├──  Footer.scss
    ├──  FrameworkPart.noLinter.Inline.scss
    └──  Header.Inline.scss
 _allsub.scss
 _allsub.Inline.scss
```

#### General import

The content from `_allsub.scss` would be:

```scss
@import "FolderName/0-Variables.noLinter";
@import "FolderName/Footer";
```

#### Import with an annotation

And the content from `_allsub.Inline.scss` would be:

```scss
@import "FolderName/FrameworkPart.noLinter.Inline";
@import "FolderName/Header.Inline";
@import "FolderName.Inline/0-Variables.noLinter";
@import "FolderName.Inline/Footer";
@import "FolderName.Inline/FrameworkPart.noLinter.Inline";
@import "FolderName.Inline/Header.Inline";
```

## PostCSS

Following plugins are included:

| Plugin                                                                                 | Description                                                                                    |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **[postcss-rtl](https://www.npmjs.com/package/postcss-rtl)**                           | PostCSS plugin for RTL-optimizations. **Turned off by default**                                |
| **[postcss-assets](https://www.npmjs.com/package/postcss-assets)**                     | PostCSS plugin to manage assets                                                                |
| **[postcss-magic-animations](https://www.npmjs.com/package/postcss-magic-animations)** | Plugin that adds `@keyframes` from [Magic Animations](https://github.com/miniMAC/magic)        |
| **[postcss-vmax](https://www.npmjs.com/package/postcss-vmax)**                         | Use vmax units in Edge and Internet Explorer                                                   |
| **[postcss-short](https://www.npmjs.com/package/postcss-short)**                       | Short creates and extends shorthand properties in CSS                                          |
| **[postcss-center](https://www.npmjs.com/package/postcss-center)**                     | PostCSS plugin to center elements                                                              |
| **[rucksack-css](https://www.rucksackcss.org/)**                                       | A little bag of CSS superpowers                                                                |
| **[postcss-flexbox](https://www.npmjs.com/package/postcss-flexbox)**                   | Flexbox layouts made easy with PostCSS                                                         |
| **[pleeease-filters](https://www.npmjs.com/package/pleeease-filters)**                 | Convert CSS shorthand filters to SVG ones                                                      |
| **[postcss-selector-matches](https://www.npmjs.com/package/postcss-selector-matches)** | PostCSS plugin to transform :matches() W3C CSS pseudo class to more compatible CSS selectors   |
| **[postcss-selector-not](https://www.npmjs.com/package/postcss-selector-not)**         | PostCSS plugin to transform :not() W3C CSS leve 4 pseudo class to :not() CSS level 3 selectors |
| **[postcss-pseudoelements](https://www.npmjs.com/package/postcss-pseudoelements)**     | PostCSS plugin to add single-colon CSS 2.1 syntax pseudo selectors (i.e. :before)              |
| **[postcss-custom-media](https://www.npmjs.com/package/postcss-custom-media)**         | PostCSS plugin to transform W3C CSS Custom Media Queries syntax to more compatible CSS         |
| **[postcss-media-minmax](https://www.npmjs.com/package/postcss-media-minmax)**         | Writing simple and graceful media queries.                                                     |
| **[postcss-quantity-queries](https://www.npmjs.com/package/postcss-quantity-queries)** | PostCSS plugin enabling quantity-queries                                                       |
| **[postcss-fixes](https://www.npmjs.com/package/postcss-fixes)**                       | PostCSS plugin to fix known Browser Bugs.                                                      |
| **[css-mqpacker](https://www.npmjs.com/package/css-mqpacker)**                         | Pack same CSS media query rules into one media query rule.                                     |
| **[sort-css-media-queries](https://www.npmjs.com/package/sort-css-media-queries)**     | The custom sort method (mobile-first / desktop-first) for css-mqpacker.                        |
| **[postcss-round-subpixels](https://www.npmjs.com/package/postcss-round-subpixels)**   | Plugin that rounds sub-pixel (eg: 12.87378px) values to the nearest full pixel.                |
| **[postcss-reporter](https://www.npmjs.com/package/postcss-reporter)**                 | Log PostCSS messages in the console                                                            |
| **[postcss-pxtorem](https://www.npmjs.com/package/postcss-pxtorem)**                   | A plugin for PostCSS that generates rem units from pixel units.                                |
| **[cssnano](http://cssnano.co)**                                                       | Modern CSS compression                                                                         |

# Configuration

You can read the default configuration in [`config.yaml`](config.yaml), if you need to override
the configuration for a specific package, you can create a `Gulp.yaml` in
the `Configuration` directory, like this:

```yaml
root:
  inlineAssets: true

tasks:
  js:
    rollup:
      plugins:
        commonjs:
          namedExports:
            "node_modules/barba.js/dist/barba.js":
              - Barba
```

This configuration render the `*.js` and `*.css` into the given folder
and add a named export to `barba.js`

To enable the rendering for a specific package without overwriting configuration,
you need to create also a `Gulp.yaml` file in the `Configuration` directory:

```yaml
---
```

If you want to write your settings on the root directory, you can create there
`gulp_local.yaml` (Just for you) or `gulp_global.yaml` (Also for your workbuddies).
The settings from the different yaml files get merged together.

```yaml
global:
  notifications: true
  browserSync:
    proxyRootFolder: false
```

This configuration enable notifications and disable the
proxy based by project folder name.

## Show the merged configuration

You can output the merged configuration with `yarn showConfig`. To reduce output
to a path, you can pass a slash-seperated path ("/") with the argument `--path`:  
Example: `yarn showConfig --path tasks/js/rollup/plugins`

# Compression

To compress the asset with brotli and zopfli, you need to run `yarn compress` or
`yarn pipeline`. To enable it on the server, please add following lines to your `.htaccess`:

```apache
# Rules to correctly serve gzip compressed CSS and JS files.
# Requires both mod_rewrite and mod_headers to be enabled.
<IfModule mod_headers.c>
    # Serve brotli compressed CSS files if they exist and the client accepts gzip.
    RewriteCond %{HTTP:Accept-encoding} br
    RewriteCond %{REQUEST_FILENAME}\.br -s
    RewriteRule ^(.*)\.css $1\.css\.br [QSA]

    # Serve gzip compressed CSS files if they exist and the client accepts gzip.
    RewriteCond %{HTTP:Accept-encoding} gzip
    RewriteCond %{REQUEST_FILENAME}\.gz -s
    RewriteRule ^(.*)\.css $1\.css\.gz [QSA]

    # Serve brotli compressed JS files if they exist and the client accepts gzip.
    RewriteCond %{HTTP:Accept-encoding} br
    RewriteCond %{REQUEST_FILENAME}\.br -s
    RewriteRule ^(.*)\.js $1\.js\.br [QSA]

    # Serve gzip compressed JS files if they exist and the client accepts gzip.
    RewriteCond %{HTTP:Accept-encoding} gzip
    RewriteCond %{REQUEST_FILENAME}\.gz -s
    RewriteRule ^(.*)\.js $1\.js\.gz [QSA]

    # Serve correct content types, and prevent mod_deflate double gzip.
    RewriteRule \.css\.gz$ - [T=text/css,E=no-gzip:1]
    RewriteRule \.js\.gz$ - [T=text/javascript,E=no-gzip:1]
    RewriteRule \.css\.br$ - [T=text/css,E=no-gzip:1]
    RewriteRule \.js\.br$ - [T=text/javascript,E=no-gzip:1]

    <FilesMatch "(\.js\.gz|\.css\.gz)$">
      # Serve correct encoding type.
      Header set Content-Encoding gzip
      # Force proxies to cache gzipped & non-gzipped css/js files separately.
      Header append Vary Accept-Encoding
    </FilesMatch>
    <FilesMatch "(\.js\.br|\.css\.br)$">
      # Serve correct encoding type.
      Header set Content-Encoding br
      # Force proxies to cache gzipped & non-gzipped css/js files separately.
      Header append Vary Accept-Encoding
    </FilesMatch>
</IfModule>
```
