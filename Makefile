# Test

.PHONY: test before_test reset_git_files local_test

before_test:
	yarn add postcss-flexbox postcss-zindex

test:
	gulp --cwd ./ --gulpfile ./index.js test --carbon

reset_git_files:
	git checkout Test/Private/*
	yarn remove postcss-flexbox postcss-zindex

local_test:
	make before_test
	make test
	make reset_git_files

# Release

.PHONY: patch_release minor_release major_release push_release

push_release:
	git push
	git push --tags

patch_release:
	yarn version --patch
	push_release

minor_release:
	yarn version --minor
	push_release

major_release:
	yarn version --major
	push_release
