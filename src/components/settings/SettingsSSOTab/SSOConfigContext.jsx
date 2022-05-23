/* eslint-disable import/prefer-default-export */
import {
  createContext, useReducer, useCallback, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import SSOStateReducer from './data/reducer';
import {
  updateConnectIsSsoValid,
  updateCurrentError,
  updateCurrentStep,
  updateInfoMessage,
  updateProviderConfig,
  updateStartTime,
  updateRefreshBool,
} from './data/actions';

const SSOConfigContext = createContext({});

export const SSO_INITIAL_STATE = {
  currentStep: 'idp',
  currentError: null,
  infoMessage: '',
  refreshBool: false,
  idp: {
    stepLabel: 'Identity Provider',
    isComplete: false,
    metadataURL: '',
    entityID: '',
    entryType: null, // url vs direct
    publicKey: '',
    ssoUrl: '',
    isDirty: false,
  },
  serviceprovider: {
    stepLabel: 'Service Provider',
    isSPConfigured: false, // this will be set for now to the same value as isSsoValid
    isComplete: false,
  },
  configure: {
    stepLabel: 'Configure',
    isComplete: false,
  },
  connect: {
    startTime: undefined, // when undefined, it means we are not tracking the connect progress.
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
  const setProviderConfig = useCallback((config) => {
    dispatchSsoState(updateProviderConfig(config));
  }, []);
  const setCurrentError = useCallback((error) => {
    dispatchSsoState(updateCurrentError(error));
  }, []);
  const setCurrentStep = useCallback((step) => {
    dispatchSsoState(updateCurrentStep(step));
  }, []);
  const setIsSsoValid = useCallback((valid) => {
    dispatchSsoState(updateConnectIsSsoValid(valid));
  }, []);
  const setInfoMessage = useCallback((message) => {
    dispatchSsoState(updateInfoMessage(message));
  }, []);
  const setRefreshBool = useCallback((refresh) => {
    dispatchSsoState(updateRefreshBool(refresh));
  }, []);
  const setStartTime = useCallback((timeVal) => {
    dispatchSsoState(updateStartTime(timeVal));
  }, []);

  const ssoProviderValue = useMemo(() => ({
    ssoState,
    dispatchSsoState,
    setProviderConfig,
    setCurrentError,
    setCurrentStep,
    setIsSsoValid,
    setInfoMessage,
    setRefreshBool,
    setStartTime,
  }), [
    ssoState, dispatchSsoState, setProviderConfig, setCurrentError, setCurrentStep, setIsSsoValid,
    setInfoMessage, setRefreshBool, setStartTime,
  ]);

  return (
    <SSOConfigContext.Provider value={ssoProviderValue}>
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
