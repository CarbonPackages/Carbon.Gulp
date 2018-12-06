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
