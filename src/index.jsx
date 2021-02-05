import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import {
  initialize, APP_INIT_ERROR, APP_READY, subscribe,
} from '@edx/frontend-platform';
import { ErrorPage } from '@edx/frontend-platform/react';

import * as FullStory from '@fullstory/browser';

import { configuration } from './config';

import App from './components/App';

import './index.scss';

subscribe(APP_READY, () => {
  ReactDOM.render(<App />, document.getElementById('root'));
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages: [],
  requireAuthenticatedUser: false,
  hydrateAuthenticatedUser: true,
});

if (configuration.FULLSTORY_ORG_ID) {
  FullStory.init({
    orgId: configuration.FULLSTORY_ORG_ID,
    devMode: !configuration.FULLSTORY_ENABLED,
  });
}
