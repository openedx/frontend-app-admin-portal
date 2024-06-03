import React, { useState, useMemo } from 'react';
import {
  Container,
  Tabs,
  Tab,
} from '@openedx/paragon';
import {
  useNavigate,
  generatePath,
} from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { defineMessages, FormattedMessage } from '@edx/frontend-platform/i18n';
import { useCurrentSettingsTab } from './data/hooks';
import {
  ACCESS_TAB,
  LMS_TAB,
  SSO_TAB,
  APPEARANCE_TAB,
  API_CREDENTIALS_TAB,
  SCHOLAR_THEME,
  SETTINGS_TABS_VALUES,
  SETTINGS_TAB_PARAM,
} from './data/constants';
import SettingsAccessTab from './SettingsAccessTab';
import { SettingsAppearanceTab } from './SettingsAppearanceTab';
import SettingsLMSTab from './SettingsLMSTab';
import SettingsSSOTab from './SettingsSSOTab';
import SettingsApiCredentialsTab from './SettingsApiCredentialsTab';
import { features } from '../../config';
import { updatePortalConfigurationEvent } from '../../data/actions/portalConfiguration';

const messages = defineMessages({
  [ACCESS_TAB]: {
    id: 'adminPortal.settings.accessTab.label',
    defaultMessage: 'Configure Access',
    description: 'Label for the access tab in the settings page.',
  },
  [LMS_TAB]: {
    id: 'adminPortal.settings.lmsTab.label',
    defaultMessage: 'Learning Platform',
    description: 'Label for the learning platform tab in the settings page.',
  },
  [SSO_TAB]: {
    id: 'adminPortal.settings.ssoTab.label',
    defaultMessage: 'Single Sign On (SSO)',
    description: 'Label for the SSO tab in the settings page.',
  },
  [APPEARANCE_TAB]: {
    id: 'adminPortal.settings.appearanceTab.label',
    defaultMessage: 'Portal Appearance',
    description: 'Label for the appearance tab in the settings page.',
  },
  [API_CREDENTIALS_TAB]: {
    id: 'adminPortal.settings.apiCredentialsTab.label',
    defaultMessage: 'API Credentials',
    description: 'Label for the API credentials tab in the settings page.',
  },
});

const SettingsTabs = ({
  enterpriseId,
  enterpriseSlug,
  enableIntegratedCustomerLearnerPortalSearch,
  enableLearnerPortal,
  enableLmsConfigurationsScreen,
  enableSamlConfigurationScreen,
  enableUniversalLink,
  enableApiCredentialGeneration,
  identityProvider,
  updatePortalConfiguration,
  enterpriseBranding,
}) => {
  const [hasSSOConfig, setHasSSOConfig] = useState(false);
  const {
    FEATURE_SSO_SETTINGS_TAB, SETTINGS_PAGE_LMS_TAB,
    SETTINGS_PAGE_APPEARANCE_TAB,
    FEATURE_API_CREDENTIALS_TAB,
  } = features;

  const tab = useCurrentSettingsTab();

  const navigate = useNavigate();

  const tabArray = useMemo(() => {
    const initialTabs = [];
    if (enableLearnerPortal) {
      initialTabs.push(
        <Tab
          key={ACCESS_TAB}
          eventKey={ACCESS_TAB}
          title={<FormattedMessage {...messages[ACCESS_TAB]} />}
        >
          <SettingsAccessTab
            enterpriseId={enterpriseId}
            enterpriseSlug={enterpriseSlug}
            enableIntegratedCustomerLearnerPortalSearch={enableIntegratedCustomerLearnerPortalSearch}
            identityProvider={identityProvider}
            enableLearnerPortal={enableLearnerPortal}
            enableUniversalLink={enableUniversalLink}
            updatePortalConfiguration={updatePortalConfiguration}
          />
        </Tab>,
      );
    }
    if (FEATURE_SSO_SETTINGS_TAB && enableSamlConfigurationScreen) {
      initialTabs.push(
        <Tab
          key={SSO_TAB}
          eventKey={SSO_TAB}
          title={<FormattedMessage {...messages[SSO_TAB]} />}
        >
          <SettingsSSOTab
            enterpriseId={enterpriseId}
            setHasSSOConfig={setHasSSOConfig}
          />
        </Tab>,
      );
    }
    if (SETTINGS_PAGE_LMS_TAB && enableLmsConfigurationsScreen) {
      initialTabs.push(
        <Tab
          key={LMS_TAB}
          eventKey={LMS_TAB}
          title={<FormattedMessage {...messages[LMS_TAB]} />}
        >
          <SettingsLMSTab
            enterpriseId={enterpriseId}
            enterpriseSlug={enterpriseSlug}
            enableSamlConfigurationScreen={enableSamlConfigurationScreen}
            identityProvider={identityProvider}
            hasSSOConfig={hasSSOConfig}
          />
        </Tab>,
      );
    }
    if (SETTINGS_PAGE_APPEARANCE_TAB) {
      initialTabs.push(
        <Tab
          key={APPEARANCE_TAB}
          eventKey={APPEARANCE_TAB}
          title={<FormattedMessage {...messages[APPEARANCE_TAB]} />}
        >
          <SettingsAppearanceTab
            enterpriseId={enterpriseId}
            enterpriseBranding={enterpriseBranding}
            updatePortalConfiguration={updatePortalConfiguration}
          />
        </Tab>,
      );
    }
    if (FEATURE_API_CREDENTIALS_TAB && enableApiCredentialGeneration) {
      initialTabs.push(
        <Tab
          key={API_CREDENTIALS_TAB}
          eventKey={API_CREDENTIALS_TAB}
          title={<FormattedMessage {...messages[API_CREDENTIALS_TAB]} />}
        >
          <SettingsApiCredentialsTab
            enterpriseId={enterpriseId}
            enterpriseSlug={enterpriseSlug}
          />
        </Tab>,
      );
    }

    return initialTabs;
  }, [
    FEATURE_SSO_SETTINGS_TAB,
    FEATURE_API_CREDENTIALS_TAB,
    SETTINGS_PAGE_APPEARANCE_TAB,
    SETTINGS_PAGE_LMS_TAB,
    enableIntegratedCustomerLearnerPortalSearch,
    enableLearnerPortal,
    enableLmsConfigurationsScreen,
    enableSamlConfigurationScreen,
    enableApiCredentialGeneration,
    enableUniversalLink,
    enterpriseId,
    enterpriseSlug,
    hasSSOConfig,
    identityProvider,
    updatePortalConfiguration,
    enterpriseBranding,
  ]);

  /**
   * Given a key from SETTINGS_TABS_VALUES, this function
   * will push a path into browser history
   * @param {string} newTabValue
   */
  const handleTabChange = (newTabValue) => {
    if (SETTINGS_TABS_VALUES[newTabValue]) {
      const newPath = generatePath(
        `/:enterpriseSlug/admin/settings/:${SETTINGS_TAB_PARAM}`,
        { enterpriseSlug, [SETTINGS_TAB_PARAM]: newTabValue },
      );
      navigate(newPath);
    }
  };

  return (
    <Container className="py-4" fluid>
      <Tabs
        id="settings-tabs"
        className="mb-3"
        activeKey={tab}
        onSelect={handleTabChange}
      >
        {tabArray}
      </Tabs>
    </Container>
  );
};

const mapStateToProps = state => {
  const {
    enterpriseId,
    enterpriseSlug,
    enableIntegratedCustomerLearnerPortalSearch,
    enableLearnerPortal,
    enableLmsConfigurationsScreen,
    enableSamlConfigurationScreen,
    enableApiCredentialGeneration,
    enableUniversalLink,
    identityProvider,
    enterpriseBranding,
  } = state.portalConfiguration;

  return ({
    enterpriseId,
    enterpriseSlug,
    enableIntegratedCustomerLearnerPortalSearch,
    enableLearnerPortal,
    enableLmsConfigurationsScreen,
    enableSamlConfigurationScreen,
    enableApiCredentialGeneration,
    enableUniversalLink,
    identityProvider,
    enterpriseBranding,
  });
};

SettingsTabs.defaultProps = {
  identityProvider: null,
  enterpriseBranding: PropTypes.shape({
    primary_color: SCHOLAR_THEME.button,
    secondary_color: SCHOLAR_THEME.banner,
    tertiary_color: SCHOLAR_THEME.accent,
  }),
};

SettingsTabs.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableIntegratedCustomerLearnerPortalSearch: PropTypes.bool.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
  enableLmsConfigurationsScreen: PropTypes.bool.isRequired,
  enableSamlConfigurationScreen: PropTypes.bool.isRequired,
  enableApiCredentialGeneration: PropTypes.bool.isRequired,
  enableUniversalLink: PropTypes.bool.isRequired,
  identityProvider: PropTypes.string,
  updatePortalConfiguration: PropTypes.func.isRequired,
  enterpriseBranding: PropTypes.shape({
    primary_color: PropTypes.string,
    secondary_color: PropTypes.string,
    tertiary_color: PropTypes.string,
  }),
};

const mapDispatchToProps = dispatch => ({
  updatePortalConfiguration: (config) => {
    dispatch(updatePortalConfigurationEvent(config));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsTabs);
