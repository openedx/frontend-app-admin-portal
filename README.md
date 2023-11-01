# frontend-app-admin-portal

![Build Status](https://github.com/openedx/frontend-app-admin-portal/actions/workflows/ci.yml/badge.svg)
![Codecov](https://codecov.io/gh/edx/frontend-app-admin-portal/branch/master/graph/badge.svg)

# Purpose
frontend-app-admin-portal is a frontend that provides branded learning experiences as well as a dashboard for enterprise learning administrators.

# Getting Started

## Setting up a dev environment

### The Short Story

1. Set up docker devstack locally, and start the service containers (see https://github.com/openedx/devstack)

2. Set up and run the edx-analytics-data-api (https://github.com/openedx/edx-analytics-data-api) locally

3. Clone this repo and install npm requirements:

```
$ git clone git@github.com:edx/frontend-app-admin-portal.git
$ cd frontend-app-admin-portal
$ nvm use (if using nvm) OR install and switch to version of node/npm as per the .nvmrc file to avoid issues during npm install or npm start (and to use the same version of node/npm as used by team plus CI builds)
$ npm install
$ npm start # or "npm run start:with-theme" if you want edX branding
```

The application is now running and can be accessed in a web browser at http://localhost:1991/


#### Themes

By default, the core Paragon theme is installed and used with the `npm start` command. If you'd like to use the @edx/brand-edx.org theme, use the `npm run start:with-theme` command.


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

Follow the instructions for how to get data into the edx-analytics-data-api in the repo README here: https://github.com/openedx/edx-analytics-data-api, using the UUID for the enterprise customer you just created.

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


## Getting Help

If you're having trouble, we have discussion forums at
https://discuss.openedx.org where you can connect with others in the community.

Our real-time conversations are on Slack. You can request a `Slack
invitation`_, then join our `community Slack workspace`_.  Because this is a
frontend repository, the best place to discuss it would be in the `#wg-frontend
channel`_.

For anything non-trivial, the best path is to open an issue in this repository
with as many details about the issue you are facing as you can provide.

https://github.com/openedx/frontend-app-admin-portal/issues

For more information about these options, see the `Getting Help`_ page.

.. _Slack invitation: https://openedx.org/slack
.. _community Slack workspace: https://openedx.slack.com/
.. _#wg-frontend channel: https://openedx.slack.com/archives/C04BM6YC7A6
.. _Getting Help: https://openedx.org/community/connect

## Contributing

Contributions are very welcome.  Please read `How To Contribute`_ for details.

.. _How To Contribute: https://openedx.org/r/how-to-contribute

This project is currently accepting all types of contributions, bug fixes,
security fixes, maintenance work, or new features.  However, please make sure
to have a discussion about your new feature idea with the maintainers prior to
beginning development to maximize the chances of your change being accepted.
You can start a conversation by creating a new issue on this repo summarizing
your idea.

## The Open edX Code of Conduct

All community members are expected to follow the `Open edX Code of Conduct`_.

.. _Open edX Code of Conduct: https://openedx.org/code-of-conduct/

## License

The code in this repository is licensed under the AGPLv3 unless otherwise
noted.

Please see `LICENSE <LICENSE>`_ for details.

## Reporting Security Issues

Please do not report security issues in public. Please email security@openedx.org.
