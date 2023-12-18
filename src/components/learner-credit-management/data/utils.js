import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logInfo } from '@edx/frontend-platform/logging';

import {
  LOW_REMAINING_BALANCE_PERCENT_THRESHOLD,
  NO_BALANCE_REMAINING_DOLLAR_THRESHOLD,
  ASSIGNMENT_ENROLLMENT_DEADLINE,
} from './constants';
import { BUDGET_STATUSES } from '../../EnterpriseApp/data/constants';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';
import SubsidyApiService from '../../../data/services/EnterpriseSubsidyApiService';

/**
 * Transforms subsidy (offer or Subsidy) summary from API for display in the UI, guarding
 * against bad data (e.g., accounting for refunds).
 *
 * @param {object} subsidySummary Object containing summary about a budget.
 * @returns Object containing transformed summary about a budget.
 */
export const transformSubsidySummary = (subsidySummary) => {
  if (!subsidySummary) {
    return null;
  }

  const budgetsSummary = [];
  if (subsidySummary?.budgets) {
    const budgets = subsidySummary?.budgets;
    for (let i = 0; i < budgets.length; i++) {
      const redeemedFunds = budgets[i].amountOfPolicySpent && parseFloat(budgets[i].amountOfPolicySpent);
      const remainingFunds = budgets[i].remainingBalance && parseFloat(budgets[i].remainingBalance);
      const updatedBudgetDetail = {
        redeemedFunds,
        remainingFunds,
        ...budgets[i],
      };
      budgetsSummary.push(updatedBudgetDetail);
    }
  }

  const totalFunds = subsidySummary.maxDiscount && parseFloat(subsidySummary.maxDiscount);
  let redeemedFunds = subsidySummary.amountOfOfferSpent && parseFloat(subsidySummary.amountOfOfferSpent);
  let redeemedFundsOcm = subsidySummary.amountOfferSpentOcm && parseFloat(subsidySummary.amountOfferSpentOcm);
  let redeemedFundsExecEd = subsidySummary.amountOfferSpentExecEd && parseFloat(subsidySummary.amountOfferSpentExecEd);

  // cap redeemed funds at the maximum funds available (`maxDiscount`), if applicable, so we
  // don't display redeemed funds > funds available.
  if (totalFunds) {
    redeemedFunds = Math.min(redeemedFunds, totalFunds);
    redeemedFundsOcm = Math.min(redeemedFundsOcm, totalFunds);
    redeemedFundsExecEd = Math.min(redeemedFundsExecEd, totalFunds);
  }

  let remainingFunds = subsidySummary.remainingBalance && parseFloat(subsidySummary.remainingBalance);
  // prevent remaining funds from going below $0, if applicable.
  if (remainingFunds) {
    remainingFunds = Math.max(remainingFunds, 0.0);
  }

  let percentUtilized = subsidySummary.percentOfOfferSpent && parseFloat(subsidySummary.percentOfOfferSpent);
  // prevent percent utilized from going over 1.0, if applicable.
  if (percentUtilized) {
    percentUtilized = Math.min(percentUtilized, 1.0);
  }
  const { offerType } = subsidySummary;
  const { offerId } = subsidySummary;

  return {
    totalFunds,
    redeemedFunds,
    redeemedFundsOcm,
    redeemedFundsExecEd,
    remainingFunds,
    percentUtilized,
    offerType,
    offerId,
    budgetsSummary,
  };
};

/**
 * Transforms enrollment data from analytics api to fields for display
 * in learner credit allocation table.
 * A uuid is added to each enrollment to be used as a key for the table.
 *
 * @param {array} results List of raw enrollment results from API.
 *
 * @returns List of transformed results for display in table.
 */
export const transformUtilizationTableResults = results => results.map(result => ({
  created: result.created,
  enterpriseEnrollmentId: result.enterpriseEnrollmentId,
  userEmail: result.userEmail,
  courseTitle: result.courseTitle,
  courseListPrice: result.courseListPrice,
  enrollmentDate: result.enrollmentDate,
  uuid: uuidv4(),
  courseKey: result.courseKey,
}));

export const transformUtilizationTableSubsidyTransactionResults = results => results.map(result => ({
  created: result.created,
  enrollmentDate: result.created,
  fulfillmentIdentifier: result.fulfillmentIdentifier,
  reversal: result.reversal,
  userEmail: result.lmsUserEmail,
  courseTitle: result.contentTitle,
  courseListPrice: result.unit === 'usd_cents' ? -1 * (result.quantity / 100) : -1 * results.quantity,
  uuid: result.uuid,
  courseKey: result.contentKey,
}));

/**
 * Gets appropriate color variant for the annotated progress bar.
 *
 * @param {Number} percentUtilized A float (0.0 - 1.0) of percentage funds utilized for an offer.
 * @param {Number} remainingFunds A number representing remaining funds for an offer.
 *
 * @returns Appropriate color variant for annotated progress bar.
 */
export const getProgressBarVariant = ({ percentUtilized, remainingFunds }) => {
  let variant = 'success'; // default to green
  if (
    percentUtilized > LOW_REMAINING_BALANCE_PERCENT_THRESHOLD
    && remainingFunds > NO_BALANCE_REMAINING_DOLLAR_THRESHOLD
  ) {
    variant = 'danger'; // yellow
  } else if (remainingFunds <= NO_BALANCE_REMAINING_DOLLAR_THRESHOLD) {
    variant = 'error'; // red
  }
  return variant;
};

//  Utility function to check if the ID is a UUID
export const isUUID = (id) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

//  Utility function to check the budget status
export const getBudgetStatus = (startDateStr, endDateStr, currentDate = new Date()) => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (currentDate < startDate) {
    return {
      status: BUDGET_STATUSES.scheduled,
      badgeVariant: 'secondary',
      term: 'Starts',
      date: startDateStr,
    };
  }
  if (currentDate >= startDate && currentDate <= endDate) {
    return {
      status: BUDGET_STATUSES.active,
      badgeVariant: 'primary',
      term: 'Expires',
      date: endDateStr,
    };
  }
  return {
    status: BUDGET_STATUSES.expired,
    badgeVariant: 'light',
    term: 'Expired',
    date: endDateStr,
  };
};

export const formatPrice = (price, options = {}) => {
  const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    ...options,
  });
  return USDollar.format(Math.abs(price));
};

/**
 * Orders a list of budgets based on their status, end date, and name.
 * Active budgets come first, followed by scheduled budgets, and then expired budgets.
 * Within each status, budgets are sorted by their end date and name.
 *
 * @param {Array} budgets - An array of budget objects.
 * @returns {Array} - The sorted array of budget objects.
 */
export const orderBudgets = (budgets) => {
  const statusOrder = {
    Active: 0,
    Scheduled: 1,
    Expired: 2,
  };

  budgets?.sort((budgetA, budgetB) => {
    const statusA = getBudgetStatus(budgetA.start, budgetA.end).status;
    const statusB = getBudgetStatus(budgetB.start, budgetB.end).status;

    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }

    if (budgetA.end !== budgetB.end) {
      return budgetA.end.localeCompare(budgetB.end);
    }

    return budgetA.name.localeCompare(budgetB.name);
  });

  return budgets;
};

/**
 * Formats a date string to MMM D, YYYY format.
 * @param {string} date Date string.
 * @returns Formatted date string.
 */
export function formatDate(date) {
  return dayjs(date).format('MMM D, YYYY');
}

// Exec ed and open courses cards should display either the enrollment deadline
// or 90 days from the present date on user pageload, whichever is sooner.
export function getEnrollmentDeadline(enrollByDate) {
  const assignmentEnrollmentDeadline = dayjs().add(ASSIGNMENT_ENROLLMENT_DEADLINE, 'days');
  if (!enrollByDate) {
    return formatDate(assignmentEnrollmentDeadline);
  }
  const courseEnrollByDate = dayjs(enrollByDate);
  return courseEnrollByDate <= assignmentEnrollmentDeadline
    ? formatDate(courseEnrollByDate)
    : formatDate(assignmentEnrollmentDeadline);
}
/**
 * Retrieves content assignments for the given budget's assignment configuration UUID (retrieved from the associated
 * subsidy access policy).
 *
 * @param {String} assignmentConfigurationUUID The UUID of the assignment configuration.
 * @param {Object} options Optional options object to pass/override query parameters.
 *
 * @returns Camelcased response from the content assignments.
 */
export async function fetchContentAssignments(assignmentConfigurationUUID, options = {}) {
  const response = await EnterpriseAccessApiService.listContentAssignments(assignmentConfigurationUUID, options);
  return camelCaseObject(response.data);
}

/**
 * Retrieves spent transactions for the given budget (either a subsidy access
 * policy or an enterprise offer), if any.
 *
 * @param {Object} args An object containing various arguments.
 * @param {String} args.enterpriseUUID The UUID of the enterprise customer.
 * @param {String} args.subsidyAccessPolicyId The UUID of a subsidy access policy, if any.
 * @param {String} args.enterpriseOfferId The UUID of an enterprise offer, if any.
 *
 * @returns Camelcased response from the spent transactions.
 */
export async function fetchSpentTransactions({
  enterpriseUUID,
  subsidyAccessPolicy,
  budgetId,
  isTopDownAssignmentEnabled,
}) {
  const options = {
    page: 1,
    pageSize: 25,
  };

  let response;
  const shouldFetchSubsidyTransactions = !!subsidyAccessPolicy && isTopDownAssignmentEnabled;
  if (shouldFetchSubsidyTransactions) {
    options.subsidyAccessPolicyUuid = budgetId;
    // Feature flag is enabled and the budget is a subsidy access policy, so pull from
    // the `transactions` API via enterprise-subsidy.
    response = await SubsidyApiService.fetchCustomerTransactions(
      subsidyAccessPolicy.subsidyUuid,
      options,
    );
  } else {
    // Feature flag disabled or budget is not a subsidy access policy; continue to call analytics API.
    if (subsidyAccessPolicy) {
      options.budgetId = budgetId;
    } else {
      options.offerId = budgetId;
    }
    options.ignoreNullCourseListPrice = true;
    response = await EnterpriseDataApiService.fetchCourseEnrollments(
      enterpriseUUID,
      options,
    );
  }

  if (!response) {
    logInfo('[fetchSpentTransactions] Spent transactions were not fetched from API. No budget identifier provided.');
  }

  return camelCaseObject(response.data);
}

/**
 * Retrieves the requisite overview budget detail activity from relevant APIs, including spent transactions
 * and (if applicable) any content assignments for the budget. Content assignments are only fetched when the
 * budget is a subsidy access policy that is assignable and the top-down assignment feature is enabled.
 *
 * @param {Object} args An object containing various arguments. Note: `@tanstack/reat-query` passes
 *  additional arguments.
 * @param {Array} args.budgetId The budget id for the currently viewing budget.
 * @param {Object} [args.subsidyAccessPolicy] The subsidy access policy metadata, if any. Not
 *  applicable when the budget is an enterprise offer.
 * @param {String} args.enterpriseUUID The UUID of the enterprise customer.
 * @param {Boolean} args.isTopDownAssignmentEnabled Whether the top-down assignment feature is enabled.
 * @returns An object containing the first page of spent transactions and (if applicable) content assignments.
 */
export async function retrieveBudgetDetailActivityOverview({
  budgetId,
  subsidyAccessPolicy,
  enterpriseUUID,
  isTopDownAssignmentEnabled,
}) {
  const isBudgetAssignable = !!(isTopDownAssignmentEnabled && subsidyAccessPolicy?.isAssignable);
  const promisesToFulfill = [
    fetchSpentTransactions({
      enterpriseUUID,
      subsidyAccessPolicy,
      budgetId,
      isTopDownAssignmentEnabled,
    }),
  ];
  if (isBudgetAssignable) {
    promisesToFulfill.push(fetchContentAssignments(subsidyAccessPolicy.assignmentConfiguration.uuid));
  }
  const responses = await Promise.allSettled(promisesToFulfill);
  const result = {
    spentTransactions: responses[0].value,
  };
  if (isBudgetAssignable) {
    result.contentAssignments = responses[1].value;
  }
  return result;
}
