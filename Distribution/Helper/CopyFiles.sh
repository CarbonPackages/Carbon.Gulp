# Copy the defaults (no overwriting)
cp -nv Build/Gulp/Distribution/.gitignore  ./
cp -nv Build/Gulp/package.json ./
cp -nv Build/Gulp/gulp_global.yaml ./
cp -nv Build/Gulp/gulp_local.yaml ./

# Copy the essentials
cp Build/Gulp/.editorconfig ./
cp Build/Gulp/.eslintignore ./
cp Build/Gulp/.eslintrc ./
cp Build/Gulp/.jshintrc ./
cp Build/Gulp/.nvmrc ./
cp Build/Gulp/.prettierignore ./
cp Build/Gulp/.prettierrc ./
cp Build/Gulp/.stylelintrc ./
cp Build/Gulp/.yarnclean ./
echo
