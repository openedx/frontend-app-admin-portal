import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Route,
  Routes,
  Navigate,
  useLocation, generatePath,
} from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';

import Hero from '../Hero';
import NotFoundPage from '../NotFoundPage';
import {
  DEFAULT_TAB,
  SETTINGS_TABS_VALUES,
} from './data/constants';
import SettingsTabs from './SettingsTabs';
import SyncHistory from './SettingsLMSTab/ErrorReporting/SyncHistory';

/**
 * Behaves as the router for settings page
 * When browsing to {path} (../admin/settings) redirect to default tab
 */
const SettingsPage = () => {
  const { pathname } = useLocation();
  const intl = useIntl();
  const tabRoute = generatePath(`${pathname}/${DEFAULT_TAB}`);
  const pageTitle = intl.formatMessage({
    id: 'admin.portal.settings.page.title',
    defaultMessage: 'Settings',
    description: 'Title for the Settings page.',
  });

  return (
    <>
      <Helmet title={pageTitle} />
      <Hero title={pageTitle} />
      <Routes>
        <Route
          path="/"
          element={<Navigate to={tabRoute} />}
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
