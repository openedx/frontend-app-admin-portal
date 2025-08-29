import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Info } from '@openedx/paragon/icons';
import {
  Alert,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';
import SettingsAccessTabSection from './SettingsAccessTabSection';

const SettingsAccessSubsidyRequestManagement = ({
  subsidyRequestConfiguration,
  updateSubsidyRequestConfiguration,
  disabled,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [isInitiallyDisabled, setIsInitiallyDisabled] = useState(disabled);
  const intl = useIntl();

  const subsidyRequestsEnabled = subsidyRequestConfiguration?.subsidyRequestsEnabled;

  const toggleSubsidyRequests = useCallback(async (isEnabled) => {
    setIsLoading(true);
    try {
      await updateSubsidyRequestConfiguration({
        isSubsidyRequestsEnabled: isEnabled,
      });
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [updateSubsidyRequestConfiguration]);

  useEffect(() => {
    if (disabled && subsidyRequestsEnabled) {
      toggleSubsidyRequests(false);
    }
  }, [disabled, subsidyRequestsEnabled, toggleSubsidyRequests]);

  useEffect(() => {
    // auto toggle to true if disabled becomes false
    if (isInitiallyDisabled && !disabled) {
      toggleSubsidyRequests(true);
      setIsInitiallyDisabled(false);
    }
  }, [disabled, isInitiallyDisabled, toggleSubsidyRequests]);

  const handleFormSwitchChange = useCallback(async (e) => {
    const formSwitchValue = e.target.checked;
    await toggleSubsidyRequests(formSwitchValue);
  }, [toggleSubsidyRequests]);

  return (
    <>
      {error && (
        <Alert icon={Info} variant="danger" dismissible>
          <Alert.Heading>
            <FormattedMessage
              id="settings.access.subsidyRequestManagement.error"
              defaultMessage="Something went wrong"
              description="Error message heading for subsidy request management"
            />
          </Alert.Heading>
          <FormattedMessage
            id="settings.access.subsidyRequestManagement.errorDescription"
            defaultMessage="There was an issue with your request, please try again."
            description="Error message description for subsidy request management"
          />
        </Alert>
      )}
      <SettingsAccessTabSection
        title={intl.formatMessage({
          id: 'settings.access.subsidyRequestManagement.title',
          defaultMessage: 'Course requests',
          description: 'Title for the subsidy request management section in the settings access tab',
        })}
        checked={subsidyRequestsEnabled}
        loading={isLoading}
        onFormSwitchChange={handleFormSwitchChange}
        formSwitchHelperText={disabled ? intl.formatMessage({
          id: 'settings.access.subsidyRequestManagement.disabled',
          defaultMessage: 'Enable access channel to activate this feature',
          description: 'Helper text for the subsidy request management form switch when it is disabled',
        }) : null}
        disabled={disabled}
      />
    </>
  );
};

SettingsAccessSubsidyRequestManagement.propTypes = {
  subsidyRequestConfiguration: PropTypes.shape({
    subsidyRequestsEnabled: PropTypes.bool.isRequired,
    subsidyType: PropTypes.oneOf(Object.values(SUPPORTED_SUBSIDY_TYPES)).isRequired,
  }).isRequired,
  updateSubsidyRequestConfiguration: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

SettingsAccessSubsidyRequestManagement.defaultProps = {
  disabled: false,
};

export default SettingsAccessSubsidyRequestManagement;
