// Helper function to add the given number of days to the supplied date, handling rollover
const addDays = (date, days) => {
  const copy = new Date(Number(date));
  copy.setDate(date.getDate() + days);
  return copy;
};

// Helper to return the appropriate subscription context details for expiration testing
const getSubscriptionExpirationDetails = (daysUntilExpiration, expirationDate) => (
  {
    details: {
      daysUntilExpiration,
      expirationDate,
    },
  }
);

export {
  addDays,
  getSubscriptionExpirationDetails,
};
