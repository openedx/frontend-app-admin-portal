import faker from 'faker';

import { formatTimestamp } from '../utils';

const couponsCount = 15;
const codesCount = 15;

const coupons = {
  count: couponsCount,
  num_pages: Math.ceil(couponsCount / 10),
  current_page: 1,
  results: [...Array(couponsCount)].map(() => {
    const validFromDate = faker.date.past();
    const totalEnrollments = faker.random.number({ min: 1, max: 50 });
    return {
      title: faker.random.words(),
      validFromDate: formatTimestamp({ timestamp: validFromDate.toUTCString() }),
      validToDate: formatTimestamp({
        timestamp: faker.date.future(null, validFromDate).toUTCString(),
      }),
      unassignedCodes: faker.random.number({ min: 1, max: 20 }),
      enrollmentsRedeemed: faker.random.number({ min: 1, max: totalEnrollments }),
      totalEnrollments,
    };
  }),
};

const redemptionsAvailablePerCode = faker.random.number({ min: 1, max: 5 });
const codes = {
  count: codesCount,
  num_pages: Math.ceil(codesCount / 10),
  current_page: 1,
  results: [...Array(codesCount)].map(() => {
    const isAssigned = faker.random.boolean();
    return {
      title: Math.random().toString(36).substring(2).toUpperCase(),
      assigned_to: isAssigned && faker.name.findName(),
      redemptions: {
        available: redemptionsAvailablePerCode,
        used: isAssigned ? faker.random.number({ min: 0, max: redemptionsAvailablePerCode }) : 0,
      },
    };
  }),
};

export {
  coupons,
  codes,
};
