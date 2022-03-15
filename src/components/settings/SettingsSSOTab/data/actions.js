export const UPDATE_IDP_METADATA_URL = 'update_idp_metadata_url';
export const UPDATE_IDP_ENTRY_TYPE = 'update_idp_entry_type';

// Use this action to update IDP metadata URL in client state
export const updateIdpMetadataURLAction = metadataURL => ({
  type: UPDATE_IDP_METADATA_URL,
  metadataURL,
});

export const updateIdpEntryTypeAction = entryType => ({
  type: UPDATE_IDP_ENTRY_TYPE,
  entryType,
});
