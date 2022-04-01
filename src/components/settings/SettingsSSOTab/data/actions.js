export const UPDATE_IDP_METADATA_URL = 'update_idp_metadata_url';
export const UPDATE_IDP_ENTRY_TYPE = 'update_idp_entry_type';
export const UPDATE_IDP_ENTITYID = 'update_idp_entityid';
export const UPDATE_IDP_DIRTYSTATE = 'update_idp_dirtystate';
export const UPDATE_CURRENT_STEP = 'update_current_step';
export const UPDATE_SP_CONFIGURED = 'update_sp_configured';
export const UPDATE_CONNECT_IN_PROGRESS = 'update_connect_in_progress';
export const UPDATE_CONNECT_IS_SSO_VALID = 'update_connect_is_sso_valid';
export const SET_PROVIDER_CONFIG = 'set_provider_config';
export const UPDATE_CURRENT_ERROR = 'update_current_error';
export const CLEAR_PROVIDER_CONFIG = 'clear_provider_config';
export const UPDATE_INFO_MESSAGE = 'update_info_message';
export const UPDATE_CONNECT_START_TIME = 'update_connect_start_time';

// Use this action to update IDP metadata URL in client state
export const updateIdpMetadataURLAction = metadataURL => ({
  type: UPDATE_IDP_METADATA_URL,
  metadataURL,
});

export const updateIdpEntryTypeAction = entryType => ({
  type: UPDATE_IDP_ENTRY_TYPE,
  entryType,
});

export const updateEntityIDAction = entityID => ({
  type: UPDATE_IDP_ENTITYID,
  entityID,
});

export const updateIdpDirtyState = dirtyState => ({
  type: UPDATE_IDP_DIRTYSTATE,
  dirtyState,
});

export const updateConnectInProgress = value => ({
  type: UPDATE_CONNECT_IN_PROGRESS,
  value,
});

export const updateConnectIsSsoValid = isValid => ({
  type: UPDATE_CONNECT_IS_SSO_VALID,
  isValid,
});

export const updateCurrentstep = step => ({
  type: UPDATE_CURRENT_STEP,
  step,
});

export const updateServiceProviderConfigured = isSPConfigured => ({
  type: UPDATE_SP_CONFIGURED,
  isSPConfigured,
});

export const updateProviderConfig = providerConfig => ({
  type: SET_PROVIDER_CONFIG,
  providerConfig,
});

// used when we want to clear currently selected provider
// typically used to take UI back to the listing page of providers
export const clearProviderConfig = () => ({
  type: CLEAR_PROVIDER_CONFIG,
});

export const updateCurrentError = error => ({
  type: UPDATE_CURRENT_ERROR,
  error,
});

export const updateInfoMessage = infoMessage => ({
  type: UPDATE_INFO_MESSAGE,
  infoMessage,
});

// Use this action to update connect.startTime
export const updateStartTime = startTime => ({
  type: UPDATE_CONNECT_START_TIME,
  startTime,
});
