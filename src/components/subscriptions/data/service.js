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

const getUsersByStatus = ({ status, list }) => list.filter(user => user.licenseStatus === status);

function getAllocatedLicensesCount() {
  const licensedUsers = getUsersByStatus({ status: 'active', list: users });
  const pendingUsers = getUsersByStatus({ status: 'assigned', list: users });
  return licensedUsers.length + pendingUsers.length;
}

/**
 * This function mocks out the response from a non-existant API endpoint. Once the endpoint
 * exists, the contents of this function will use the `apiClient` to make an actual API
 * call to get this data.
 */
export function fetchSubscriptionDetails() {
  const purchaseDate = moment(faker.date.past());
  const startDate = moment(purchaseDate).add(15, 'days');
  const endDate = moment(startDate).add(6, 'months');

  return Promise.resolve({
    uuid: faker.random.uuid(),
    purchaseDate: purchaseDate.toISOString(),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    licenses: {
      allocated: getAllocatedLicensesCount(),
      available: faker.random.number({ min: 300, max: 1000 }),
    },
  });
}

/**
 * This function mocks out the response from a non-existant API endpoint. Once the endpoint
 * exists, the contents of this function will use the `apiClient` to make an actual API
 * call to get this data.
 */
export function fetchSubscriptionUsersOverview(options = {}) {
  const { searchQuery } = options;
  let userList = users;

  if (searchQuery) {
    userList = userList.filter(user => user.emailAddress === searchQuery);
  }

  const response = {
    all: userList.length,
    active: getUsersByStatus({ status: 'active', list: userList }).length,
    assigned: getUsersByStatus({ status: 'assigned', list: userList }).length,
    deactivated: getUsersByStatus({ status: 'deactivated', list: userList }).length,
  };

  return response;
}

/**
 * This function mocks out the response from a non-existant API endpoint. Once the endpoint
 * exists, the contents of this function will use the `apiClient` to make an actual API
 * call to get this data.
 */
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

/**
 * This function mocks out the response from a non-existant API endpoint. Once the endpoint
 * exists, the contents of this function will use the `apiClient` to make an actual API
 * call to get this data.
 */
export function subscribeUsers(payload) {
  return Promise.resolve(payload);
  // return Promise.reject(new Error('Could not connect to the server'));
}

/**
 * This function mocks out the response from a non-existant API endpoint. Once the endpoint
 * exists, the contents of this function will use the `apiClient` to make an actual API
 * call to get this data.
 */
export function sendLicenseReminder(options = {}) {
  return Promise.resolve(options);
  // return Promise.reject(new Error('Could not connect to the server'));
}
