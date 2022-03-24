/* eslint-disable import/prefer-default-export */
import { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import SSOStateReducer from './data/reducer';
import { updateProviderConfig } from './data/actions';

const SSOConfigContext = createContext({});

const SSOConfigContextProvider = ({ children }) => {
  const SSO_INITIAL_STATE = {
    currentStep: 'idp',
    currentError: null,
    idp: {
      stepLabel: 'Identity Provider',
      isComplete: false,
      metadataURL: '',
      entityID: '',
      entryType: 'url', // vs directEntry
      isDirty: false,
    },
    serviceprovider: {
      stepLabel: 'Service Provider',
      isSPConfigured: false,
      isComplete: false,
    },
    configure: {
      stepLabel: 'Configure',
      isComplete: false,
    },
    connect: {
      stepLabel: 'Connect',
      isComplete: false,
      isSsoValid: false,
      inProgress: false, // if testing is happening this will be set to true,
    },
    providerConfig: null, // the provider config we are working with currently
  };

  const [ssoState, dispatchSsoState] = useReducer(SSOStateReducer, SSO_INITIAL_STATE);

  // setter shortcuts
  const setProviderConfig = config => dispatchSsoState(updateProviderConfig(config));

  return (
    <SSOConfigContext.Provider value={{
      ssoState,
      dispatchSsoState,
      setProviderConfig,
    }}
    >
      {children}
    </SSOConfigContext.Provider>
  );
};

SSOConfigContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export {
  SSOConfigContext,
  SSOConfigContextProvider,
};
