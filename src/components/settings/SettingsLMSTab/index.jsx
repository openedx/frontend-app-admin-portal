import { cloneDeep } from 'lodash-es';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import {
  Alert, Button, Skeleton, Toast, useToggle,
} from '@openedx/paragon';
import { Add, Info } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import HelpCenterButton from '../HelpCenterButton';
import { camelCaseDictArray, getChannelMap } from '../../../utils';
import LMSConfigPage from './LMSConfigPage';
import ExistingLMSCardDeck from './ExistingLMSCardDeck';
import NoConfigCard from './NoConfigCard';
import {
  ACTIVATE_TOAST_MESSAGE,
  DELETE_TOAST_MESSAGE,
  HELP_CENTER_LINK,
  INACTIVATE_TOAST_MESSAGE,
  SUBMIT_TOAST_MESSAGE,
} from '../data/constants';
import LmsApiService from '../../../data/services/LmsApiService';
import { useFormContext } from '../../forms/FormContext';

const SettingsLMSTab = ({
  enterpriseId,
  enterpriseSlug,
  enableSamlConfigurationScreen,
  identityProvider,
  hasSSOConfig,
}) => {
  const [config, setConfig] = useState();
  const [showToast, setShowToast] = useState(false);

  const [existingConfigsData, setExistingConfigsData] = useState({});
  const [configsExist, setConfigsExist] = useState(false);
  const [showNoConfigCard, setShowNoConfigCard] = useState(true);
  const [configsLoading, setConfigsLoading] = useState(true);
  const [displayNames, setDisplayNames] = useState(new Map());

  const [existingConfigFormData, setExistingConfigFormData] = useState({});
  const [toastMessage, setToastMessage] = useState();
  const [displayNeedsSSOAlert, setDisplayNeedsSSOAlert] = useState(false);
  const [lmsType, setLmsType] = useState('');
  const [isLmsStepperOpen, openLmsStepper, closeLmsStepper] = useToggle(false);
  const toastMessages = [ACTIVATE_TOAST_MESSAGE, DELETE_TOAST_MESSAGE, INACTIVATE_TOAST_MESSAGE, SUBMIT_TOAST_MESSAGE];
  const { dispatch } = useFormContext();
  const channelMap = useMemo(() => getChannelMap(), []);

  // onClick function for existing config cards' edit action
  const editExistingConfig = useCallback((configData, configType) => {
    setConfigsLoading(false);
    // Setting this allows us to skip the selection step in the stepper
    dispatch?.setFormFieldAction({ fieldId: 'lms', value: configData.channelCode });
    setLmsType(configData.channelCode);
    // Set the form data to the card's associated config data
    setExistingConfigFormData(cloneDeep(configData));
    // Set the config type to the card's type
    setConfig(configType);
    // Hide the create new configs button
    setShowNoConfigCard(false);
    // Since the user is editing, hide the existing config cards
    setConfigsExist(false);
    openLmsStepper();
  }, [dispatch, openLmsStepper]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    // if we have passed in params (lmsType and configId) from SyncHistory, user wants to edit that config
    if (query.has('lms') && query.has('id')) {
      const fetchData = async () => channelMap[query.get('lms')].fetch(query.get('id'));
      fetchData()
        .then((response) => {
          editExistingConfig(camelCaseObject(response.data), query.get('id'));
        })
        .catch((err) => {
          logError(err);
        });
    }
  }, [channelMap, editExistingConfig]);

  const fetchExistingConfigs = useCallback(() => {
    const options = { enterprise_customer: enterpriseId };
    LmsApiService.fetchEnterpriseCustomerIntegrationConfigs(options)
      .then((response) => {
        setConfigsLoading(false);
        // Save all existing configs
        setExistingConfigsData(camelCaseDictArray(response.data));
        // If the enterprise has existing configs
        if (response.data.length !== 0) {
          setShowNoConfigCard(false);
          // toggle the existing configs bool
          setConfigsExist(true);
        } else {
          setShowNoConfigCard(true);
        }
      })
      .catch((error) => {
        setConfigsLoading(false);
        // We can ignore errors here as user will see the banner in the next page refresh.
        logError(error);
      });
  }, [enterpriseId]);

  const onClick = (input) => {
    // Either we're creating a new config, or we're navigating back to
    // the landing state from a form (submit or cancel was hit on the forms).
    // In both cases, we want to clear existing config form data.
    setExistingConfigFormData({});
    // If either the user has submit or canceled
    if (input === '' || toastMessages.includes(input)) {
      // Re-fetch existing configs to get newly created ones
      fetchExistingConfigs();
    }
    if (toastMessages.includes(input)) {
      // show the toast and reset the config state
      setShowToast(true);
      setConfig('');
      setToastMessage(input);
      closeLmsStepper(true);
    } else {
      // Otherwise the user has clicked to create an lms and we need to open the stepper
      setConfigsExist(false);
      setConfig(input);
      openLmsStepper();
    }
  };

  useEffect(() => {
    // On load, fetch potential existing configs
    fetchExistingConfigs();
  }, [fetchExistingConfigs]);

  useEffect(() => {
    // Check if the customer needs an idp config
    setDisplayNeedsSSOAlert(enableSamlConfigurationScreen && !identityProvider);
  }, [enableSamlConfigurationScreen, identityProvider]);

  useEffect(() => {
    // update list of used display names to prevent duplicates
    const updatedMap = new Map();
    if (existingConfigsData[0]) {
      existingConfigsData?.forEach((existingConfig) => updatedMap.set(existingConfig.displayName, existingConfig.id));
    }
    setDisplayNames(updatedMap);
  }, [existingConfigsData]);

  return (
    <div>
      <h2 className="py-2">
        <FormattedMessage
          id="adminPortal.settings.learningPlatformTab.learningPlatformIntegrations.header"
          defaultMessage="Learning Platform Integrations"
          description="Header for the Learning Platform Integrations section"
        />
        <HelpCenterButton url={HELP_CENTER_LINK}>
          <FormattedMessage
            id="adminPortal.settings.learningPlatformTab.integrationsHelpCenter.button"
            defaultMessage="Help Center: Integrations"
            description="Button text for the Help Center link"
          />
        </HelpCenterButton>
        <div className="mt-3" style={{ pointerEvents: null }}>
          {!configsLoading && !config && (
            <Button
              variant="primary"
              className="side-button"
              iconBefore={Add}
              disabled={displayNeedsSSOAlert && !hasSSOConfig}
              onClick={openLmsStepper}
            >
              <FormattedMessage
                id="adminPortal.settings.learningPlatformTab.newButton"
                defaultMessage="New"
                description="Button text for creating a new LMS integration"
              />
            </Button>
          )}
        </div>
      </h2>
      {displayNeedsSSOAlert && !hasSSOConfig && (
        <Alert
          className="mw-lg sso-alert-modal-margin"
          variant="danger"
          icon={Info}
          actions={[
            <Link to={`/${enterpriseSlug}/admin/settings/sso`}>
              <Button>
                <FormattedMessage
                  id="adminPortal.settings.learningPlatformTab.configureSSOButton"
                  defaultMessage="Configure SSO"
                  description="Button text for configuring SSO"
                />
              </Button>
            </Link>,
          ]}
        >
          <Alert.Heading>
            <FormattedMessage
              id="adminPortal.settings.learningPlatformTab.noSSOConfigured"
              defaultMessage="No SSO configured"
              description="Alert heading for no SSO configured"
            />
          </Alert.Heading>
          <p>
            <FormattedMessage
              id="adminPortal.settings.learningPlatformTab.ssoNeeded"
              defaultMessage="At least one Single Sign On configuration is needed to create an LMS configuration"
              description="Alert message indicating that SSO is required to create an LMS configuration"
            />
          </p>
        </Alert>
      )}
      {configsExist && (
        <span>
          <ExistingLMSCardDeck
            configData={existingConfigsData}
            editExistingConfig={editExistingConfig}
            enterpriseCustomerUuid={enterpriseId}
            onClick={onClick}
          />
        </span>
      )}
      {configsLoading && (<span data-testid="skeleton"><Skeleton className="mb-4" count={2} height={20} /></span>)}
      {showNoConfigCard && !configsLoading && (
        <NoConfigCard
          enterpriseSlug={enterpriseSlug}
          setShowNoConfigCard={setShowNoConfigCard}
          openLmsStepper={openLmsStepper}
          hasSSOConfig={hasSSOConfig}
        />
      )}
      {isLmsStepperOpen && (
        <span>
          <LMSConfigPage
            onClick={onClick}
            existingConfigFormData={existingConfigFormData}
            existingConfigs={displayNames}
            setExistingConfigFormData={setExistingConfigFormData}
            isLmsStepperOpen={isLmsStepperOpen}
            closeLmsStepper={closeLmsStepper}
            lmsType={lmsType}
          />
        </span>
      )}
      {toastMessage && (
        <Toast onClose={() => setShowToast(false)} show={showToast}>{toastMessage}</Toast>
      )}
    </div>
  );
};

SettingsLMSTab.defaultProps = {
  identityProvider: null,
};

SettingsLMSTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableSamlConfigurationScreen: PropTypes.bool.isRequired,
  identityProvider: PropTypes.string,
  hasSSOConfig: PropTypes.bool.isRequired,
};

export default SettingsLMSTab;
