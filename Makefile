lib/libarchive.js: node_modules/libarchive.js
	rm -rf $@
	cp -R $^ $@
	rm -rf $@/test
	rm -f $@/.travis.yml $@/jest.config.js $@/LICENSE $@/package.json $@/README.md $@/rollup.config.js

all: lib/libarchive.js
.PHONY: all

clean:
	rm -rf lib/libarchive.js
.PHONY: clean