export const SET_HIGHLIGHT_STEPPER_MODAL = 'SET_HIGHLIGHT_STEPPER_MODAL';
export const setHighlightStepperModal = isOpen => ({
  type: SET_HIGHLIGHT_STEPPER_MODAL,
  payload: {
    isOpen,
  },
});

export const SET_CURRENT_STEPPER_STEP = 'SET_CURRENT_STEPPER_STEP';
export const setCurrentStepperStep = step => ({
  type: SET_CURRENT_STEPPER_STEP,
  payload: {
    step,
  },
});
