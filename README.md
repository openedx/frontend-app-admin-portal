# frontend-app-admin-portal

## Overview
frontend-app-admin-portal is a frontend that provides branded learning experiences as well as a dashboard for enterprise learning administrators.

## Setting up a dev environment

### The Short Story

1. Set up docker devstack locally, and start the service containers (see https://github.com/edx/devstack)

2. Set up and run the edx-analytics-data-api (https://github.com/edx/edx-analytics-data-api) locally

3. Clone this repo and install npm requirements:

```
$ git clone git@github.com:edx/frontend-app-admin-portal.git
$ cd frontend-app-admin-portal
$ npm install
$ npm start
```

The application is now running and can be accessed in a web browser at http://localhost:1991/


### The Longer Story

For the frontend-app-admin-portal to function properly locally, the following parts need to be set up:

1. At least 1 enterprise customer should exist in `edx-platform`
2. `edx-analytics-data-api` needs data that would normally be piped from `edx-platform` via data pipelines

#### Enterprise Customer

The `frontend-app-admin-portal` displays information about enterprise customers in `edx-platform`, so you will need to create a customer in `edx-platform`. You can create a customer by doing the following:

1. Navigate to http://localhost:18000/admin/enterprise/enterprisecustomer/
2. Click "Add Enterprise Customer"
3. Complete this form, at very least filling in the Name, Slug, and Site
4. Click "Save"

Once created, make a note of the UUID field in the admin for the enterprise customer you created. This is needed to map the data in `edx-platform` to the data in `edx-analytics-data-api`.

#### Analytics-data-api Data Prep

Follow the instructions for how to get data into the edx-analytics-data-api in the repo README here: https://github.com/edx/edx-analytics-data-api, using the UUID for the enterprise customer you just created.

#### Bringing it all together

At this point, if the LMS *and* `data-analytics-api` are running, you should then be able to:

1. Run the `frontend-app-admin-portal` locally

```
$ npm install
$ npm start
```

2. Login with credentials that you could log into your local edx-platform with

3. See data displayed in the admin portal

## Using Demo Data
This frontend application uses the [edx-enterprise-data-api](https://github.com/edx/edx-analytics-data-api/) as a backend API for data.
To support scenarios where demonstration data is required or the API is not available, we also generate a script that can be loaded that will
return static demo data instead of hitting the API. To enable:
- In production: Load `demoDataLoader.js` to the page using [a bookmarklet](https://codepen.io/edx/live/e5f46af8f39968b9693c8414091f6cc3/)
- In development: Uncomment the entrypoint `../src/demo/index.js` in `webpack.dev.config.js`
