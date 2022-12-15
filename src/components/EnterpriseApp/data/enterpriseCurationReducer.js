import { logError } from '@edx/frontend-platform/logging';

export const initialReducerState = {
  isLoading: true,
  enterpriseCuration: null,
  fetchError: null,
};

export const SET_IS_LOADING = 'SET_IS_LOADING';
export const SET_ENTERPRISE_CURATION = 'SET_ENTERPRISE_CURATION';
export const SET_FETCH_ERROR = 'SET_FETCH_ERROR';
export const DELETE_HIGHLIGHT_SET = 'DELETE_HIGHLIGHT_SET';
export const ADD_HIGHLIGHT_SET = 'ADD_HIGHLIGHT_SET';
export const SET_TOAST_TEXT = 'SET_TOAST_TEXT';

export const enterpriseCurationActions = {
  setIsLoading: (payload) => ({
    type: SET_IS_LOADING,
    payload,
  }),
  setEnterpriseCuration: (payload) => ({
    type: SET_ENTERPRISE_CURATION,
    payload,
  }),
  setFetchError: (payload) => ({
    type: SET_FETCH_ERROR,
    payload,
  }),
  setHighlightToast: (payload) => ({
    type: SET_TOAST_TEXT,
    payload,
  }),
  deleteHighlightSet: (payload) => ({
    type: DELETE_HIGHLIGHT_SET,
    payload,
  }),
  addHighlightSet: (payload) => ({
    type: ADD_HIGHLIGHT_SET,
    payload,
  }),
};

function getHighlightSetsFromState(state) {
  return state.enterpriseCuration?.highlightSets || [];
}

function enterpriseCurationReducer(state, action) {
  switch (action.type) {
    case SET_IS_LOADING:
      return { ...state, isLoading: action.payload };
    case SET_ENTERPRISE_CURATION:
      return { ...state, enterpriseCuration: action.payload };
    case SET_FETCH_ERROR:
      return { ...state, fetchError: action.payload };
    case SET_TOAST_TEXT: {
      const existingHighlightSets = getHighlightSetsFromState(state);
      const filteredHighlightSets = existingHighlightSets.filter(
        highlightSet => highlightSet.uuid === action.payload,
      );
      return {
        ...state,
        enterpriseCuration: {
          ...state.enterpriseCuration,
          toastText: filteredHighlightSets[0].title,
        },
      };
    }
    case DELETE_HIGHLIGHT_SET: {
      const existingHighlightSets = getHighlightSetsFromState(state);
      const filteredHighlightSets = existingHighlightSets.filter(
        highlightSet => highlightSet.uuid !== action.payload,
      );
      return {
        ...state,
        enterpriseCuration: {
          ...state.enterpriseCuration,
          highlightSets: filteredHighlightSets,
        },
      };
    }
    case ADD_HIGHLIGHT_SET: {
      const existingHighlightSets = getHighlightSetsFromState(state);
      return {
        ...state,
        enterpriseCuration: {
          ...state.enterpriseCuration,
          highlightSets: [action.payload, ...existingHighlightSets],
        },
      };
    }
    default: {
      const msg = `enterpriseCurationReducer received an unexpected action type: ${action.type}`;
      logError(msg);
      return state;
    }
  }
}

export default enterpriseCurationReducer;
