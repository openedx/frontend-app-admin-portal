export const LAST_DELETED_HIGHLIGHT = 'LAST_DELETED_HIGHLIGHT';
export const lastDeletedHighlightAction = ({ lastDeletedHighlight }) => ({
  type: LAST_DELETED_HIGHLIGHT,
  payload: {
    lastDeletedHighlight,
  },
});

export const TOGGLE_STEPPER_MODAL = 'TOGGLE_STEPPER_MODAL';
export const toggleStepperModalAction = ({ isOpen }) => ({
  type: TOGGLE_STEPPER_MODAL,
  payload: {
    isOpen,
  },
});

export const SET_CURRENT_STEPPER_STEP = 'SET_CURRENT_STEPPER_STEP';
export const setCurrentStepperStep = ({ step }) => ({
  type: SET_CURRENT_STEPPER_STEP,
  payload: {
    step,
  },
});

export const SET_STEPPER_HIGHLIGHT_TITLE = 'SET_STEPPER_HIGHLIGHT_TITLE';
export const setStepperHighlightTitle = ({ highlightTitle }) => ({
  type: SET_STEPPER_HIGHLIGHT_TITLE,
  payload: {
    highlightTitle,
  },
});

export const SET_STEPPER_HIGHLIGHT_PUBLISHED = 'SET_STEPPER_HIGHLIGHT_PUBLISHED';
export const setStepperHighlightPublished = ({ publishedHighlight }) => ({
  type: SET_STEPPER_HIGHLIGHT_PUBLISHED,
  payload: {
    publishedHighlight,
  },
});

export const SET_STEPPER_HIGHLIGHT_CREATED = 'SET_STEPPER_HIGHLIGHT_CREATED';
export const setStepperHighlightCreated = ({ createdHighlight }) => ({
  type: SET_STEPPER_HIGHLIGHT_CREATED,
  payload: {
    createdHighlight,
  },
});

export const SET_STEPPER_HIGHLIGHT_SELECTEDROWS = 'SET_STEPPER_HIGHLIGHT_SELECTEDROWS';
export const setStepperHighlightSelectedRows = ({ selectedRows }) => ({
  type: SET_STEPPER_HIGHLIGHT_SELECTEDROWS,
  payload: {
    selectedRows,
  },
});
