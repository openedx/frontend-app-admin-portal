import { UPDATE_IDP_CURRENT_STEP, UPDATE_IDP_ENTRY_TYPE, UPDATE_IDP_METADATA_URL } from './actions';

const SSOStateReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_IDP_METADATA_URL: {
      return { ...state, idp: { ...state.idp, metadataURL: action.metadataURL } };
    }
    case UPDATE_IDP_ENTRY_TYPE: {
      return { ...state, idp: { ...state.idp, entryType: action.entryType } };
    }
    case UPDATE_IDP_CURRENT_STEP: {
      return { ...state, currentStep: action.step };
    }
    default: return state;
  }
};

export default SSOStateReducer;
