/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { ActionRow, Toast } from '@edx/paragon';
import ZeroStateCard from './ZeroStateCard';
import APICredentialsPage from './APICredentialsPage';
import FailedAlert from './FailedAlert';
import { API_CLIENT_DOCUMENTATION, HELP_CENTER_API_GUIDE } from '../data/constants';
import HelpCenterButton from '../HelpCenterButton';
import {
  DataContext, EnterpriseId, ErrorContext, ShowSuccessToast, ZeroStateHandlerContext,
} from './Context';
import LmsApiService from '../../../data/services/LmsApiService';

const SettingsApiCredentialsTab = ({
  enterpriseId,
}) => {
  const [displayZeroState, setDisplayZeroState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingData, setExistingData] = useState(null);
  const [data, setData] = useState();
  const [hasRegenerationError, setHasRegenerationError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchExistingAPICredentials = async () => {
      try {
        const response = await LmsApiService.fetchAPICredentials(enterpriseId);
        console.log('response ', response);
        const { results } = response.data;
        const result = results[0];
        setExistingData({
          name: result.name,
          redirect_uris: result.redirect_uris,
          client_id: result.client_id,
          client_secret: result.client_secret,
          api_client_documentation: API_CLIENT_DOCUMENTATION,
          updated: result.updated,
        });
        setIsLoading(false);
        setDisplayZeroState(false);
      } catch (error) {
        setIsLoading(false);
        setDisplayZeroState(true);
      }
    };
    console.log('here kira');
    fetchExistingAPICredentials();
  }, [enterpriseId]);

  return (
    <EnterpriseId.Provider value={enterpriseId}>
      <ZeroStateHandlerContext.Provider value={[displayZeroState, setDisplayZeroState]}>
        <ErrorContext.Provider value={[hasRegenerationError, setHasRegenerationError]}>
          <ShowSuccessToast.Provider value={[showToast, setShowToast]}>
            <DataContext.Provider value={[existingData, setExistingData]}>
              { hasRegenerationError && <FailedAlert /> }
              <ActionRow>
                <h2>API credentials</h2>
                <ActionRow.Spacer />
                <HelpCenterButton url={HELP_CENTER_API_GUIDE}>
                  Help Center: EdX Enterprise API Guide
                </HelpCenterButton>
              </ActionRow>
              <div className="mt-4">
                {!isLoading
                  && (
                    !displayZeroState ? (
                      <APICredentialsPage data={data} />
                    ) : (<ZeroStateCard setData={setData} />)
                  )}
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
            </DataContext.Provider>
          </ShowSuccessToast.Provider>
        </ErrorContext.Provider>
      </ZeroStateHandlerContext.Provider>
    </EnterpriseId.Provider>
  );
};
SettingsApiCredentialsTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};
export default SettingsApiCredentialsTab;
