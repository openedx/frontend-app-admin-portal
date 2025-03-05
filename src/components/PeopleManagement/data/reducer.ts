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

export const ValidatedEmailsReducer: ValidatedEmailsReducerType = (
  state: ValidatedEmailsContext,
  action: ValidatedEmailsActionArguments<any>,
) => {
  switch (action.type) {
    case INITIALIZE_ENTERPRISE_EMAILS: {
      const { allEnterpriseLearners, groupEnterpriseLearners } = action.arguments as InitializeArguments;
      return {
        ...initialContext,
        groupEnterpriseLearners: [...(groupEnterpriseLearners || [])],
        allEnterpriseLearners: [...allEnterpriseLearners],
      };
    } case ADD_EMAILS: {
      const { emails: addedEmails, clearErroredEmails, actionType } = action.arguments as AddEmailsArguments;
      const newState = { ...state };
      let emails: string[] = [];
      if (actionType === 'CLICK_ACTION') {
        newState.isCreateGroupListSelection = true;
      }
      if (actionType === 'UPLOAD_CSV_ACTION') {
        newState.isCreateGroupFileUpload = true;
      }
      if (clearErroredEmails) {
        newState.duplicateEmails = [];
        newState.emailsNotInOrg = [];
        newState.invalidEmails = [];
        emails = [...(newState.lowerCasedEmails || []), ...addedEmails];
      } else {
        emails = [...allEmails(newState), ...addedEmails];
      }
      const emailValidation = isInviteEmailAddressesInputValueValid({
        learnerEmails: emails,
        allEnterpriseLearners: newState.allEnterpriseLearners as string[],
      });
      return { ...newState, ...emailValidation };
    } case REMOVE_EMAILS: {
      const { emails: removedEmails } = action.arguments as RemoveEmailsArguments;
      const newState = { ...state };
      const emails = newState.lowerCasedEmails as string[];
      newState.lowerCasedEmails = removeStringsFromList(emails, removedEmails);
      return { ...newState };
    } default: {
      return state;
    }
  }
};
