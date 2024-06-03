/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { logError } from '@edx/frontend-platform/logging';
import { ActionRow, Toast } from '@openedx/paragon';
import ZeroStateCard from './ZeroStateCard';
import APICredentialsPage from './APICredentialsPage';
import FailedAlert from './FailedAlert';
import { HELP_CENTER_API_GUIDE } from '../data/constants';
import HelpCenterButton from '../HelpCenterButton';
import {
  EnterpriseId, ErrorContext, ShowSuccessToast,
} from './Context';
import LmsApiService from '../../../data/services/LmsApiService';

const SettingsApiCredentialsTab = ({
  enterpriseId,
}) => {
  const [data, setData] = useState();
  const [hasRegenerationError, setHasRegenerationError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchExistingAPICredentials = async () => {
      try {
        const response = await LmsApiService.fetchAPICredentials(enterpriseId);
        setData(response.data);
      } catch (error) {
        logError(error);
      }
    };
    fetchExistingAPICredentials();
  }, [enterpriseId]);

  return (
    <p className="m-3">
      <EnterpriseId.Provider value={enterpriseId}>
        <ErrorContext.Provider value={[hasRegenerationError, setHasRegenerationError]}>
          <ShowSuccessToast.Provider value={[showToast, setShowToast]}>
            { hasRegenerationError && <FailedAlert /> }
            <ActionRow>
              <h2>
                <FormattedMessage
                  id="adminPortal.settings.apiCredentialsTab.header"
                  defaultMessage="API credentials"
                  description="Header for the API credentials section"
                />
              </h2>
              <ActionRow.Spacer />
              <HelpCenterButton url={HELP_CENTER_API_GUIDE}>
                <FormattedMessage
                  id="adminPortal.settings.apiCredentialsTab.helpCenter"
                  defaultMessage="Help Center: EdX Enterprise API Guide"
                  description="Text for the Help Center button linking to the API guide"
                />
              </HelpCenterButton>
            </ActionRow>
            <div className="mt-4">
              {!data ? (
                <ZeroStateCard setShowToast={setShowToast} setData={setData} />
              ) : (<APICredentialsPage data={data} setData={setData} />)}
            </div>
            <div />
            { showToast && (
            <Toast
              onClose={() => setShowToast(false)}
              show={showToast}
            >
              <FormattedMessage
                id="adminPortal.settings.apiCredentialsTab.successMessage"
                defaultMessage="API credentials successfully generated"
                description="Message shown when API credentials are successfully generated"
              />
            </Toast>
            )}
          </ShowSuccessToast.Provider>
        </ErrorContext.Provider>
      </EnterpriseId.Provider>
    </p>
  );
};
SettingsApiCredentialsTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};
export default SettingsApiCredentialsTab;
