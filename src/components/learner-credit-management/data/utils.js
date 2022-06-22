/**
 * Transforms utilization data from API for display in the UI.
 *
 * @param {object} offerUtilization Object containing metadata about utilization for an offer.
 * @returns Object transformed metadata about an enterprise offer.
 */
export const transformOfferUtilization = (offerUtilization) => {
  if (!offerUtilization) { return null; }

  const totalFunds = parseFloat(offerUtilization.maxDiscount);
  const redeemedFunds = parseFloat(offerUtilization.amountOfOfferSpent);
  const remainingFunds = parseFloat(offerUtilization.remainingBalance);
  const percentUtilized = parseFloat(offerUtilization.percentUtilized);

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
