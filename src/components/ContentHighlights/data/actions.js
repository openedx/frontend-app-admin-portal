export const SET_HIGHLIGHT_STEPPER_MODAL = 'SET_HIGHLIGHT_STEPPER_MODAL';
export const setHighlightStepperModal = data => ({
  type: SET_HIGHLIGHT_STEPPER_MODAL,
  payload: {
    data,
  },
});

export const SET_CURRENT_STEPPER_STEP = 'SET_CURRENT_STEPPER_STEP';
export const setCurrentStepperStep = data => ({
  type: SET_CURRENT_STEPPER_STEP,
  payload: {
    data,
  },
});
