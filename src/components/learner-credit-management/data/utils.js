import { LEARNER_CREDIT_UTILIZATION_THRESHOLDS } from './constants';

/**
 * Transforms offer summary from API for display in the UI.
 *
 * @param {object} offerSummary Object containing summary about an offer.
 * @returns Object containing transformed summary about an enterprise offer.
 */
export const transformOfferSummary = (offerSummary) => {
  if (!offerSummary) { return null; }

  const totalFunds = parseFloat(offerSummary.maxDiscount);
  const redeemedFunds = parseFloat(offerSummary.amountOfOfferSpent);
  const remainingFunds = parseFloat(offerSummary.remainingBalance);
  const percentUtilized = parseFloat(offerSummary.percentOfOfferSpent);

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
  enterpriseEnrollmentId: result.enterpriseEnrollmentId,
  userEmail: result.userEmail,
  courseTitle: result.courseTitle,
  courseListPrice: result.courseListPrice,
  enrollmentDate: result.enrollmentDate,
}));

/**
 * Gets appropriate color variant for the annotated progress bar.
 *
 * @param {Number} percentUtilized A float (0.0 - 1.0) of percentage funds utilized for an offer.
 *
 * @returns Appropriate color variant for annotated progress bar.
 */
export const getProgressBarVariant = (percentUtilized) => {
  let variant = 'success'; // default to green
  if (
    percentUtilized > LEARNER_CREDIT_UTILIZATION_THRESHOLDS.warning
    && percentUtilized < LEARNER_CREDIT_UTILIZATION_THRESHOLDS.error
  ) {
    variant = 'danger'; // yellow
  } else if (percentUtilized > LEARNER_CREDIT_UTILIZATION_THRESHOLDS.error) {
    variant = 'error'; // red
  }
  return variant;
};
