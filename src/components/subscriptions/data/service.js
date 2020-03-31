import faker from 'faker';
import moment from 'moment';

import { PAGE_SIZE } from '../constants';

function createUser(licenseStatus) {
  return {
    uuid: faker.random.uuid(),
    emailAddress: faker.internet.email(),
    licenseStatus,
  };
}

const users = [
  [...Array(6)].map(() => createUser('active')),
  [...Array(3)].map(() => createUser('assigned')),
  [...Array(1)].map(() => createUser('deactivated')),
].flat();

const getLicensedUsers = () => users.filter(user => user.licenseStatus === 'active');
const getPendingUsers = () => users.filter(user => user.licenseStatus === 'assigned');
const getDeactivatedUsers = () => users.filter(user => user.licenseStatus === 'deactivated');

export function fetchSubscriptionDetails() {
  const purchaseDate = moment(faker.date.past());
  const startDate = moment(purchaseDate).add(15, 'days');
  const endDate = moment(startDate).add(6, 'months');

  const usersByLicenseStatus = {
    active: getLicensedUsers().length,
    assigned: getPendingUsers().length,
    deactivated: getDeactivatedUsers().length,
  };

  return Promise.resolve({
    uuid: faker.random.uuid(),
    purchaseDate: purchaseDate.toISOString(),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    licenses: {
      available: faker.random.number({ min: 10, max: 1000 }),
      allocated: usersByLicenseStatus.active + usersByLicenseStatus.assigned,
      ...usersByLicenseStatus,
    },
  });
}

export function fetchSubscriptionUsers(options = {}) {
  const { searchQuery, statusFilter } = options;
  const response = {
    count: users.length,
    results: users,
  };

  if (searchQuery) {
    response.results = response.results.filter(user => user.emailAddress === searchQuery);
  }

  if (statusFilter) {
    response.results = response.results.filter(user => user.licenseStatus === statusFilter);
  }

  response.count = response.results.length;
  response.results = response.results.slice(0, PAGE_SIZE);

  return Promise.resolve(response);
}
