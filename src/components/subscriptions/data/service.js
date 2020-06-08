import faker from 'faker';
import moment from 'moment';

import { PAGE_SIZE, ACTIVE, ASSIGNED, DEACTIVATED } from '../constants';

export function createSampleUser(licenseStatus) {
  return {
    userId: faker.random.uuid(),
    emailAddress: faker.internet.email(),
    licenseStatus,
  };
}

const users = [
  [...Array(6)].map(() => createSampleUser(ACTIVE)),
  [...Array(3)].map(() => createSampleUser(ASSIGNED)),
  [...Array(1)].map(() => createSampleUser(DEACTIVATED)),
].flat();

const getUsersByStatus = ({ status, list }) => list.filter(user => user.licenseStatus === status);

function getAllocatedLicensesCount() {
  const licensedUsers = getUsersByStatus({ status: ACTIVE, list: users });
  const pendingUsers = getUsersByStatus({ status: ASSIGNED, list: users });
  return licensedUsers.length + pendingUsers.length;
}

function createNewUser({ userId, emailAddress, licenseStatus = ASSIGNED }) {
  const user = { userId, emailAddress, licenseStatus };
  users.append(user);
  return user;
}

function updateUserLicenseStatus({ userId, status }) {
  const index = users.findIndex(item => item.userId === userId);

  if (index !== -1) {
    users[index] = {
      ...users[index],
      licenseStatus: status,
    };

    return users[index];
  }

  return null;
}

const purchaseDate = moment(faker.date.past());
const startDate = moment(purchaseDate).add(15, 'days');
const endDate = moment(startDate).add(6, 'months');
const numLicensedPurchased = faker.random.number({ min: 300, max: 1000 });

const getSubscriptionDetails = () => ({
  uuid: faker.random.uuid(),
  purchaseDate: purchaseDate.toISOString(),
  startDate: startDate.toISOString(),
  endDate: endDate.toISOString(),
  licenses: {
    allocated: getAllocatedLicensesCount(),
    available: numLicensedPurchased,
  },
});

/**
 * This function mocks out the response from a non-existant API endpoint. Once the endpoint
 * exists, the contents of this function will use the `apiClient` to make an actual API
 * call to get this data.
 */
export function fetchSubscriptionDetails() {
  const details = getSubscriptionDetails();
  return Promise.resolve(details);
  // return Promise.reject(new Error('Could not connect to the server'));
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

  return Promise.resolve(response);
  // return Promise.reject(new Error('Could not connect to the server'));
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

  console.log('fetchSubscriptionUsers...', options, response);

  return Promise.resolve(response);
  // return Promise.reject(new Error('Could not connect to the server'));
}

/**
 * This function mocks out the response from a non-existant API endpoint. Once the endpoint
 * exists, the contents of this function will use the `apiClient` to make an actual API
 * call to get this data.
 */
export function sendLicenseReminder(options = {}) {
  return Promise.resolve(options);
}

/**
 * This function mocks out the response from a non-existant API endpoint. Once the endpoint
 * exists, the contents of this function will use the `apiClient` to make an actual API
 * call to get this data.
 */
export function addLicensesForUsers(payload) {
  return Promise.resolve(payload);
  // return Promise.reject(new Error('Could not connect to the server'));
}

/**
 * This function mocks out the response from a non-existant API endpoint. Once the endpoint
 * exists, the contents of this function will use the `apiClient` to make an actual API
 * call to get this data.
 */
export function sendLicenseRevoke(options = {}) {
  const { userId } = options;

  updateUserLicenseStatus({ userId, status: DEACTIVATED });

  const updatedUser = users.find(item => item.userId === userId);
  return Promise.resolve(updatedUser);
  // return Promise.reject(new Error('Could not connect to the server'));
}

/**
 * This function mocks out the response from a non-existant API endpoint. Once the endpoint
 * exists, the contents of this function will use the `apiClient` to make an actual API
 * call to get this data.
 */
export function addUsers(options = {}) {
  const { users: newUsers } = options;
  const created = newUsers.map(user => createNewUser(user));

  return Promise.resolve(created);
  // return Promise.reject(new Error('Could not connect to the server'));
}
