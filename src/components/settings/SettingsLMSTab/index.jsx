import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import {
  Alert, Button, Hyperlink, Toast, Skeleton, useToggle,
} from '@edx/paragon';
import { Add, Info } from '@edx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';

import { camelCaseDictArray } from '../../../utils';
import LMSConfigPage from './LMSConfigPage';
import ExistingLMSCardDeck from './ExistingLMSCardDeck';
import NoConfigCard from './NoConfigCard';
import {
  HELP_CENTER_LINK,
  ACTIVATE_TOAST_MESSAGE,
  DELETE_TOAST_MESSAGE,
  INACTIVATE_TOAST_MESSAGE,
  SUBMIT_TOAST_MESSAGE,
} from '../data/constants';
import LmsApiService from '../../../data/services/LmsApiService';

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
  const [displayNames, setDisplayNames] = useState([]);

  const [existingConfigFormData, setExistingConfigFormData] = useState({});
  const [toastMessage, setToastMessage] = useState();
  const [displayNeedsSSOAlert, setDisplayNeedsSSOAlert] = useState(false);
  const [lmsType, setLmsType] = useState('');
  const [isLmsStepperOpen, openLmsStepper, closeLmsStepper] = useToggle(false);
  const toastMessages = [ACTIVATE_TOAST_MESSAGE, DELETE_TOAST_MESSAGE, INACTIVATE_TOAST_MESSAGE, SUBMIT_TOAST_MESSAGE];

  // onClick function for existing config cards' edit action
  const editExistingConfig = (configData, configType) => {
    setConfigsLoading(false);
    setLmsType(configData.channelCode);
    openLmsStepper();

    // How can I advance the step if I don’t have access to the dispatch in index.jsx?
    // Set the form data to the card's associated config data
    setExistingConfigFormData(configData);
    // Set the config type to the card's type
    setConfig(configType);
    // Hide the create new configs button
    setShowNoConfigCard(false);
    // Since the user is editing, hide the existing config cards
    setConfigsExist(false);
  };

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
    // Either we're creating a new config (a create config card was clicked), or we're navigating
    // back to the landing state from a form (submit or cancel was hit on the forms). In both cases,
    // we want to clear existing config form data.
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
    // On load fetch potential existing configs
    fetchExistingConfigs();
  }, [fetchExistingConfigs]);

  useEffect(() => {
    // Check if the customer needs an idp config
    setDisplayNeedsSSOAlert(enableSamlConfigurationScreen && !identityProvider);
  }, [enableSamlConfigurationScreen, identityProvider]);

  useEffect(() => {
    // update list of used display names to prevent duplicates
    if (existingConfigsData[0]) {
      setDisplayNames(existingConfigsData?.map((existingConfig) => existingConfig.displayName));
    }
  }, [existingConfigsData]);

  return (
    <div>
      <h2 className="py-2">Learning Platform Integrations
        <Hyperlink
          destination={HELP_CENTER_LINK}
          className="btn btn-outline-primary side-button"
          target="_blank"
        >
          Help Center: Integrations
        </Hyperlink>
        <div className="mt-3" style={{ pointerEvents: null }}>
          {!configsLoading && !config && (
          <Button
            variant="primary"
            className="side-button"
            iconBefore={Add}
            disabled={displayNeedsSSOAlert && !hasSSOConfig}
            onClick={openLmsStepper}
          >
            New
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
              <Button>Configure SSO</Button>
            </Link>,
          ]}
        >
          <Alert.Heading>No SSO configured</Alert.Heading>
          <p>
            At least one Single Sign On configuration is needed to create an LMS configuration
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
            onClick
            existingConfigFormData={existingConfigFormData}
            existingConfigs={displayNames}
            setExistingConfigFormData
            isLmsStepperOpen
            closeLmsStepper
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
