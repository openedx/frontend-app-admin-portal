import {
  UPDATE_CURRENT_STEP, UPDATE_IDP_ENTRY_TYPE, UPDATE_IDP_METADATA_URL, UPDATE_SP_CONFIGURED,
  SET_PROVIDER_CONFIG, UPDATE_IDP_ENTITYID, UPDATE_CURRENT_ERROR, CLEAR_PROVIDER_CONFIG,
} from './actions';

const SSOStateReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_IDP_METADATA_URL: {
      return { ...state, idp: { ...state.idp, metadataURL: action.metadataURL } };
    }
    case UPDATE_IDP_ENTRY_TYPE: {
      return { ...state, idp: { ...state.idp, entryType: action.entryType } };
    }
    case UPDATE_IDP_ENTITYID: {
      return { ...state, idp: { ...state.idp, entityID: action.entityID } };
    }
    case UPDATE_CURRENT_STEP: {
      return { ...state, currentStep: action.step };
    }
    case UPDATE_CURRENT_ERROR: {
      return { ...state, currentError: action.currentError };
    }
    case UPDATE_SP_CONFIGURED: {
      return {
        ...state,
        serviceprovider: { ...state.serviceprovider, isSPConfigured: action.isSPConfigured },
      };
    }
    case SET_PROVIDER_CONFIG: {
      return {
        ...state,
        providerConfig: action.providerConfig,
        idp: {
          ...state.idp,
          metadataURL: action.providerConfig.metadata_source,
          entityID: action.providerConfig.entity_id,
        },
      };
    }
    case CLEAR_PROVIDER_CONFIG: {
      return {
        ...state,
        providerConfig: null,
      };
    }
    default: return state;
  }
};

export default SSOStateReducer;
