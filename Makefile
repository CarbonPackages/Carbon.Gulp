.PHONY: default

default:
	@echo ""
	@echo ""
	@echo "      Usage: make COMMAND"
	@echo ""
	@echo "--------------------------------------------------------------------------"
	@echo ""
	@echo "      upgrade          Check if there are any new dependencies available"
	@echo "      commit           Commit upgraded dependencies"
	@echo ""
	@echo "--------------------------------------------------------------------------"
	@echo ""
	@echo "      local_test       Prepare, run the test, and reset the files"
	@echo "      before_test      Prepare the test"
	@echo "      test             Run the test"
	@echo "      reset_git_files  Reset the files to a commitable status"
	@echo ""
	@echo "--------------------------------------------------------------------------"
	@echo ""
	@echo "      patch_release    Relase a patch version and push it to git"
	@echo "      minor_release    Relase a minor version and push it to git"
	@echo "      major_release    Relase a major version and push it to git"
	@echo "      push_release     Push the release to git"
	@echo ""
	@echo "--------------------------------------------------------------------------"
	@echo ""

# Upgrade
.PHONY: upgrade

upgrade:
	yarn upgrade-interactive --latest

# commit

.PHONY: commit

commit:
	git add package.json
	git commit -m ":arrow_up: Upgrading dependencies"
	git push

# Test

.PHONY: test before_test reset_git_files local_test

before_test:
	yarn add postcss-flexbox postcss-zindex

test:
	gulp --cwd ./ --gulpfile ./index.js test --carbon

reset_git_files:
	rm -rf Test/Public
	git checkout Test/Private/*
	yarn remove postcss-flexbox postcss-zindex

local_test: before_test test reset_git_files

# Release

.PHONY: patch_release minor_release major_release push_release

push_release:
	git push
	git push --tags

patch_release:
	yarn version --patch
	make push_release

minor_release:
	yarn version --minor
	make push_release

major_release:
	yarn version --major
	make push_release
