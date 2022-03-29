import {
  UPDATE_CURRENT_STEP, UPDATE_IDP_ENTRY_TYPE, UPDATE_IDP_METADATA_URL, UPDATE_SP_CONFIGURED,
  SET_PROVIDER_CONFIG, UPDATE_IDP_ENTITYID, UPDATE_CURRENT_ERROR, CLEAR_PROVIDER_CONFIG,
  UPDATE_IDP_DIRTYSTATE, UPDATE_CONNECT_IN_PROGRESS, UPDATE_CONNECT_IS_SSO_VALID,
} from './actions';

const SSOStateReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_IDP_METADATA_URL: {
      return { ...state, idp: { ...state.idp, metadataURL: action.metadataURL, isDirty: true } };
    }
    case UPDATE_IDP_ENTRY_TYPE: {
      return { ...state, idp: { ...state.idp, entryType: action.entryType, isDirty: true } };
    }
    case UPDATE_IDP_ENTITYID: {
      return { ...state, idp: { ...state.idp, entityID: action.entityID, isDirty: true } };
    }
    case UPDATE_IDP_DIRTYSTATE: {
      return { ...state, idp: { ...state.idp, isDirty: action.dirtyState } };
    }
    case UPDATE_CURRENT_STEP: {
      return { ...state, currentStep: action.step };
    }
    case UPDATE_CURRENT_ERROR: {
      return { ...state, currentError: action.error };
    }
    case UPDATE_SP_CONFIGURED: {
      return {
        ...state,
        serviceprovider: { ...state.serviceprovider, isSPConfigured: action.isSPConfigured },
      };
    }
    case UPDATE_CONNECT_IN_PROGRESS: {
      return {
        ...state,
        connect: { ...state.connect, inProgress: action.value },
      };
    }
    case UPDATE_CONNECT_IS_SSO_VALID: {
      return {
        ...state,
        connect: { ...state.connect, isSsoValid: action.isValid },
        serviceprovider: { ...state.serviceprovider, isSPConfigured: action.isValid },
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
