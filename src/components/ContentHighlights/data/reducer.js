import { logError } from '@edx/frontend-platform/logging';
import {
  LAST_DELETED_HIGHLIGHT,
  TOGGLE_STEPPER_MODAL,
  SET_STEPPER_HIGHLIGHT_PUBLISHED,
  SET_STEPPER_HIGHLIGHT_CREATED,
  SET_STEPPER_HIGHLIGHT_TITLE,
  SET_STEPPER_HIGHLIGHT_SELECTEDROWS,
} from './actions';

export const initialContentHighlightsState = {
  stepperModal: {
    isOpen: false,
    currentStep: 0,
    highlightTitle: null,
    currentContentSelections: [],
    createdHighlight: false,
    publishedHighlight: false,
    selectedRows: [],
  },
  contentHighlights: [],
};

export const contentHighlightsReducer = (state = initialContentHighlightsState, action) => {
  switch (action.type) {
    case LAST_DELETED_HIGHLIGHT:
      return {
        ...state,
        lastDeletedHighlight: action.payload.lastDeletedHighlight,
      };
    case TOGGLE_STEPPER_MODAL:
      return {
        ...state,
        stepperModal: {
          ...state.stepperModal,
          isOpen: action.payload.isOpen,
        },
      };
    case SET_STEPPER_HIGHLIGHT_TITLE:
      return {
        ...state,
        stepperModal: {
          ...state.stepperModal,
          highlightTitle: action.payload.highlightTitle,
        },
      };
    case SET_STEPPER_HIGHLIGHT_PUBLISHED:
      return {
        ...state,
        stepperModal: {
          ...state.stepperModal,
          publishedHighlight: action.payload.publishedHighlight,
        },
      };
    case SET_STEPPER_HIGHLIGHT_CREATED:
      return {
        ...state,
        stepperModal: {
          ...state.stepperModal,
          createdHighlight: action.payload.createdHighlight,
        },
      };
    case SET_STEPPER_HIGHLIGHT_SELECTEDROWS:
      return {
        ...state,
        stepperModal: {
          ...state.stepperModal,
          selectedRows: action.payload.selectedRows,
        },
      };
    default: {
      const msg = `contentHighlightsReducer received an unexpected action type: ${action.type}`;
      logError(msg);
      throw new Error(msg);
    }
  }
};
