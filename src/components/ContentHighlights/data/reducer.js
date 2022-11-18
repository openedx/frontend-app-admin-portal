import { logError } from '@edx/frontend-platform/logging';
import {
  SET_HIGHLIGHT_STEPPER_MODAL,
  SET_CURRENT_STEPPER_STEP,
} from './actions';

export const initialStepperModalState = {
  isOpen: false,
  step: 0,
  highlight: null,
};

export const stepperModalReducer = (state = initialStepperModalState, action = {}) => {
  switch (action.type) {
    case SET_HIGHLIGHT_STEPPER_MODAL:
      return { ...state, isOpen: action.payload.data };
    case SET_CURRENT_STEPPER_STEP:
      return { ...state, step: action.payload.data };
    default: {
      const msg = `stepperModalReducer received an unexpected action type: ${action.type}`;
      logError(msg);
      throw new Error(msg);
    }
  }
};
