# Carbon.Gulp has a successor: Carbon.Pipeline

[Carbon.Pipeline] is an ultra-fast build stack for Neos CMS based on [esbuild] and [PostCSS], inclusive [Vue.js] and [Svelte] support. And of course [TypeScript], too.

[![Carbon.Pipeline – Build stack for Neos CMS][preview]][Carbon.Pipeline]

[![Development dependency status](https://david-dm.org/CarbonPackages/Carbon.Gulp/dev-status.svg)](https://david-dm.org/CarbonPackages/Carbon.Gulp?type=dev)
[![Build status](https://api.travis-ci.com/CarbonPackages/Carbon.Gulp.svg)](https://travis-ci.com/CarbonPackages/Carbon.Gulp)
[![Latest Stable Version](https://poser.pugx.org/carbon/gulp/v/stable)](https://packagist.org/packages/carbon/gulp)
[![Total Downloads](https://poser.pugx.org/carbon/gulp/downloads)](https://packagist.org/packages/carbon/gulp)
[![License](https://poser.pugx.org/carbon/gulp/license)](LICENSE)
[![Support development](https://img.shields.io/badge/Donate-PayPal-yellow.svg)](https://www.paypal.me/Jonnitto/20eur)
[![My wishlist on amazon](https://img.shields.io/badge/Wishlist-Amazon-yellow.svg)](https://www.amazon.de/hz/wishlist/ls/2WPGORAVYF39B?&sort=default)  
[![GitHub forks](https://img.shields.io/github/forks/CarbonPackages/Carbon.Gulp.svg?style=social&label=Fork)](https://github.com/CarbonPackages/Carbon.Gulp/fork)
[![GitHub stars](https://img.shields.io/github/stars/CarbonPackages/Carbon.Gulp.svg?style=social&label=Stars)](https://github.com/CarbonPackages/Carbon.Gulp/stargazers)
[![GitHub watchers](https://img.shields.io/github/watchers/CarbonPackages/Carbon.Gulp.svg?style=social&label=Watch)](https://github.com/CarbonPackages/Carbon.Gulp/subscription)

# What is Carbon.Gulp?

**Carbon.Gulp is a delicious blend of tasks and build tools poured into Gulp to form a full-featured modern asset pipeline for Flow Framework and Neos CMS.**

**[You find the documentation in the wiki](https://github.com/CarbonPackages/Carbon.Gulp/wiki)** and an example installation [here](https://github.com/jonnitto/CarbonGulpExample).

![Carbon.Gulp](https://github.com/jonnitto/Carbon.Gulp/wiki/Assets/Logo.png)

## Features

-   Configuration with `yaml` files
-   Live reloading with [Browsersync](https://browsersync.io/)
-   Automatic update from Javascript development dependencies via [json](https://www.npmjs.com/package/json) and bash script
-   Generate configuration based on the file structure
-   Render [Sass](http://sass-lang.com) to CSS and process it with [PostCSS](http://postcss.org)
-   Render your Javascript with [Rollup JS](http://rollupjs.org)
-   Compress your Images with [imagemin](https://www.npmjs.com/package/gulp-imagemin)
-   Create SVG Sprites in two variations out of the box: One for direct include, one for external use.
-   You can create internal and external files (`.css` and `.js`), based on a file annotation.

**Important:**  
If you problems with your installation after an update, please delete `node_modules` and `yarn.lock` and try it again

If you have troubles to get it running, [drop me a line by creating an issue](https://github.com/CarbonPackages/Carbon.Gulp/issues) and I'll try to help you out.

**[You find the documentation in the wiki](https://github.com/CarbonPackages/Carbon.Gulp/wiki)** and an example installation [here](https://github.com/jonnitto/CarbonGulpExample).

[carbon.pipeline]: https://github.com/CarbonPackages/Carbon.Pipeline#readme
[preview]: https://repository-images.githubusercontent.com/377838441/8d66c680-d27d-11eb-99a4-85ab35081318
[esbuild]: https://esbuild.github.io
[postcss]: https://postcss.org
[typescript]: https://www.typescriptlang.org
[svelte]: https://svelte.dev
[vue.js]: https://vuejs.org
