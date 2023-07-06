import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom';

import Hero from '../Hero';
import NotFoundPage from '../NotFoundPage';
import {
  DEFAULT_TAB,
  SETTINGS_TABS_VALUES,
} from './data/constants';
import SettingsTabs from './SettingsTabs';
import SyncHistory from './SettingsLMSTab/ErrorReporting/SyncHistory';

const PAGE_TILE = 'Settings';

/**
 * Behaves as the router for settings page
 * When browsing to {path} (../admin/settings) redirect to default tab
 */
const SettingsPage = () => {
  const allSettingsTabs = [
    SETTINGS_TABS_VALUES.access,
    SETTINGS_TABS_VALUES.appearance,
    SETTINGS_TABS_VALUES.sso,
    SETTINGS_TABS_VALUES.lms,
  ];
  const { pathname } = useLocation();
  const currentPath = pathname === '/' ? '' : pathname;

  return (
    <>
      <Helmet title={PAGE_TILE} />
      <Hero title={PAGE_TILE} />
      <Routes>
        <Route
          path="/"
          element={<Navigate to={`${currentPath}/${DEFAULT_TAB}`} />}
        />
        {allSettingsTabs.map(path => (
          <Route
            path={`/${path}?`}
            element={<SettingsTabs />}
          />
        ))}
        <Route
          path="lms/:lms/:configId"
          element={<SyncHistory />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default SettingsPage;
