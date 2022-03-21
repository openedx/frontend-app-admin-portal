export const UPDATE_IDP_METADATA_URL = 'update_idp_metadata_url';
export const UPDATE_IDP_ENTRY_TYPE = 'update_idp_entry_type';
export const UPDATE_IDP_ENTITYID = 'update_idp_entityid';
export const UPDATE_CURRENT_STEP = 'update_current_step';
export const UPDATE_SP_CONFIGURED = 'update_sp_configured';
export const SET_PROVIDER_CONFIG = 'set_provider_config';
export const UPDATE_CURRENT_ERROR = 'update_current_error';
export const CLEAR_PROVIDER_CONFIG = 'clear_provider_config';

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

export const updateCurrentstep = step => ({
  type: UPDATE_CURRENT_STEP,
  step,
});

export const updateServiceProviderConfigured = isSPConfigured => ({
  type: UPDATE_SP_CONFIGURED,
  isSPConfigured,
});

export const setProviderConfig = providerConfig => ({
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
