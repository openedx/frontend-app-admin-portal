transifex_utils = ./node_modules/.bin/transifex-utils.js
intl_imports = ./node_modules/.bin/intl-imports.js


i18n = ./src/i18n
transifex_input = $(i18n)/transifex_input.json
# This directory must match .babelrc .
transifex_temp = ./temp/babel-plugin-react-intl

shell: ## run a shell on the cookie-cutter container
	docker exec -it /bin/bash

build:
	docker-compose build

up: ## bring up cookie-cutter container
	docker-compose up

up-detached: ## bring up cookie-cutter container in detached mode
	docker-compose up -d

logs: ## show logs for cookie-cutter container
	docker-compose logs -f

down: ## stop and remove cookie-cutter container
	docker-compose down

npm-install-%: ## install specified % npm package on the cookie-cutter container
	docker exec npm install $* --save-dev
	git add package.json

restart:
	make down
	make up

restart-detached:
	make down
	make up-detached

validate-no-uncommitted-package-lock-changes:
	git diff --name-only --exit-code package-lock.json

requirements:
	npm install

i18n.extract:
	# Pulling display strings from .jsx files into .json files...
	rm -rf $(transifex_temp)
	npm run-script i18n_extract

i18n.concat:
	# Gathering JSON messages into one file...
	$(transifex_utils) $(transifex_temp) $(transifex_input)

extract_translations: | requirements i18n.extract i18n.concat

pull_translations:
	rm -rf src/i18n/messages
	mkdir src/i18n/messages
	cd src/i18n/messages \
	  && atlas $(ATLAS_OPTIONS) pull \
	           translations/frontend-platform/src/i18n/messages:frontend-platform \
	           translations/paragon/src/i18n/messages:paragon \
	           translations/frontend-app-admin-portal/src/i18n/messages:frontend-app-admin-portal
	$(intl_imports) frontend-platform paragon frontend-app-admin-portal
