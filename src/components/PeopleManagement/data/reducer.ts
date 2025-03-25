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
    lowerCasedEmails, duplicateEmails, emailsNotInOrg, invalidEmails,
  } = state;
  return [lowerCasedEmails, duplicateEmails, emailsNotInOrg, invalidEmails].flatMap((list) => list || []);
};

const getUpdatedEmailsAndState = (
  state: ValidatedEmailsContext,
  addedEmails: string[],
  clearErroredEmails?: boolean,
): [ValidatedEmailsContext, string[]] => {
  if (clearErroredEmails) {
    // Clear errored email fields if option is set
    const newState = {
      ...state, duplicateEmails: [], emailsNotInOrg: [], invalidEmails: [],
    };
    return [newState, [...(newState.lowerCasedEmails || []), ...addedEmails]];
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
      const newState = { ...state };
      const emails = newState.lowerCasedEmails as string[];
      newState.lowerCasedEmails = removeStringsFromList(emails, removedEmails);
      return { ...newState };
    } default: {
      logError(`Unexpected action: ${action?.type}`);
      return state;
    }
  }
};
