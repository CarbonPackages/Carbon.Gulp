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

| Filename                            | Description                                                                                           |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **`_all.scss`**                     | Every file (except the files with an annotation) from the same directory gets an `@import` statement. |
| **`_allsub.scss`**                  | Every file (except the files with an annotation) from sub directories gets an `@import` statement.    |
| **`_allFusion.scss`**               | Every file (except the files with an annotation) from the Fusion folder gets an `@import` statement.  |
| **`_all.CONTAINERNAME.scss`**       | Every file with the given annotation from the same directory gets an `@import` statement.             |
| **`_allsub.CONTAINERNAME.scss`**    | Every file with the given annotation from sub directories gets an `@import` statement.                |
| **`_allFusion.CONTAINERNAME.scss`** | Every file with the given annotation from the Fusion folder gets an `@import` statement.              |

Files and folders with beginning underscore (`_`) get ignored.

+++

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

+++

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
