# edx-portal

## Overview
edx-portal is a frontend that provides branded learning experiences as well as a dashboard for enterprise learning administrators.

## Setting up a dev environment

1. Set up docker devstack locally, and start the service containers.
2. Clone the edx-portal repo and change into the root directory of the repo.
3. Run npm install, then npm run start
4. Open http://localhost:1991/

## Using Demo Data
This frontend application uses the [edx-enterprise-data-api](https://github.com/edx/edx-analytics-data-api/) as a backend API for data.
To support scenarios where demonstration data is required or the API is not available, we also generate a script that can be loaded that will
return static demo data instead of hitting the API. To enable:
- In production: Load `demoDataLoader.js` to the page using [a bookmarklet](https://codepen.io/edx/live/e5f46af8f39968b9693c8414091f6cc3/)
- In development: Uncomment the entrypoint `../src/demo/index.js` in `webpack.dev.config.js`
