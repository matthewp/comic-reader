COMPILE=node_modules/.bin/compile

all: mod.js
.PHONY: all

src/libarchive.js: node_modules/libarchive.js
	rm -rf $@
	cp -R $^ $@
	rm -rf $@/test
	rm -f $@/.travis.yml $@/jest.config.js $@/LICENSE $@/package.json $@/README.md $@/rollup.config.js

mod.js: $(shell find src -name "*.js")
	$(COMPILE) -f es -o . --chunks zipsource=src/zipsource.js,browser=src/browser.js src/index.js
	@mv index.js $@

compile: mod.js
	@cp -R src/libarchive.js .
.PHONY: compile

clean:
	rm -f mod.js zipsource.js browser.js
.PHONY: clean