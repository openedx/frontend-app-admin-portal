/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { logError } from '@edx/frontend-platform/logging';
import { ActionRow, Toast } from '@edx/paragon';
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
              <h2>API credentials</h2>
              <ActionRow.Spacer />
              <HelpCenterButton url={HELP_CENTER_API_GUIDE}>
                Help Center: EdX Enterprise API Guide
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
              API credentials successfully generated
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
