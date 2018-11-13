import faker from 'faker';

import { formatTimestamp } from '../utils';
import { configuration } from '../config';

const couponsCount = 15;
const codesCount = 15;

let firstCouponHasError = false;

// If development environment, let's set the first coupon to have an error for testing purposes.
if (configuration.NODE_ENV === 'development') {
  firstCouponHasError = true;
}

const coupons = {
  count: couponsCount,
  num_pages: Math.ceil(couponsCount / 10),
  current_page: 1,
  results: [...Array(couponsCount)].map((_, index) => {
    const validFromDate = faker.date.past();
    const totalEnrollments = faker.random.number({ min: 1, max: 50 });
    return {
      id: index,
      title: faker.random.words(),
      validFromDate: formatTimestamp({ timestamp: validFromDate.toUTCString() }),
      validToDate: formatTimestamp({
        timestamp: faker.date.future(null, validFromDate).toUTCString(),
      }),
      unassignedCodes: faker.random.number({ min: 1, max: 20 }),
      enrollmentsRedeemed: faker.random.number({ min: 1, max: totalEnrollments }),
      totalEnrollments,
      hasError: false,
    };
  }),
};

const getAssignedTo = (isAssigned = false) => {
  if (!isAssigned) {
    return {};
  }

  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.email(firstName, lastName, 'bestrun.com');

  return {
    name: `${firstName} ${lastName}`,
    email,
  };
};

const getCodes = (couponHasError = false) => {
  const redemptionsAvailablePerCode = faker.random.number({ min: 1, max: 5 });
  return {
    count: codesCount,
    num_pages: Math.ceil(codesCount / 10),
    current_page: 1,
    results: [...Array(codesCount)].map((_, index) => {
      const codeHasError = couponHasError && index <= 1;
      const isAssigned = codeHasError || faker.random.boolean();
      const assignedTo = getAssignedTo(isAssigned);
      return {
        title: Math.random().toString(36).substring(2).toUpperCase(),
        assigned_to: assignedTo.name,
        redemptions: {
          available: redemptionsAvailablePerCode,
          used: isAssigned ? faker.random.number({
            min: 0,
            max: codeHasError ? redemptionsAvailablePerCode - 1 : redemptionsAvailablePerCode,
          }) : 0,
        },
        error: codeHasError ? `Unable to deliver email to ${assignedTo.name} (${assignedTo.email})` : null,
      };
    }),
  };
};

coupons.results[0].hasError = firstCouponHasError;

export {
  coupons,
  getCodes as codes,
};
