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
  const { pathname } = useLocation();

  return (
    <>
      <Helmet title={PAGE_TILE} />
      <Hero title={PAGE_TILE} />
      <Routes>
        <Route
          path="/"
          element={<Navigate to={`${pathname}/${DEFAULT_TAB}`} />}
        />
        {Object.values(SETTINGS_TABS_VALUES).map(path => (
          <Route
            key={path}
            path={`/${path}`}
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
