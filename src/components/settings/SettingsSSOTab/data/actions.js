export const UPDATE_IDP_METADATA_URL = 'update_idp_metadata_url';
export const UPDATE_IDP_ENTRY_TYPE = 'update_idp_entry_type';
export const UPDATE_CURRENT_STEP = 'update_current_step';
export const UPDATE_SP_CONFIGURED = 'update_sp_configured';

// Use this action to update IDP metadata URL in client state
export const updateIdpMetadataURLAction = metadataURL => ({
  type: UPDATE_IDP_METADATA_URL,
  metadataURL,
});

export const updateIdpEntryTypeAction = entryType => ({
  type: UPDATE_IDP_ENTRY_TYPE,
  entryType,
});

export const updateCurrentstep = step => ({
  type: UPDATE_CURRENT_STEP,
  step,
});

export const updateServiceProviderConfigured = isSPConfigured => ({
  type: UPDATE_SP_CONFIGURED,
  isSPConfigured,
});