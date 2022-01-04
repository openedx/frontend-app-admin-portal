import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import {
  Route,
  Switch,
  Redirect,
  useRouteMatch,
} from 'react-router-dom';
import { connect } from 'react-redux';

import Hero from '../Hero';
import NotFoundPage from '../NotFoundPage';
import {
  DEFAULT_TAB,
  SETTINGS_PARAM_MATCH,
} from './data/constants';
import SettingsTabs from './SettingsTabs';
import SettingsContext from './SettingsContext';

const PAGE_TILE = 'Settings';

/**
 * Behaves as the router for settings page
 * When browsing to {path} (../admin/settings) redirect to default tab
 */
const SettingsPage = ({ enterpriseId }) => {
  const { path } = useRouteMatch();
  return (
    <SettingsContext enterpriseId={enterpriseId}>
      <Helmet title={PAGE_TILE} />
      <Hero title={PAGE_TILE} />
      <Switch>
        <Redirect
          exact
          key="settings"
          from={path}
          to={`${path}/${DEFAULT_TAB}`}
        />
        <Route
          key="settings"
          exact
          path={`${path}/${SETTINGS_PARAM_MATCH}`}
          component={SettingsTabs}
        />
        <Route path="" component={NotFoundPage} />
      </Switch>
    </SettingsContext>
  );
};

SettingsPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SettingsPage);
