import isEmail from 'validator/lib/isEmail';

import { MAX_EMAIL_ENTRY_LIMIT, MAX_INITIAL_LEARNER_EMAILS_DISPLAYED_COUNT } from './constants';
import { formatPrice } from '../../data';
import { makePlural, removeStringsFromList } from '../../../../utils';

/**
 * Transforms and formats a policy's display name for rendering within the assignment modal's allocation alert modals.
 * @param {Object} subsidyAccessPolicy Metadata about the subsidy access policy, which may include a display name.
 * @returns Transformed budget display name.
 */
export const getBudgetDisplayName = (subsidyAccessPolicy) => {
  let budgetDisplayName = 'budget';
  if (subsidyAccessPolicy.displayName) {
    budgetDisplayName = `${subsidyAccessPolicy.displayName} ${budgetDisplayName}`;
  }
  return budgetDisplayName;
};

/**
 * Determine whether the number of learner emails exceeds a certain
 * threshold, whereby the list of emails should be truncated.
 * @param {Array<String>} learnerEmails List of learner emails.
 * @returns True is learner emails list should be truncated; otherwise, false.
 */
export const hasLearnerEmailsSummaryListTruncation = (learnerEmails) => (
  learnerEmails.length > MAX_INITIAL_LEARNER_EMAILS_DISPLAYED_COUNT
);

/**
 * Determine the validity of the learner emails user input. The input is valid if
 * all emails are valid and there are no duplicates. Invalid emails and duplicate
 * emails are returned.
 *
 * @param {Object} args Arguments.
 * @param {Array<String>} learnerEmails List of learner emails.
 * @param {Number} contentPrice Price of the content (USD).
 * @param {Array<String>} remainingBalance Amount remaining in the budget (USD).
 *
 * @returns EmailValidityReport containing various properties about the validity of the learner emails
 * input, including a validation error when appropriate, and whether the assignment allocation
 * should proceed.
 */
export const isAssignEmailAddressesInputValueValid = ({
  learnerEmails,
  remainingBalance,
  contentPrice,
}) => {
  let validationError;

  const learnerEmailsCount = learnerEmails.length;
  const totalAssignmentCost = contentPrice * learnerEmailsCount;
  const remainingBalanceAfterAssignment = remainingBalance - totalAssignmentCost;
  const hasEnoughBalanceForAssignment = remainingBalanceAfterAssignment >= 0;

  const lowerCasedEmails: string[] = [];
  const invalidEmails: string[] = [];
  const duplicateEmails: string[] = [];

  learnerEmails.forEach((email) => {
    const lowerCasedEmail = email.toLowerCase();

    // Validate the email address
    if (!isEmail(email)) {
      invalidEmails.push(email);
    }

    // Check for duplicates (case-insensitive)
    if (lowerCasedEmails.includes(lowerCasedEmail)) {
      duplicateEmails.push(email);
    }

    // Add to list of lower-cased emails already handled
    lowerCasedEmails.push(lowerCasedEmail);
  });

  const isValidInput = invalidEmails.length === 0 && duplicateEmails.length === 0;
  const canAllocate = learnerEmailsCount > 0 && hasEnoughBalanceForAssignment && isValidInput;

  const ensureValidationErrorObjectExists = () => {
    if (!validationError) {
      validationError = {};
    }
  };

  if (!isValidInput) {
    ensureValidationErrorObjectExists();
    if (invalidEmails.length > 0) {
      validationError.reason = 'invalid_email';
      validationError.message = `${invalidEmails[0]} is not a valid email.`;
    } else if (duplicateEmails.length > 0) {
      validationError.reason = 'duplicate_email';
      validationError.message = `${duplicateEmails[0]} has been entered more than once.`;
    }
  } else if (!hasEnoughBalanceForAssignment) {
    ensureValidationErrorObjectExists();
    validationError.reason = 'insufficient_funds';
    validationError.message = `The total assignment cost exceeds your available Learner Credit budget balance of ${formatPrice(remainingBalance)}. Please remove learners and try again.`;
  }

  return {
    canAllocate,
    learnerEmailsCount,
    isValidInput,
    validationError,
    totalAssignmentCost,
    remainingBalanceAfterAssignment,
    hasEnoughBalanceForAssignment,
  };
};

export type LearnerEmailsValidityArgs = {
  learnerEmails: string[],
};

export type LearnerEmailsValidityReport = {
  /* Whether we can invite with the current set of learner emails */
  canInvite: boolean,
  /* If there are no invalid emails and the count of emails is under the limit */
  isValidInput: boolean,
  /* List of valid emails in their original casing */
  validatedEmails: string[],
  /* List of valid lower-cased emails */
  lowerCasedEmails: string[],
  /* List of duplicate emails */
  duplicateEmails: string[],
  /* List of entries that are not valid email addresses */
  invalidEmails: string[],
  /* Error message shown to the user */
  validationError: string,
};

/**
 * Determine the validity of the learner emails user input. The input is valid if
 * all emails are valid. Invalid and duplicate emails are returned.
 *
 * @param {Array<String>} learnerEmails List of learner emails.
 *
 * @returns LearnerEmailsValidityReport Object containing various properties about the validity of the learner emails
 * input, including a validation error when appropriate, and whether the member invitation
 * should proceed.
 */
export const isInviteEmailAddressesInputValueValid = ({
  learnerEmails,
}: LearnerEmailsValidityArgs): LearnerEmailsValidityReport => {
  let validationError;
  const learnerEmailsCount = learnerEmails.length;
  const lowerCasedEmails: string[] = [];
  const validatedEmails: string[] = [];
  const invalidEmails: string[] = [];
  const duplicateEmails: string[] = [];

  learnerEmails.forEach((email) => {
    const lowerCasedEmail = email.toLowerCase();

    // Validate the email address
    if (!isEmail(email)) {
      invalidEmails.push(email);
    } else if (lowerCasedEmails.includes(lowerCasedEmail)) {
      // Check for duplicates (case-insensitive)
      duplicateEmails.push(email);
    } else {
      // Add to list of emailss already handled
      lowerCasedEmails.push(lowerCasedEmail);
      validatedEmails.push(email);
    }
  });

  const isValidInput = invalidEmails.length === 0 && learnerEmailsCount < MAX_EMAIL_ENTRY_LIMIT;
  const canInvite = validatedEmails.length > 0 && learnerEmailsCount < MAX_EMAIL_ENTRY_LIMIT;

  const ensureValidationErrorObjectExists = () => {
    if (!validationError) {
      validationError = {};
    }
  };

  if (!isValidInput) {
    ensureValidationErrorObjectExists();
    if (learnerEmailsCount > MAX_EMAIL_ENTRY_LIMIT) {
      validationError.reason = 'over_email_max';
      validationError.message = `${learnerEmailsCount} emails entered (${MAX_EMAIL_ENTRY_LIMIT} maximum). `
        + `Delete ${learnerEmailsCount - MAX_EMAIL_ENTRY_LIMIT} emails to proceed.`;
    }
    if (invalidEmails.length > 0) {
      validationError.reason = 'invalid_email';
      if (invalidEmails.length === 1) {
        validationError.message = `${invalidEmails[0]} is not a valid email.`;
      } else {
        validationError.message = `${invalidEmails[0]} and ${invalidEmails.length - 1} other email addresses are not valid.`;
      }
    }
  } else if (duplicateEmails.length > 0) {
    let message = `${duplicateEmails[0]} was entered more than once.`;
    if (duplicateEmails.length > 1) {
      message = `${duplicateEmails[0]} and ${makePlural(duplicateEmails.length - 1, 'other email address')}
      were entered more than once.`;
    }
    ensureValidationErrorObjectExists();
    validationError.reason = 'duplicate_email';
    validationError.message = message;
  }

  return {
    canInvite,
    lowerCasedEmails,
    validatedEmails,
    duplicateEmails,
    invalidEmails,
    isValidInput,
    validationError,
  };
};

/**
 * Remove invalid emails from list based on
 *
 * @param {Array<String>} learnerEmails List of learner emails.
 *
 * @returns Object containing various properties about the validity of the learner emails
 * input, including a validation error when appropriate, and whether the member invitation
 * should proceed.
 */
export const removeInvalidEmailsFromList = (
  learnerEmails: string[],
  inviteMetadata: LearnerEmailsValidityReport,
): string[] => {
  const { duplicateEmails, invalidEmails } = inviteMetadata;
  const allInvalidEmails = [...(duplicateEmails || []), ...(invalidEmails || [])];
  return removeStringsFromList(learnerEmails, allInvalidEmails);
};
