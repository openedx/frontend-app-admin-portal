import { logError } from '@edx/frontend-platform/logging';
import { archivedHighlightsCoursesCookies, NEW_ARCHIVED_COURSE_ALERT_DISMISSED_COOKIE_NAME } from '../../ContentHighlights/data/constants';

export const initialReducerState = {
  isLoading: true,
  enterpriseCuration: null,
  enterpriseHighlightedContents: null,
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
  setEnterpriseHighlightedContents: (payload) => ({
    type: SET_ENTERPRISE_HIGHLIGHTED_CONTENTS,
    payload,
  }),
  setIsNewArchivedCourse: (payload) => ({
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

function getIsNewArchivedCourseFromState(payload) {
  const dismissedCookies = archivedHighlightsCoursesCookies.get(NEW_ARCHIVED_COURSE_ALERT_DISMISSED_COOKIE_NAME);
  const isDismissedArchivedCoursesSet = dismissedCookies !== undefined;
  const dismissedArchivedCourses = isDismissedArchivedCoursesSet ? dismissedCookies : {};
  let isNewArchivedCourse = false;
  // checks that the highlight uuid isn't set
  payload?.forEach(highlightSet => {
    if (!dismissedArchivedCourses[highlightSet.uuid]) {
      highlightSet.highlightedContent.forEach(courseContent => {
        // if the length is greater than 1 for the course run status e.g. ["archived", "published"]
        // the course should not be archived
        if (courseContent.courseRunStatuses?.length === 1 && courseContent.courseRunStatuses?.includes('archived')) {
          isNewArchivedCourse = true;
        }
      });
    } else {
      highlightSet.highlightedContent.forEach(courseContent => {
        if (courseContent.courseRunStatuses?.length === 1 && courseContent.courseRunStatuses?.includes('archived') && !dismissedArchivedCourses[highlightSet.uuid].includes(courseContent.contentKey)) {
          isNewArchivedCourse = true;
        }
      });
    }
  });

  return isNewArchivedCourse;
}

function enterpriseCurationReducer(state, action) {
  switch (action.type) {
    case SET_IS_LOADING:
      return { ...state, isLoading: action.payload };
    case SET_ENTERPRISE_CURATION:
      return { ...state, enterpriseCuration: action.payload };
    case SET_ENTERPRISE_HIGHLIGHTED_CONTENTS:
      return { ...state, enterpriseHighlightedContents: action.payload };
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
      const isNewArchivedCourse = getIsNewArchivedCourseFromState(action.payload);
      return {
        ...state,
        isNewArchivedCourse,
      };
    }
    case UPDATE_DISMISSED_ARCHIVED_COURSE: {
      return {
        ...state,
        isNewArchivedCourse: action.payload,
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
