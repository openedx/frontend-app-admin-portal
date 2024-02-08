import { logError } from '@edx/frontend-platform/logging';
import { NEW_ARCHIVED_CONTENT_ALERT_DISMISSED_COOKIE_NAME, COURSE_RUN_STATUSES } from '../../ContentHighlights/data/constants';

export const initialReducerState = {
  isLoading: true,
  enterpriseCuration: null,
  enterpriseHighlightedSets: null,
  fetchError: null,
};

export const SET_IS_LOADING = 'SET_IS_LOADING';
export const SET_ENTERPRISE_CURATION = 'SET_ENTERPRISE_CURATION';
export const SET_FETCH_ERROR = 'SET_FETCH_ERROR';
export const DELETE_HIGHLIGHT_SET = 'DELETE_HIGHLIGHT_SET';
export const ADD_HIGHLIGHT_SET = 'ADD_HIGHLIGHT_SET';
export const SET_HIGHLIGHT_SET_TOAST_TEXT = 'SET_HIGHLIGHT_SET_TOAST_TEXT';
export const SET_HIGHLIGHT_TOAST_TEXT = 'SET_HIGHLIGHT_TOAST_TEXT';
export const SET_IS_NEW_ARCHIVED_COURSE = 'SET_IS_NEW_ARCHIVED_COURSE';
export const SET_ENTERPRISE_HIGHLIGHTED_CONTENTS = 'SET_ENTERPRISE_HIGHLIGHTED_CONTENTS';
export const UPDATE_DISMISSED_ARCHIVED_COURSE = 'UPDATE_DISMISSED_ARCHIVED_COURSE';

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
    type: SET_HIGHLIGHT_TOAST_TEXT,
    payload,
  }),
  setHighlightSetToast: (payload) => ({
    type: SET_HIGHLIGHT_SET_TOAST_TEXT,
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
  setEnterpriseHighlightedSets: (payload) => ({
    type: SET_ENTERPRISE_HIGHLIGHTED_CONTENTS,
    payload,
  }),
  setIsNewArchivedContent: (payload) => ({
    type: SET_IS_NEW_ARCHIVED_COURSE,
    payload,
  }),
  updateDismissedArchivedCourse: (payload) => ({
    type: UPDATE_DISMISSED_ARCHIVED_COURSE,
    payload,
  }),
};

function getHighlightSetsFromState(state) {
  return state.enterpriseCuration?.highlightSets || [];
}

/**
 * Helper function to determine if there is a new archived content in a highlight set
 *
 * @param {Array} payload Array of highlight set objects
 * [{
 *  cardImageUrl: bool,
 *  enterpriseCuration: string,
 *  highlightedContent: array,
 *  isPublished: bool,
 *  title: string,
 *  uuid: string,
 * }]
 * @returns {Boolean}
 */
function getIsNewArchivedContentFromState(payload) {
  let isNewArchivedContent = false;
  payload?.forEach(highlightSet => {
    const dismissedCookies = global.localStorage.getItem(`${NEW_ARCHIVED_CONTENT_ALERT_DISMISSED_COOKIE_NAME}-${highlightSet.uuid}`);
    // Checks that the highlightSet uuid isn't set
    if (!dismissedCookies) {
      highlightSet.highlightedContent.forEach(content => {
        // If the length > 1 for the course run status e.g. ["archived", "published"]
        // the content is not considered archived. An "unpublished" course run is not considered "archived" because
        // it could have a scheduled course run in the future.
        if (content.courseRunStatuses?.length === 1
          && content.courseRunStatuses?.includes(COURSE_RUN_STATUSES.archived)
        ) {
          isNewArchivedContent = true;
        }
      });
      // If the highlightSet uuid is already in the cookies, check if it includes the archived course content key
    } else {
      highlightSet.highlightedContent.forEach(content => {
        if (
          content.courseRunStatuses?.length === 1
          && content.courseRunStatuses?.includes(COURSE_RUN_STATUSES.archived)
          && !dismissedCookies.includes(content.contentKey)
        ) {
          isNewArchivedContent = true;
        }
      });
    }
  });
  return isNewArchivedContent;
}

function enterpriseCurationReducer(state, action) {
  switch (action.type) {
    case SET_IS_LOADING:
      return { ...state, isLoading: action.payload };
    case SET_ENTERPRISE_CURATION:
      return { ...state, enterpriseCuration: action.payload };
    case SET_ENTERPRISE_HIGHLIGHTED_CONTENTS:
      return { ...state, enterpriseHighlightedSets: action.payload };
    case SET_FETCH_ERROR:
      return { ...state, fetchError: action.payload };
    case SET_HIGHLIGHT_TOAST_TEXT: {
      return {
        ...state,
        enterpriseCuration: {
          ...state.enterpriseCuration,
          toastText: action.payload,
        },
      };
    }
    case SET_HIGHLIGHT_SET_TOAST_TEXT: {
      const existingHighlightSets = getHighlightSetsFromState(state);
      const filteredHighlightSets = existingHighlightSets.find(
        highlightSet => highlightSet.uuid === action.payload,
      );
      return {
        ...state,
        enterpriseCuration: {
          ...state.enterpriseCuration,
          toastText: filteredHighlightSets?.title,
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
    case SET_IS_NEW_ARCHIVED_COURSE: {
      const isNewArchivedContent = getIsNewArchivedContentFromState(action.payload);
      return {
        ...state,
        isNewArchivedContent,
      };
    }
    case UPDATE_DISMISSED_ARCHIVED_COURSE: {
      return {
        ...state,
        isNewArchivedContent: action.payload,
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
