import React, { useState, useCallback } from 'react';

import PropTypes from 'prop-types';
import { Info } from '@openedx/paragon/icons';
import {
  Alert,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
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
  const intl = useIntl();

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
          <Alert.Heading>
            <FormattedMessage
              id="adminPortal.settings.access.error"
              defaultMessage="Something went wrong"
              description="Error message heading"
            />
          </Alert.Heading>
          <FormattedMessage
            id="adminPortal.settings.access.error.message"
            defaultMessage="There was an issue with your request, please try again."
            description="Error message"
          />
        </Alert>
      )}
      <SettingsAccessTabSection
        title={intl.formatMessage({
          id: 'adminPortal.settings.access.sso.title',
          defaultMessage: 'Access via Single Sign-on',
          description: 'Title for the Single Sign-On access section',
        })}
        checked={enableIntegratedCustomerLearnerPortalSearch}
        disabled={!identityProvider}
        loading={isLoading}
        onFormSwitchChange={handleFormSwitchChange}
      >
        <p>
          <FormattedMessage
            id="adminPortal.settings.access.sso.description"
            defaultMessage="Give learners with Single Sign-On access to the catalog."
            description="Description for the Single Sign-On access section"
          />
        </p>
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
