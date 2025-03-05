export type ValidatedEmailsActionArguments<Arguments> = {
  type: string,
  arguments: Arguments
};

export type InitializeArguments = {
  // All learners in the enterprise
  allEnterpriseLearners: string[],
  // Just the learners in the enterprise group
  groupEnterpriseLearners?: string[],
};
export const INITIALIZE_ENTERPRISE_EMAILS = 'INITIALIZE ENTERPRISE EMAILS';
// Construct action for initializing context
export const initializeEnterpriseEmailsAction = ({
  allEnterpriseLearners,
  groupEnterpriseLearners,
}: InitializeArguments): ValidatedEmailsActionArguments<InitializeArguments> => ({
  type: INITIALIZE_ENTERPRISE_EMAILS,
  arguments: {
    allEnterpriseLearners,
    groupEnterpriseLearners,
  },
});

export type AddEmailsArguments = {
  // Emails to add for validation
  emails: string[],
  // Whether to clear non-valid emails entered previously
  clearErroredEmails?: boolean,
  // The type of action that triggered the addition
  actionType: 'CLICK_ACTION' | 'UPLOAD_CSV_ACTION';
};
export const ADD_EMAILS = 'ADD EMAILS';
// Construct action for adding emails
export const addEmailsAction = ({
  emails,
  clearErroredEmails,
  actionType,
}: AddEmailsArguments): ValidatedEmailsActionArguments<AddEmailsArguments> => ({
  type: ADD_EMAILS,
  arguments: {
    emails,
    clearErroredEmails,
    actionType,
  },
});

export type RemoveEmailsArguments = {
  // Emails to remove
  emails: string[],
};
export const REMOVE_EMAILS = 'REMOVE EMAILS';
// Construct action for removing emails
export const removeEmailsAction = ({
  emails,
}: RemoveEmailsArguments): ValidatedEmailsActionArguments<RemoveEmailsArguments> => ({
  type: REMOVE_EMAILS,
  arguments: { emails },
});
