import {
  LOW_REMAINING_BALANCE_PERCENT_THRESHOLD,
  NO_BALANCE_REMAINING_DOLLAR_THRESHOLD,
} from './constants';

/**
 * Transforms offer summary from API for display in the UI, guarding
 * against bad data (e.g., accounting for refunds).
 *
 * @param {object} offerSummary Object containing summary about an offer.
 * @returns Object containing transformed summary about an enterprise offer.
 */
export const transformOfferSummary = (offerSummary) => {
  if (!offerSummary) { return null; }

  const totalFunds = offerSummary.maxDiscount && parseFloat(offerSummary.maxDiscount);
  let redeemedFunds = offerSummary.amountOfOfferSpent && parseFloat(offerSummary.amountOfOfferSpent);

  // cap redeemed funds at the maximum funds available (`maxDiscount`), if applicable, so we
  // don't display redeemed funds > funds available.
  if (totalFunds) {
    redeemedFunds = Math.min(redeemedFunds, totalFunds);
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

  return {
    totalFunds,
    redeemedFunds,
    remainingFunds,
    percentUtilized,
  };
};

/**
 * Transforms enrollment data from analytics api to fields for display
 * in learner credit allocation table.
 *
 * @param {array} results List of raw enrollment results from API.
 *
 * @returns List of transformed results for display in table.
 */
export const transformUtilizationTableResults = results => results.map(result => ({
  created: result.created,
  enterpriseEnrollmentId: result.enterpriseEnrollmentId,
  userEmail: result.userEmail === null ? '' : result.userEmail,
  courseTitle: result.courseTitle,
  courseListPrice: result.courseListPrice,
  enrollmentDate: result.enrollmentDate,
})).filter(result => result.enterpriseEnrollmentId !== null);

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
