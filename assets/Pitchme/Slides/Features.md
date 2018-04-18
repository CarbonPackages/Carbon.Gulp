# Features

@ul

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

*   `_all.scss`
*   `_allsub.scss`
*   `_allFusion.scss`
*   `_all.CONTAINERNAME.scss`
*   `_allsub.CONTAINERNAME.scss`
*   `_allFusion.CONTAINERNAME.scss`

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
