import { v4 as uuidv4 } from 'uuid';
import {
  LOW_REMAINING_BALANCE_PERCENT_THRESHOLD,
  NO_BALANCE_REMAINING_DOLLAR_THRESHOLD,
} from './constants';
import { BUDGET_STATUSES } from '../../EnterpriseApp/data/constants';
/**
 * Transforms offer summary from API for display in the UI, guarding
 * against bad data (e.g., accounting for refunds).
 *
 * @param {object} offerSummary Object containing summary about an offer.
 * @returns Object containing transformed summary about an enterprise offer.
 */
export const transformOfferSummary = (offerSummary) => {
  if (!offerSummary) { return null; }
  const budgetsSummary = [];
  if (offerSummary?.budgets) {
    const budgets = offerSummary?.budgets;
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

  const totalFunds = offerSummary.maxDiscount && parseFloat(offerSummary.maxDiscount);
  let redeemedFunds = offerSummary.amountOfOfferSpent && parseFloat(offerSummary.amountOfOfferSpent);
  let redeemedFundsOcm = offerSummary.amountOfferSpentOcm && parseFloat(offerSummary.amountOfferSpentOcm);
  let redeemedFundsExecEd = offerSummary.amountOfferSpentExecEd && parseFloat(offerSummary.amountOfferSpentExecEd);

  // cap redeemed funds at the maximum funds available (`maxDiscount`), if applicable, so we
  // don't display redeemed funds > funds available.
  if (totalFunds) {
    redeemedFunds = Math.min(redeemedFunds, totalFunds);
    redeemedFundsOcm = Math.min(redeemedFundsOcm, totalFunds);
    redeemedFundsExecEd = Math.min(redeemedFundsExecEd, totalFunds);
  }

  let remainingFunds = offerSummary.remainingBalance && parseFloat(offerSummary.remainingBalance);
  // prevent remaining funds from going below $0, if applicable.
  if (remainingFunds) {
    remainingFunds = Math.max(remainingFunds, 0.0);
  }

  let percentUtilized = offerSummary.percentOfOfferSpent && parseFloat(offerSummary.percentOfOfferSpent);
  // prevent percent utilized from going over 1.0, if applicable.
  if (percentUtilized) {
    percentUtilized = Math.min(percentUtilized, 1.0);
  }
  const { offerType } = offerSummary;
  const { offerId } = offerSummary;
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
  courseProductLine: result.courseProductLine,
  uuid: uuidv4(),
  courseKey: result.courseKey,
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

export const formatPrice = (price) => {
  const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  return USDollar.format(Math.abs(price));
};

/**
 * Orders a list of offers based on their status, end date, and name.
 * Active offers come first, followed by scheduled offers, and then expired offers.
 * Within each status, offers are sorted by their end date and name.
 *
 * @param {Array} offers - An array of offer objects.
 * @returns {Array} - The sorted array of offer objects.
 */
export const orderOffers = (offers) => {
  const statusOrder = {
    Active: 0,
    Scheduled: 1,
    Expired: 2,
  };

  offers?.sort((offerA, offerB) => {
    const statusA = getBudgetStatus(offerA.start, offerA.end).status;
    const statusB = getBudgetStatus(offerB.start, offerB.end).status;

    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }

    if (offerA.end !== offerB.end) {
      return offerA.end.localeCompare(offerB.end);
    }

    return offerA.name.localeCompare(offerB.name);
  });

  return offers;
};
