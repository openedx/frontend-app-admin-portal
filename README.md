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
$ nvm use (if using nvm) OR install and switch to version of node/npm as per the .nvmrc file to avoid issues during npm install or npm start (and to use the same version of node/npm as used by team plus CI builds)
$ npm install
$ npm start
```

The application is now running and can be accessed in a web browser at http://localhost:1991/

#### Sign-in and access

Sign in using the `enterprise_openedx_operator` created by running `./manage.py lms seed_enterprise_devstack_data` in the lms shell.
After sign-in, you may have to navigate back to `localhost:1991`.

In the lms django admin, click on "Enterprise Customers" then "Test Enterprise" (or the enterprise you're working with). Check the
appropriate boxes to gain access to the appropriate admin screens.


### The Longer Story

For the frontend-app-admin-portal to function properly locally, the following parts need to be set up:

1. At least 1 enterprise customer should exist in `edx-platform`. This customer can be created using created by running `./manage.py lms seed_enterprise_devstack_data` in the lms shell.
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

### Using local frontend libraries
In order to use a local version of a frondend library, such as Paragon, you must create a `module.config.js` file in the root directory of your repo.
It should contain aliases that webpack will use to resolve modules locally rather than using the module in `node_modules`.

Sample `module.config.js` file:
```
module.exports = {
/*
  Modules you want to use from local source code.  Adding a module here means that when this app
  runs its build, it'll resolve the source from peer directories of this app.
  moduleName: the name you use to import code from the module.
  dir: The relative path to the module's source code.
  dist: The sub-directory of the source code where it puts its build artifact.  Often "dist".
*/
  localModules: [
    { moduleName: '@edx/brand', dir: '../brand-edx.org' },
    { moduleName: '@edx/paragon/scss/core', dir: '../paragon', dist: 'scss/core' },
    { moduleName: '@edx/paragon', dir: '../paragon', dist: 'dist' },
  ],
};
```

NB: In order for webpack to properly resolve scss imports locally, you must use a `~` before the import, like so: `@import "~@edx/brand/paragon/fonts";`