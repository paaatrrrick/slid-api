run: src/index.ts package.json
	npm run start

crun: src/index.ts package.json
	clear && npm run start

build: src/index.ts package.json
	npm run build

deploy: