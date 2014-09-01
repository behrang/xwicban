component = node_modules/.bin/component
serve = node_modules/.bin/serve

all: site/css

serve: site/css
	@$(serve) --no-logs --no-dirs site

site/css: build/build.css site
	@mkdir -p site/css
	@cp build/build.css site/css/build.css
	@touch $@

site: node_modules terms/*.yaml pages/*.md generator/* generator/**/*
	@node --harmony generator/terms.js
	@touch $@

build/build.css: components
	@$(component) build

components: node_modules component.json lib/**/*
	@$(component) install
	@touch $@

node_modules: package.json
	@npm install
	@touch $@

term:
ifdef name
	@cp generator/templates/empty.yaml terms/$(name).yaml
else
	$(error name is not set, use "make term name=x")
endif

clean:
	@rm -fr site build

clean-all: clean
	@rm -fr node_modules components

.PHONY: all serve term clean clean-all
