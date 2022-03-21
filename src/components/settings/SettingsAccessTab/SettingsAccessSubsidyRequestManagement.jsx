import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Info } from '@edx/paragon/icons';
import {
  Alert,
} from '@edx/paragon';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';
import SettingsAccessTabSection from './SettingsAccessTabSection';

const SettingsAccessSubsidyRequestManagement = ({
  subsidyRequestConfiguration,
  updateSubsidyRequestConfiguration,
  disabled,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const {
    subsidyRequestsEnabled,
  } = subsidyRequestConfiguration;

  const toggleSubsidyRequests = async (isEnabled) => {
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
  };

  useEffect(() => {
    if (disabled && subsidyRequestsEnabled) {
      toggleSubsidyRequests(false);
    }
  }, [disabled, subsidyRequestsEnabled]);

  const handleFormSwitchChange = useCallback(async (e) => {
    const formSwitchValue = e.target.checked;
    await toggleSubsidyRequests(formSwitchValue);
  }, [toggleSubsidyRequests]);

  return (
    <>
      {error && (
        <Alert icon={Info} variant="danger" dismissible>
          <Alert.Heading>Something went wrong</Alert.Heading>
          There was an issue with your request, please try again.
        </Alert>
      )}
      <SettingsAccessTabSection
        title="Course requests"
        checked={subsidyRequestsEnabled}
        loading={isLoading}
        onFormSwitchChange={handleFormSwitchChange}
        formSwitchHelperText={disabled ? 'Enable access channel to activate this feature' : null}
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
