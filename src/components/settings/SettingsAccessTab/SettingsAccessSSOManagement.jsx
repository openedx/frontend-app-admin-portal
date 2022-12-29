import React, { useState, useCallback } from 'react';

import PropTypes from 'prop-types';
import { Info } from '@edx/paragon/icons';
import {
  Alert,
} from '@edx/paragon';
import SettingsAccessTabSection from './SettingsAccessTabSection';
import LmsApiService from '../../../data/services/LmsApiService';

const SettingsAccessSSOManagement = ({
  enterpriseId,
  enableIntegratedCustomerLearnerPortalSearch,
  identityProvider,
  updatePortalConfiguration,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const handleFormSwitchChange = useCallback(async (e) => {
    const formSwitchValue = e.target.checked;
    setIsLoading(true);

    try {
      await LmsApiService.updateEnterpriseCustomer(enterpriseId, {
        enable_integrated_customer_learner_portal_search: formSwitchValue,
      });
      updatePortalConfiguration({
        enableIntegratedCustomerLearnerPortalSearch: formSwitchValue,
      });
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [enterpriseId, updatePortalConfiguration]);

  return (
    <>
      {error && (
        <Alert icon={Info} variant="danger" dismissible>
          <Alert.Heading>Something went wrong</Alert.Heading>
          There was an issue with your request, please try again.
        </Alert>
      )}
      <SettingsAccessTabSection
        title="Access via Single Sign-on"
        checked={enableIntegratedCustomerLearnerPortalSearch}
        disabled={!identityProvider}
        loading={isLoading}
        onFormSwitchChange={handleFormSwitchChange}
      >
        <p>Give learners with Single Sign-On access to the catalog.</p>
      </SettingsAccessTabSection>
    </>
  );
};

SettingsAccessSSOManagement.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enableIntegratedCustomerLearnerPortalSearch: PropTypes.bool.isRequired,
  identityProvider: PropTypes.string,
  updatePortalConfiguration: PropTypes.func.isRequired,
};

SettingsAccessSSOManagement.defaultProps = {
  identityProvider: undefined,
};

export default SettingsAccessSSOManagement;
