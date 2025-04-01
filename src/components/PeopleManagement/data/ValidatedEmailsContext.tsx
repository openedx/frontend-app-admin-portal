import {
  Context, Dispatch, createContext, useContext,
} from 'react';

import { LearnerEmailsValidityReport } from '../../learner-credit-management/cards/data';
import { ValidatedEmailsActionArguments } from './actions';

export type ValidatedEmailsContext = {
  groupEnterpriseLearners: string[],
  isCreateGroupFileUpload: boolean,
  isCreateGroupListSelection: boolean,
  dispatch?: Dispatch<ValidatedEmailsActionArguments<any>>,
} & Partial<LearnerEmailsValidityReport>;

export const initialContext: ValidatedEmailsContext = {
  groupEnterpriseLearners: [],
  canInvite: false,
  isValidInput: true,
  isCreateGroupFileUpload: false,
  isCreateGroupListSelection: false,
  validatedEmails: [],
  lowerCasedEmails: [],
  duplicateEmails: [],
  invalidEmails: [],
  validationError: undefined,
};
export const ValidatedEmailsContextObject: Context<ValidatedEmailsContext> = createContext({ ...initialContext });

export function useValidatedEmailsContext(): ValidatedEmailsContext {
  return useContext(ValidatedEmailsContextObject);
}
