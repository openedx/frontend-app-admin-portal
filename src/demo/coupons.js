import faker from 'faker';

import { configuration } from '../config';

const couponsCount = 15;
const codesCount = 115;

const minRedemptionsCount = 1;
const maxRedemptionsCount = 5;

let firstCouponHasError = false;

// If development environment, let's set the first coupon to have an error for testing purposes.
if (configuration.NODE_ENV === 'development') {
  firstCouponHasError = true;
}

// Coupon details filters.
const unassignedCodesFilter = 'unassigned';
const unredeemedCodesFilter = 'unredeemed';
const partiallyRedeemedCodesFilter = 'partially-redeemed';
const redeemedCodesFilter = 'redeemed';

const couponTitles = [
  '250ML - DEC2019',
  'F100K - JAN2019',
  'RN201 - FEB2019',
  'LRK007 - MAR2019',
  'LHE120 - 50CODES - JAN2019',
  'SUK20 - 50CODES - JAN2019',
  'INDUS10 - 20CODES - NOV2019',
  'STJ60 20CODES DEC2019',
  'NST100 - FEB2019',
  'SCS13 15CODES MAR2019',
  'MSCG10 - DEC2019',
  'CCGS10 - DEC2019',
  'SSPK - 20CODES - FEB2019',
  'WRR30 20CODES JAN2019',
  'RG007 - 20CODES - JAN2019',
  'HOG90 - JAN2019',
  'KNG49 - 20CODES',
  'INOCHA10 - 20CODES - JUL2019',
  'LKHM10 - 20CODES - JUN2019',
  'R4KJ190 - JAN2019',
  'HINK150 - 20CODES - APR2019',
  'RIIN150 20 CODES MAR2019',
  'SK120 - JAN2019',
  'RPP10 - 60CODES - FEB2019',
  'PML-K - JAN2019',
  'PP-120 - APR2019',
  'NA-207 - FEB2019',
  'LGGR LTD FEB2019',
  'NA-109 - MAY2019',
  'PDM120 - 30CODES - SEP2019',
];

const coupons = [...Array(couponsCount)].map((_, index) => {
  const validFromDate = faker.date.past();
  const totalEnrollments = faker.random.number({ min: 1, max: 50 });
  return {
    id: index,
    title: couponTitles[
      faker.random.number({ min: 0, max: couponTitles.length - 1 })
    ].toUpperCase(),
    start_date: validFromDate.toISOString(),
    end_date: faker.date.future(null, validFromDate).toISOString(),
    num_unassigned: faker.random.number({ min: 1, max: 20 }),
    num_uses: faker.random.number({ min: 1, max: totalEnrollments }),
    max_uses: faker.random.boolean() ? totalEnrollments : null,
    has_error: false,
  };
});

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

const getAllCodes = (couponHasError = false) => [...Array(codesCount)].map((_, index) => {
  const code = Math.random().toString(36).substring(2).toUpperCase();
  const codeHasError = couponHasError && index <= 1;
  const isAssigned = codeHasError || faker.random.boolean();
  const assignedTo = getAssignedTo(isAssigned);

  const redemptionsAvailablePerCode = faker.random.number({
    min: minRedemptionsCount,
    max: maxRedemptionsCount,
  });

  const maxUsed = maxRedemptionsCount - redemptionsAvailablePerCode;
  const redemptionsUsedPerCode = isAssigned ? faker.random.number({
    min: minRedemptionsCount,
    max: codeHasError ? maxUsed : redemptionsAvailablePerCode,
  }) : minRedemptionsCount - 1;

  const errorMessage = `Unable to deliver email to ${assignedTo.name} (${assignedTo.email})`;
  return {
    code,
    assigned_to: assignedTo.email,
    redeem_url: `https://bestrun.com/coupons/offer/?code=${code}`,
    redemptions: {
      available: redemptionsAvailablePerCode,
      used: redemptionsUsedPerCode,
    },
    error: codeHasError ? errorMessage : null,
  };
});

const allCodes = getAllCodes();

const unassignedCodes = allCodes.filter(code => (
  code.assigned_to === undefined && code.redemptions.used < code.redemptions.available
));
const unredeemedCodes = allCodes.filter(code => (
  code.assigned_to !== undefined && code.redemptions.used < code.redemptions.available
));
const partiallyRedeemedCodes = allCodes.filter(code => (
  (code.redemptions.used > minRedemptionsCount &&
    code.redemptions.used < code.redemptions.available)
));
const redeemedCodes = allCodes.filter(code => (
  code.redemptions.available === code.redemptions.used
));

const getCodes = ({ codeFilter = unassignedCodesFilter, couponHasError = false }) => {
  if (codeFilter === unassignedCodesFilter) {
    return unassignedCodes;
  } else if (codeFilter === unredeemedCodesFilter) {
    return unredeemedCodes;
  } else if (codeFilter === partiallyRedeemedCodesFilter) {
    return partiallyRedeemedCodes;
  } else if (codeFilter === redeemedCodesFilter) {
    return redeemedCodes;
  }
  return getAllCodes(couponHasError);
};

const getCsvHeaders = () => Object.keys(allCodes[0]).reduce((csvData, codeKey) => {
  let newData;
  if (allCodes[0][codeKey] && typeof allCodes[0][codeKey] === 'object') {
    const objectKeys = Object.keys(allCodes[0][codeKey]);
    // Just to make in line with backend e.g redemptions.used.
    newData = objectKeys.map(key => `${codeKey}.${key}`);
  } else {
    newData = codeKey;
  }
  if (csvData !== '') {
    newData = `${csvData},${newData}`;
  }
  return newData;
}, '');

const getCsvRow = code => Object.keys(code).reduce((csvData, codeKey) => {
  let newData;
  if (code[codeKey] && typeof code[codeKey] === 'object') {
    newData = Object.values(code[codeKey]).toString();
  } else {
    newData = code[codeKey];
  }
  if (csvData !== '') {
    newData = `${csvData},${newData}`;
  }
  return newData;
}, '');

const getCodesCsv = () => allCodes.reduce((csvData, code) => (
  `${csvData}${getCsvRow(code)}\n`
), `${getCsvHeaders()}\n`);

coupons[0].has_error = firstCouponHasError;

export {
  coupons,
  getCodes as codes,
  getCodesCsv as codesCsv,
};
