import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logInfo } from '@edx/frontend-platform/logging';

import {
  ASSIGNMENT_ENROLLMENT_DEADLINE,
  COURSE_PACING_MAP,
  DAYS_UNTIL_ASSIGNMENT_ALLOCATION_EXPIRATION,
  LATE_ENROLLMENTS_BUFFER_DAYS,
  LOW_REMAINING_BALANCE_PERCENT_THRESHOLD,
  MAX_ALLOWABLE_REFUND_THRESHOLD_DAYS,
  NO_BALANCE_REMAINING_DOLLAR_THRESHOLD,
  START_DATE_DEFAULT_TO_TODAY_THRESHOLD_DAYS,
} from './constants';
import { BUDGET_STATUSES } from '../../EnterpriseApp/data/constants';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';
import SubsidyApiService from '../../../data/services/EnterpriseSubsidyApiService';
import { isPlanApproachingExpiry } from '../../BudgetExpiryAlertAndModal/data/utils';

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
 * Transforms enrollment data from analytics api to fields for display in learner credit spent table.
 *
 * Notes:
 * * A uuid is synthesized for each enrollment to be used as a key for the table.
 *
 * @param {array} results List of raw enrollment results from API.
 *
 * @returns List of transformed results for display in spent table.
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

export const transformGroupMembersTableResults = results => results.map(result => ({
  memberDetails: result.memberDetails,
  status: result.status,
  recentAction: result.recentAction,
  memberEnrollments: result.memberEnrollments,
  enrollmentCount: result.enrollmentCount,
}));

/**
 * Transforms redemptions data from transaction list API to fields for display in learner credit spent table.
 *
 * Notes:
 * * This supports the "real-time" spent table implementation.
 *
 * @param {array} results List of raw enrollment results from API.
 *
 * @returns List of transformed results for display in spent table.
 */
export const transformUtilizationTableSubsidyTransactionResults = results => results.map(result => ({
  created: result.created,
  enrollmentDate: result.created,
  fulfillmentIdentifier: result.fulfillmentIdentifier,
  reversal: result.reversal,
  userEmail: result.lmsUserEmail,
  courseTitle: result.contentTitle,
  courseListPrice: result.unit === 'usd_cents' ? -1 * (result.quantity / 100) : -1 * results.quantity,
  uuid: result.uuid,
  // In the transaction list response, `parent_content_key` is the course key, and `content_key` is the course run key.
  courseKey: result.parentContentKey,
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

// TODO: Abstract ‘status’ higher up into the component tree to simplify code
//  Utility function to check the budget status
export const getBudgetStatus = ({
  intl,
  startDateStr,
  endDateStr,
  isBudgetRetired,
  currentDate = new Date(),
  retiredDateStr = null,
}) => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Check if budget is retired
  if (isBudgetRetired) {
    return {
      status: BUDGET_STATUSES.retired,
      badgeVariant: 'light',
      term: 'Retired',
      date: retiredDateStr,
    };
  }

  // Check if budget has not yet started
  if (currentDate < startDate) {
    return {
      status: BUDGET_STATUSES.scheduled,
      badgeVariant: 'secondary',
      term: 'Starts',
      date: startDateStr,
    };
  }

  if (isPlanApproachingExpiry(intl, endDateStr)) {
    return {
      status: BUDGET_STATUSES.expiring,
      badgeVariant: 'warning',
      term: 'Expiring',
      date: endDateStr,
    };
  }

  // Check if budget is current (today's date between start/end dates)
  if (currentDate >= startDate && currentDate <= endDate) {
    return {
      status: BUDGET_STATUSES.active,
      badgeVariant: 'primary',
      term: 'Expires',
      date: endDateStr,
    };
  }

  // Otherwise, budget must be expired
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
export const orderBudgets = (intl, budgets) => {
  const statusOrder = {
    Expiring: 1,
    Active: 1,
    Scheduled: 2,
    Expired: 3,
    Retired: 4,
  };

  budgets?.sort((budgetA, budgetB) => {
    const statusA = getBudgetStatus({
      intl,
      startDateStr: budgetA.start,
      endDateStr: budgetA.end,
      isBudgetRetired: budgetA.isRetired,
    }).status;
    const statusB = getBudgetStatus({
      intl,
      startDateStr: budgetB.start,
      endDateStr: budgetB.end,
      isBudgetRetired: budgetB.isRetired,
    }).status;

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

/**
 * Takes the raw selected flat rows data from the 'Assigned' datatable and returns metadata that is used for tracking
 * bulk enrollment of reminders and bulk enrollment of cancellations.
 * @param {Array} selectedFlatRows An array of selectedFlatRows from the activity 'Assigned' table
 * @returns {{
 * uniqueLearnerState: [String],
 * totalContentQuantity: Number,
 * assignmentConfigurationUuid: String,
 * assignmentUuids: [String]
 * uniqueContentKeys: [String],
 * uniqueAssignmentState: [String],
 * totalSelectedRows: Number,
 * }}
 */
export const transformSelectedRows = (selectedFlatRows) => {
  const assignmentUuids = selectedFlatRows.map(item => item.id);
  const totalSelectedRows = selectedFlatRows.length;

  // Count of unique content keys, where the key is the course,
  // and value is count of the course.
  const flatMappedContentKeys = selectedFlatRows.map(item => item?.original?.contentKey);
  const uniqueContentKeys = {};
  flatMappedContentKeys.forEach((courseKey) => {
    uniqueContentKeys[courseKey] = (uniqueContentKeys[courseKey] || 0) + 1;
  });

  // Count of unique learner states, where the key is the learnerState,
  // and value is count of the learnerState.
  const flatMappedLearnerState = selectedFlatRows.map(item => item?.original?.learnerState);
  const uniqueLearnerState = {};
  flatMappedLearnerState.forEach((learnerState) => {
    uniqueLearnerState[learnerState] = (uniqueLearnerState[learnerState] || 0) + 1;
  });

  // Count of unique assignment states, where the key is the assignment state,
  // and value is count of the assignment state.
  const flatMappedAssignmentState = selectedFlatRows.map(item => item?.original?.state);
  const uniqueAssignmentState = {};
  flatMappedAssignmentState.forEach((state) => {
    uniqueAssignmentState[state] = (uniqueAssignmentState[state] || 0) + 1;
  });

  // Total value of all the selected rows accumulated from the contentQuantity
  const totalContentQuantity = selectedFlatRows.map(
    item => item.original.contentQuantity,
  ).reduce((prev, next) => prev + next, 0);

  return {
    uniqueAssignmentState,
    uniqueLearnerState,
    uniqueContentKeys,
    totalContentQuantity,
    assignmentUuids,
    totalSelectedRows,
  };
};

/**
 * Translates the budget status using the provided `intl` object.
 *
 * @param {object} intl - The `intl` object used for translation.
 * @param {string} status - The status of the budget.
 * @returns {string} The translated budget status.
 */
export const getTranslatedBudgetStatus = (intl, status) => {
  switch (status) {
    case BUDGET_STATUSES.active:
      return intl.formatMessage({
        id: 'lcm.budgets.budget.card.status.active',
        defaultMessage: 'Active',
        description: 'Status for an active budget',
      });
    case BUDGET_STATUSES.expiring:
      return intl.formatMessage({
        id: 'lcm.budgets.budget.card.status.expiring',
        defaultMessage: 'Expiring',
        description: 'Status for an expiring budget',
      });
    case BUDGET_STATUSES.expired:
      return intl.formatMessage({
        id: 'lcm.budgets.budget.card.status.expired',
        defaultMessage: 'Expired',
        description: 'Status for an expired budget',
      });
    case BUDGET_STATUSES.retired:
      return intl.formatMessage({
        id: 'lcm.budgets.budget.card.status.retired',
        defaultMessage: 'Retired',
        description: 'Status for a retired budget',
      });
    case BUDGET_STATUSES.scheduled:
      return intl.formatMessage({
        id: 'lcm.budgets.budget.card.status.scheduled',
        defaultMessage: 'Scheduled',
        description: 'Status for a scheduled budget',
      });
    default:
      return '';
  }
};

/**
 * Translates the budget term using the provided `intl` object.
 * @param {object} intl - The `intl` object used for translation.
 * @param {string} term - The term of the budget.
 * @returns {string} The translated budget term.
 */
export const getTranslatedBudgetTerm = (intl, term) => {
  switch (term) {
    case 'Starts':
      return intl.formatMessage({
        id: 'lcm.budgets.budget.card.term.starts',
        defaultMessage: 'Starts',
        description: 'Term for when a budget starts',
      });
    case 'Expires':
      return intl.formatMessage({
        id: 'lcm.budgets.budget.card.term.expires',
        defaultMessage: 'Expires',
        description: 'Term for when a budget expires',
      });
    case 'Expiring':
      return intl.formatMessage({
        id: 'lcm.budgets.budget.card.term.expiring',
        defaultMessage: 'Expiring',
        description: 'Term for when a budget is expiring',
      });
    case 'Expired':
      return intl.formatMessage({
        id: 'lcm.budgets.budget.card.term.expired',
        defaultMessage: 'Expired',
        description: 'Term for when a budget has expired',
      });
    case 'Retired':
      return intl.formatMessage({
        id: 'lcm.budgets.budget.card.term.retired',
        defaultMessage: 'Retired',
        description: 'Term for when a budget has retired',
      });
    default:
      return '';
  }
};

export const isLmsBudget = (
  activeIntegrationsLength,
  isUniversalGroup,
) => activeIntegrationsLength > 0 && isUniversalGroup;

/**
 * Determines if the course has already started. Mostly used around text formatting for tense
 *
 * @param date
 * @returns {boolean}
 */
export const isDateBeforeToday = date => dayjs(date).isBefore(dayjs());

/**
 * Filters assignable course runs based on the following criteria:
 *  - If hasEnrollBy, we return the soonest of two dates: The subsidy expiration date - refund threshold OR today
 *    offset by the 90-day allocation threshold for an assignment denoted as isEligibleForEnrollment
 *  - If isLateRedemptionEnabled, we consider only the isLateEnrollmentEligible field returned by Algolia for
 *    each run.
 *
 *  Based on the above criteria, if isLateRedemptionAllowed is false, filter on if the course run isActive AND
 *  isEligibleForEnrollment
 *
 *  Furthermore, we return assignable course runs sorted by the enrollBy date (soonest to latest)
 *
 * @param courseRuns
 * @param subsidyExpirationDatetime
 * @param isLateRedemptionAllowed
 * @returns {*}
 */
export const getAssignableCourseRuns = ({ courseRuns, subsidyExpirationDatetime, isLateRedemptionAllowed }) => {
  const clonedCourseRuns = courseRuns.map(courseRun => ({
    ...courseRun,
    enrollBy: courseRun.hasEnrollBy ? dayjs.unix(courseRun.enrollBy).toISOString() : null,
    upgradeDeadline: dayjs.unix(courseRun.upgradeDeadline).toISOString(),
  }));
  const assignableCourseRunsFilter = ({
    enrollBy, isActive, hasEnrollBy = false, isLateEnrollmentEligible = false,
  }) => {
    let isEligibleForEnrollment = true;
    if (hasEnrollBy) {
      isEligibleForEnrollment = dayjs(enrollBy).isBefore(
        Math.min(
          dayjs(subsidyExpirationDatetime).subtract(MAX_ALLOWABLE_REFUND_THRESHOLD_DAYS, 'days').toDate(),
          dayjs().add(DAYS_UNTIL_ASSIGNMENT_ALLOCATION_EXPIRATION, 'days').toDate(),
        ),
      );
    }
    if (isDateBeforeToday(enrollBy) && isLateRedemptionAllowed) {
      const lateEnrollmentCutoff = dayjs().subtract(LATE_ENROLLMENTS_BUFFER_DAYS, 'days');
      isEligibleForEnrollment = dayjs(enrollBy).isAfter(lateEnrollmentCutoff);
      return isLateEnrollmentEligible && isEligibleForEnrollment;
    }
    return isActive && isEligibleForEnrollment;
  };
  const assignableCourseRuns = clonedCourseRuns.filter(assignableCourseRunsFilter);
  const sortedAssignableCourseRuns = assignableCourseRuns.sort((a, b) => a.enrollBy - b.enrollBy);
  return sortedAssignableCourseRuns;
};

export const isCourseSelfPaced = ({ pacingType }) => pacingType === COURSE_PACING_MAP.SELF_PACED;

export const hasTimeToComplete = ({ end, weeksToComplete }) => {
  if (!weeksToComplete || !end) {
    return true;
  }
  const today = dayjs();
  const differenceInWeeks = dayjs(end).diff(today, 'week');
  return weeksToComplete <= differenceInWeeks;
};

const isWithinMinimumStartDateThreshold = ({ start }) => dayjs(start).isBefore(dayjs().subtract(START_DATE_DEFAULT_TO_TODAY_THRESHOLD_DAYS, 'days'));

/**
 * If the start date of the course is before today offset by the START_DATE_DEFAULT_TO_TODAY_THRESHOLD_DAYS
 * then return today's formatted date. Otherwise, pass-through the start date in ISO format.
 *
 * For cases where a start date does not exist, just return today's date.
 *
 * @param {string} - start
 * @param {string} - pacingType
 * @param {string} - end
 * @param {number} - weeksToComplete
 * @returns {string}
 */
export const getNormalizedStartDate = ({
  start, pacingType, end, weeksToComplete,
}) => {
  const todayToIso = dayjs().toISOString();
  if (!start) {
    return todayToIso;
  }
  const startDateIso = dayjs(start).toISOString();
  if (isCourseSelfPaced({ pacingType })) {
    if (hasTimeToComplete({ end, weeksToComplete }) || isWithinMinimumStartDateThreshold({ start })) {
      // always today's date (incentives enrollment)
      return todayToIso;
    }
  }
  return startDateIso;
};

export const getNormalizedEnrollByDate = ({ enrollBy }) => {
  if (!enrollBy) {
    return null;
  }
  const ninetyDaysFromNow = dayjs().add(DAYS_UNTIL_ASSIGNMENT_ALLOCATION_EXPIRATION, 'days');
  if (dayjs(enrollBy).isAfter(ninetyDaysFromNow)) {
    return ninetyDaysFromNow.toISOString();
  }
  return enrollBy;
};
