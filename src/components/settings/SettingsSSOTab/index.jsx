import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import { Alert, Hyperlink, Toast } from '@edx/paragon';
import { WarningFilled } from '@edx/paragon/icons';
import { HELP_CENTER_SAML_LINK } from '../data/constants';
import { useExistingSSOConfigs, useExistingProviderData } from './hooks';
import ExistingSSOConfigs from './ExistingSSOConfigs';
import NewSSOConfigForm from './NewSSOConfigForm';
import { SSOConfigContext, SSOConfigContextProvider } from './SSOConfigContext';

const SettingsSSOTab = ({ enterpriseId, setHasSSOConfig }) => {
  const {
    ssoState: { providerConfig, infoMessage, refreshBool },
    setInfoMessage,
    setRefreshBool,
  } = useContext(SSOConfigContext);
  const [existingConfigs, error, isLoading] = useExistingSSOConfigs(enterpriseId, refreshBool);
  const [existingProviderData, pdError, pdIsLoading] = useExistingProviderData(enterpriseId, refreshBool);

  useEffect(() => {
    let validConfigExists = false;
    existingConfigs.forEach(config => {
      if (config.was_valid_at) {
        validConfigExists = true;
      }
    });
    setHasSSOConfig(validConfigExists);
  }, [existingConfigs, setHasSSOConfig]);

  return (
    <div>
      <div className="d-flex">
        <h2 className="py-2">SAML Configuration</h2>
        <Hyperlink
          destination={HELP_CENTER_SAML_LINK}
          className="btn btn-outline-primary ml-auto my-2"
          target="_blank"
        >
          Help Center
        </Hyperlink>
      </div>
      {(!isLoading || !pdIsLoading) && (
        <div>
          {/* providerConfig represents the currently selected config to edit/create, if there are
          existing configs but no providerConfig then we can safely render the listings page */}
          {existingConfigs?.length > 0 && (providerConfig === null)
            && (
            <ExistingSSOConfigs
              providerData={existingProviderData}
              configs={existingConfigs}
              refreshBool={refreshBool}
              setRefreshBool={setRefreshBool}
            />
            )}
          {/* Nothing found so guide user to creation/edit form */}
          {existingConfigs?.length < 1 && <NewSSOConfigForm />}
          {/* Since we found a selected providerConfig we know we are in editing mode and can safely
          render the create/edit form */}
          {existingConfigs?.length > 0 && (providerConfig !== null) && <NewSSOConfigForm />}
          {error && (
          <Alert variant="warning" icon={WarningFilled}>
            An error occurred loading the SAML configs: <p>{error?.message}</p>
          </Alert>
          )}
          {pdError && (
          <Alert variant="warning" icon={WarningFilled}>
            An error occurred loading the SAML data: <p>{pdError?.message}</p>
          </Alert>
          )}
          {infoMessage && (
            <Toast
              onClose={() => setInfoMessage(null)}
              show={infoMessage.length > 0}
            >
              {infoMessage}
            </Toast>
          )}
        </div>
      )}
      {(isLoading || pdIsLoading) && <Skeleton count={5} height={10} />}
    </div>
  );
};

SettingsSSOTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  setHasSSOConfig: PropTypes.func.isRequired,
};

const WrappedSSOTab = ({ enterpriseId, setHasSSOConfig }) => (
  <SSOConfigContextProvider>
    <SettingsSSOTab enterpriseId={enterpriseId} setHasSSOConfig={setHasSSOConfig} />
  </SSOConfigContextProvider>
);

WrappedSSOTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  setHasSSOConfig: PropTypes.func.isRequired,
};

export default WrappedSSOTab;
