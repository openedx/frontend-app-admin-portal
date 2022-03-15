/* eslint-disable import/prefer-default-export */
import { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import SSOStateReducer from './data/reducer';

const SSOConfigContext = createContext({});

const SSOConfigContextProvider = ({ children }) => {
  const SSO_INITIAL_STATE = {
    currentStep: 'idp',
    currentError: null,
    idp: {
      stepLabel: 'Identity Provider',
      isComplete: false,
      metadataURL: '',
      entryType: 'url', // vs directEntry
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
    },
  };
  const [ssoState, dispatchSsoState] = useReducer(SSOStateReducer, SSO_INITIAL_STATE);
  return (
    <SSOConfigContext.Provider value={{ ssoState, dispatchSsoState }}>
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
