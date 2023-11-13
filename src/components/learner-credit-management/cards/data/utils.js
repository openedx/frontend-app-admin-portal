import { MAX_INITIAL_LEARNER_EMAILS_DISPLAYED_COUNT } from './constants';

export const getBudgetDisplayName = (subsidyAccessPolicy) => {
  let budgetDisplayName = 'budget';
  if (subsidyAccessPolicy.displayName) {
    budgetDisplayName = `${subsidyAccessPolicy.displayName} ${budgetDisplayName}`;
  }
  return budgetDisplayName;
};

export const determineLearnerEmailsSummaryListTruncation = (learnerEmails) => (
  learnerEmails.length > MAX_INITIAL_LEARNER_EMAILS_DISPLAYED_COUNT
);
