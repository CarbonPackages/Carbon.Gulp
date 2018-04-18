# Features

* Configuration with `yaml` files
* Live reloading with [Browsersync](https://browsersync.io/)
* Automatic update from Javascript development dependencies via [json](https://www.npmjs.com/package/json) and bash script
* Generate configuration based on the file structure
* Render [Sass](http://sass-lang.com) to CSS and process it with [PostCSS](http://postcss.org)
* Render your Javascript with [Rollup JS](http://rollupjs.org)
* Compress your Images with [imagemin](https://www.npmjs.com/package/gulp-imagemin)
* Create SVG Sprites out of the box


---

## Browsersync

Per default, your folder name get used for the proxy for Browsersync.

global:
  mergeConfigFromPackages:
    - .src
  notifications: false
  browserSync:
    enable: true
    proxy: "127.0.0.1:8081"
    proxyRootFolder: "https://"


@ul

*   **[Browsersync](https://browsersync.io/)**
*   **Automatic update** If an update from the devDependcies is required
*   **CSS** ([Sass](http://sass-lang.com) and [PostCSS](http://postcss.org))
*   **Javascript** ([Rollup JS](http://rollupjs.org) in combination with [Babel](https://babeljs.io) or [Bublé](https://buble.surge.sh/guide) )
*   **Images** Compression with [imagemin](https://www.npmjs.com/package/gulp-imagemin)
*   **Lint** [ESLint](http://eslint.org/) and [stylelint](https://stylelint.io) included
*   **Compression** Compression of the generated files with [brotli](https://github.com/google/brotli) and [zopfli](https://github.com/google/zopfli)

@ulend

+++

## SCSS import helper

These small helper can make your handling with **css `@import`** life much easier.

If you want to split source files into seperated import containers, you can add an annotation within a filename.
`noLinter` is an exception, because this is for turning off the linter and prettier config.

+++

```
_all.scss
_allsub.scss
_allFusion.scss
_all.CONTAINERNAME.scss
_allsub.CONTAINERNAME.scss
_allFusion.CONTAINERNAME.scss
```

@[1](Every file (except the files with an annotation) from the same directory gets an `@import` statement.)
@[2](Every file (except the files with an annotation) from sub directories gets an `@import` statement.)
@[3](Every file (except the files with an annotation) from the Fusion folder gets an `@import` statement.)
@[4](Every file with the given annotation from the same directory gets an `@import` statement.)
@[5](Every file with the given annotation from sub directories gets an `@import` statement.)
@[6](Every file with the given annotation from the Fusion folder gets an `@import` statement.)

Note:
Files and folders with beginning underscore (`_`) get ignored.

+++

### Example

```
FolderName
    ├──  0-Variables.noLinter.scss
    ├──  Footer.scss
    ├──  FrameworkPart.noLinter.Inline.scss
    └──  Header.Inline.scss
FolderName.Inline
    ├──  Footer.scss
    ├──  FrameworkPart.noLinter.Inline.scss
    └──  Header.Inline.scss
 _allsub.scss
 _allsub.Inline.scss
```

+++

#### General import

The content from `_allsub.scss` would be:

```scss
@import "FolderName/0-Variables.noLinter";
@import "FolderName/Footer";
```

+++

#### Import with an annotation

And the content from `_allsub.Inline.scss` would be:

```scss
@import "FolderName/FrameworkPart.noLinter.Inline";
@import "FolderName/Header.Inline";
@import "FolderName.Inline/Footer";
@import "FolderName.Inline/FrameworkPart.noLinter.Inline";
@import "FolderName.Inline/Header.Inline";
```

+++

## Automatic update

If the file `package.json` already exist, the dependencies will get merged with the `package.json` from the distribution
