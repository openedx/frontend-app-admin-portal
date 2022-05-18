/* eslint-disable import/prefer-default-export */
import { createContext, useReducer } from 'react';
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
    entryType: 'url', // vs directEntry
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
  const setProviderConfig = config => dispatchSsoState(updateProviderConfig(config));
  const setCurrentError = error => dispatchSsoState(updateCurrentError(error));
  const setCurrentStep = step => dispatchSsoState(updateCurrentStep(step));
  const setIsSsoValid = valid => dispatchSsoState(updateConnectIsSsoValid(valid));
  const setInfoMessage = message => dispatchSsoState(updateInfoMessage(message));
  const setRefreshBool = refresh => dispatchSsoState(updateRefreshBool(refresh));
  const setStartTime = timeVal => dispatchSsoState(updateStartTime(timeVal));

  return (
    <SSOConfigContext.Provider value={{
      ssoState,
      dispatchSsoState,
      setProviderConfig,
      setCurrentError,
      setCurrentStep,
      setIsSsoValid,
      setInfoMessage,
      setRefreshBool,
      setStartTime,
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
