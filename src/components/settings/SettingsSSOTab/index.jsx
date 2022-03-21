import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import { Alert, Hyperlink } from '@edx/paragon';
import { WarningFilled } from '@edx/paragon/icons';
import { HELP_CENTER_SAML_LINK } from '../data/constants';
import { useExistingSSOConfigs } from './hooks';
import ExistingSSOConfigs from './ExistingSSOConfigs';
import NewSSOConfigForm from './NewSSOConfigForm';
import { SSOConfigContext, SSOConfigContextProvider } from './SSOConfigContext';

const SettingsSSOTab = ({ enterpriseId }) => {
  const [existingConfigs, error, isLoading] = useExistingSSOConfigs(enterpriseId);
  const { ssoState: { providerConfig } } = useContext(SSOConfigContext);
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
      {!isLoading && (
        <div>
          {/* Configs found and editing mode is off, so let's go to listing page */}
          {existingConfigs.length > 0 && (providerConfig === null) && <ExistingSSOConfigs configs={existingConfigs} />}
          {/* nothing found so guide user to creation form */}
          {existingConfigs.length < 1 && <NewSSOConfigForm />}
          {/* editing mode is active since we found a selected providerConfig */}
          {existingConfigs.length > 0 && (providerConfig !== null) && <NewSSOConfigForm />}
          {error && (
          <Alert
            variant="warning"
            icon={WarningFilled}
          >
            An error occurred loading the SAML configs: <p>{error?.message}</p>
          </Alert>
          )}
        </div>
      )}
      {isLoading && <Skeleton count={5} height={10} />}
    </div>
  );
};

SettingsSSOTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const Wrapped = ({ enterpriseId }) => (
  <SSOConfigContextProvider>
    <SettingsSSOTab enterpriseId={enterpriseId} />
  </SSOConfigContextProvider>
);

Wrapped.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default Wrapped;
