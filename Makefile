COMPILE=node_modules/.bin/compile

all: compile
.PHONY: all

src/libarchive.js: node_modules/libarchive.js
	rm -rf $@
	cp -R $^ $@
	rm -rf $@/test
	rm -f $@/.travis.yml $@/jest.config.js $@/LICENSE $@/package.json $@/README.md $@/rollup.config.js

compile: src/index.js
	$(COMPILE) -f es -o . src/index.js
	@mv index.js mod.js
	@cp -R src/libarchive.js .
.PHONY: compile

clean:
	rm -rf lib/libarchive.js
.PHONY: clean