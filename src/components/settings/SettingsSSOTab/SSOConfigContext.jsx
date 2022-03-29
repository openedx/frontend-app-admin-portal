/* eslint-disable import/prefer-default-export */
import { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import SSOStateReducer from './data/reducer';
import { updateCurrentError, updateProviderConfig } from './data/actions';

const SSOConfigContext = createContext({});

export const SSO_INITIAL_STATE = {
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

const SSOConfigContextProvider = ({ children, initialState }) => {
  const [ssoState, dispatchSsoState] = useReducer(SSOStateReducer, initialState);

  // setter shortcuts
  const setProviderConfig = config => dispatchSsoState(updateProviderConfig(config));
  const setCurrentError = error => dispatchSsoState(updateCurrentError(error));

  return (
    <SSOConfigContext.Provider value={{
      ssoState,
      dispatchSsoState,
      setProviderConfig,
      setCurrentError,
    }}
    >
      {children}
    </SSOConfigContext.Provider>
  );
};

SSOConfigContextProvider.defaultProps = {
  initialState: SSO_INITIAL_STATE,
};

SSOConfigContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialState: PropTypes.shape({}),
};

export {
  SSOConfigContext,
  SSOConfigContextProvider,
};
