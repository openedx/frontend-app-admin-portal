import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import {
  initialize, APP_INIT_ERROR, APP_READY, subscribe, mergeConfig,
} from '@edx/frontend-platform';
import { ErrorPage } from '@edx/frontend-platform/react';

import App from './components/App';

import './index.scss';

subscribe(APP_READY, () => {
  ReactDOM.render(<App />, document.getElementById('root'));
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  handlers: {
    config: () => {
      mergeConfig({
        // Logs JS errors matching the following regex as NewRelic page actions instead of
        // errors,reducing JS error noise.
        IGNORED_ERROR_REGEX: '(Axios Error|\'removeChild\'|Script error|getReadModeExtract)',
        IS_MAINTENANCE_ALERT_ENABLED: process.env.IS_MAINTENANCE_ALERT_ENABLED || null,
        MAINTENANCE_ALERT_MESSAGE: process.env.MAINTENANCE_ALERT_MESSAGE || null,
        MAINTENANCE_ALERT_START_TIMESTAMP: process.env.MAINTENANCE_ALERT_START_TIMESTAMP || null,
      });
    },
  },
  messages: [],
  requireAuthenticatedUser: false,
  hydrateAuthenticatedUser: true,
});
