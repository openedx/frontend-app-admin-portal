import { logError } from '@edx/frontend-platform/logging';

import { removeStringsFromList } from '../../../utils';
import { isInviteEmailAddressesInputValueValid } from '../../learner-credit-management/cards/data';
import { initialContext, ValidatedEmailsContext } from './ValidatedEmailsContext';
import {
  ADD_EMAILS, INITIALIZE_ENTERPRISE_EMAILS, REMOVE_EMAILS,
} from './actions';
import type {
  AddEmailsArguments,
  InitializeArguments,
  RemoveEmailsArguments,
  ValidatedEmailsActionArguments,
} from './actions';

export type ValidatedEmailsReducerType = (
  ValidatedEmailsActionArguments,
  ValidatedEmailsContext
) => ValidatedEmailsContext;

const allEmails = (state: ValidatedEmailsContext) => {
  // Return all emails from the context regardless of error status
  const {
    validatedEmails, duplicateEmails, invalidEmails,
  } = state;
  return [validatedEmails, duplicateEmails, invalidEmails].flatMap((list) => list || []);
};

const removeEmailsFromState = (
  state: ValidatedEmailsContext,
  removedValidatedEmails: string[],
): ValidatedEmailsContext => {
  const validatedEmails = removeStringsFromList(state.validatedEmails as string[], removedValidatedEmails);
  const lowerCasedEmailsToRemove = removedValidatedEmails.map((str) => str.toLowerCase());
  const lowerCasedEmails = removeStringsFromList(state.lowerCasedEmails as string[], lowerCasedEmailsToRemove);
  return { ...state, validatedEmails, lowerCasedEmails };
};

const getUpdatedEmailsAndState = (
  state: ValidatedEmailsContext,
  addedEmails: string[],
  clearErroredEmails?: boolean,
): [ValidatedEmailsContext, string[]] => {
  if (clearErroredEmails) {
    // Clear errored email fields if option is set
    const newState = {
      ...state, duplicateEmails: [], invalidEmails: [],
    };
    return [newState, [...(newState.validatedEmails || []), ...addedEmails]];
  }

  return [state, [...allEmails(state), ...addedEmails]];
};

export const ValidatedEmailsReducer: ValidatedEmailsReducerType = (
  state: ValidatedEmailsContext,
  action: ValidatedEmailsActionArguments<any>,
) => {
  switch (action.type) {
    case INITIALIZE_ENTERPRISE_EMAILS: {
      const { groupEnterpriseLearners } = action.arguments as InitializeArguments;
      return {
        ...initialContext,
        groupEnterpriseLearners: [...(groupEnterpriseLearners || [])],
      };
    } case ADD_EMAILS: {
      const { emails: addedEmails, clearErroredEmails, actionType } = action.arguments as AddEmailsArguments;
      const updatedEmailsAndState = getUpdatedEmailsAndState(state, addedEmails, clearErroredEmails);
      let [newState] = updatedEmailsAndState;
      const [, emails] = updatedEmailsAndState;
      newState = {
        ...newState,
        isCreateGroupListSelection: state.isCreateGroupListSelection || actionType === 'CLICK_ACTION',
        isCreateGroupFileUpload: state.isCreateGroupFileUpload || actionType === 'UPLOAD_CSV_ACTION',
      };
      const emailValidation = isInviteEmailAddressesInputValueValid({
        learnerEmails: emails,
      });
      return { ...newState, ...emailValidation };
    } case REMOVE_EMAILS: {
      const { emails: removedEmails } = action.arguments as RemoveEmailsArguments;
      return removeEmailsFromState(state, removedEmails);
    } default: {
      logError(`Unexpected action: ${action?.type}`);
      return state;
    }
  }
};
