import React, { useEffect, useState } from 'react';
import {
  Alert, Button, Hyperlink, CardGrid, Toast,
} from '@edx/paragon';
import { Link } from 'react-router-dom';
import { Add, Info } from '@edx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import PropTypes from 'prop-types';

import { camelCaseDictArray } from '../../../utils';
import LMSCard from './LMSCard';
import LMSConfigPage from './LMSConfigPage';
import ExistingLMSCardDeck from './ExistingLMSCardDeck';
import {
  BLACKBOARD_TYPE,
  CANVAS_TYPE,
  CORNERSTONE_TYPE,
  DEGREED2_TYPE,
  HELP_CENTER_LINK,
  MOODLE_TYPE,
  SAP_TYPE,
  SUCCESS_LABEL,
  DELETE_SUCCESS_LABEL,
  TOGGLE_SUCCESS_LABEL,
} from '../data/constants';
import LmsApiService from '../../../data/services/LmsApiService';

const SUBMIT_TOAST_MESSAGE = 'Configuration was submitted successfully.';
const TOGGLE_TOAST_MESSAGE = 'Configuration was toggled successfully.';
const DELETE_TOAST_MESSAGE = 'Configuration was successfully removed.';

export default function SettingsLMSTab({
  enterpriseId,
  enterpriseSlug,
  enableSamlConfigurationScreen,
  identityProvider,
}) {
  const [config, setConfig] = useState();
  const [showToast, setShowToast] = useState(false);

  const [existingConfigsData, setExistingConfigsData] = useState({});
  const [configsExist, setConfigsExist] = useState(false);
  const [showNewConfigButtons, setShowNewConfigButtons] = useState(true);

  const [existingConfigFormData, setExistingConfigFormData] = useState({});
  const [toastMessage, setToastMessage] = useState();
  const [displayNeedsSSOAlert, setDisplayNeedsSSOAlert] = useState(false);

  // onClick function for existing config cards' edit action
  const editExistingConfig = (configData, configType) => {
    // Set the form data to the card's
    setExistingConfigFormData(configData);
    // Set the config type to the card's type
    setConfig(configType);
    // Hide the create new configs button
    setShowNewConfigButtons(true);
    // Since the user is editing, hide the existing config cards
    setConfigsExist(false);
  };

  const fetchExistingConfigs = () => {
    const options = { enterprise_customer: enterpriseId };
    LmsApiService.fetchEnterpriseCustomerIntegrationConfigs(options)
      .then((response) => {
        // If the enterprise has existing configs
        if (response.data.length !== 0) {
          // Save all existing configs
          setExistingConfigsData(camelCaseDictArray(response.data));
          // toggle the existing configs bool
          setConfigsExist(true);
          // Hide the create cards and show the create button
          setShowNewConfigButtons(false);
        }
      })
      .catch((error) => {
        // We can ignore errors here as user will se the banner in the next page refresh.
        logError(error);
      });
  };

  const onClick = (input) => {
    // Either we're creating a new config (a create config card was clicked), or we're navigating
    // back to the landing state from a form (submit or cancel was hit on the forms). In both cases,
    // we want to clear existing config form data.
    setExistingConfigFormData({});

    // If either the user has submit or canceled
    if (input === '' || [SUCCESS_LABEL, DELETE_SUCCESS_LABEL, TOGGLE_SUCCESS_LABEL].includes(input)) {
      // Re-fetch existing configs to get newly created ones
      fetchExistingConfigs();
    }
    // If the user submitted
    if (input === SUCCESS_LABEL) {
      // show the toast and reset the config state
      setShowToast(true);
      setConfig('');
      setToastMessage(SUBMIT_TOAST_MESSAGE);
    } else if (input === TOGGLE_SUCCESS_LABEL) {
      setShowToast(true);
      setConfig('');
      setToastMessage(TOGGLE_TOAST_MESSAGE);
    } else if (input === DELETE_SUCCESS_LABEL) {
      setShowToast(true);
      setConfig('');
      setToastMessage(DELETE_TOAST_MESSAGE);
    } else {
      // Otherwise the user has clicked a create card and we need to set existing config bool to
      // false and set the config type to the card that was clicked type
      setConfigsExist(false);
      setConfig(input);
    }
  };

  // onClick function for the show create cards button
  const showCreateConfigCards = () => {
    setShowNewConfigButtons(true);
  };

  useEffect(() => {
    // On load fetch potential existing configs
    fetchExistingConfigs();
  }, []);

  useEffect(() => {
    // Check if the customer needs an idp config
    setDisplayNeedsSSOAlert(enableSamlConfigurationScreen && !identityProvider);
  }, [enableSamlConfigurationScreen, identityProvider]);

  return (
    <div>
      <div className="d-flex">
        <h2 className="py-2">Learning Management System Configuration</h2>
        <Hyperlink
          destination={HELP_CENTER_LINK}
          className="btn btn-outline-primary ml-auto my-2"
          target="_blank"
        >
          Help Center
        </Hyperlink>
      </div>
      <p>
        Enabling a learning management system for your edX account allows quick
        access to the catalog
      </p>
      {displayNeedsSSOAlert && (
        <Alert
          className="mr-6 sso-alert-modal-margin"
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
          <h4 className="mt-5 mb-4">Existing configurations</h4>
          <ExistingLMSCardDeck
            configData={existingConfigsData}
            editExistingConfig={editExistingConfig}
            enterpriseCustomerUuid={enterpriseId}
            onClick={onClick}
          />
        </span>
      )}
      {!showNewConfigButtons && (
        <Button
          varient="primary"
          className="mr-6"
          iconBefore={Add}
          size="lg"
          block
          disabled={displayNeedsSSOAlert}
          onClick={showCreateConfigCards}
        >
          New configuration
        </Button>
      )}
      {showNewConfigButtons && !config && (
        <span>
          <h4 className="mt-5">New configurations</h4>
          <p className="mb-4">Click on a card to start a new configuration</p>

          <CardGrid
            columnSizes={{
              xs: 6,
              s: 5,
              m: 4,
              l: 4,
              xl: 3,
            }}
          >
            <LMSCard LMSType={SAP_TYPE} disabled={displayNeedsSSOAlert} onClick={onClick} />
            <LMSCard LMSType={MOODLE_TYPE} disabled={displayNeedsSSOAlert} onClick={onClick} />
            <LMSCard LMSType={CORNERSTONE_TYPE} disabled={displayNeedsSSOAlert} onClick={onClick} />
            <LMSCard LMSType={CANVAS_TYPE} disabled={displayNeedsSSOAlert} onClick={onClick} />
            <LMSCard LMSType={DEGREED2_TYPE} disabled={displayNeedsSSOAlert} onClick={onClick} />
            <LMSCard LMSType={BLACKBOARD_TYPE} disabled={displayNeedsSSOAlert} onClick={onClick} />
          </CardGrid>
        </span>
      )}
      {config && (
        <span>
          <LMSConfigPage LMSType={config} onClick={onClick} existingConfigFormData={existingConfigFormData} />
        </span>
      )}
      {toastMessage && (
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
        >
          {toastMessage}
        </Toast>
      )}
    </div>
  );
}

SettingsLMSTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableSamlConfigurationScreen: PropTypes.bool.isRequired,
  identityProvider: PropTypes.string.isRequired,
};
