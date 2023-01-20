import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Route,
  Switch,
  Redirect,
  useRouteMatch,
} from 'react-router-dom';

import Hero from '../Hero';
import NotFoundPage from '../NotFoundPage';
import {
  DEFAULT_TAB,
  SETTINGS_PARAM_MATCH,
} from './data/constants';
import SettingsTabs from './SettingsTabs';
import SyncHistory from './SettingsLMSTab/ErrorReporting/SyncHistory';

const PAGE_TILE = 'Settings';

/**
 * Behaves as the router for settings page
 * When browsing to {path} (../admin/settings) redirect to default tab
 */
const SettingsPage = () => {
  const { path } = useRouteMatch();
  return (
    <>
      <Helmet title={PAGE_TILE} />
      <Hero title={PAGE_TILE} />
      <Switch>
        <Redirect
          exact
          from={path}
          to={`${path}/${DEFAULT_TAB}`}
        />
        <Route
          exact
          path={`${path}/${SETTINGS_PARAM_MATCH}`}
          component={SettingsTabs}
        />
        <Route
          path={`${path}/lms/:lms/:configId`}
          component={SyncHistory}
        />
        <Route path="" component={NotFoundPage} />
      </Switch>
    </>
  );
};

export default SettingsPage;
