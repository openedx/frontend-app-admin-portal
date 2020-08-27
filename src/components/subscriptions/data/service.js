import faker from 'faker';
import moment from 'moment';
import qs from 'query-string';

import { ACTIVATED, ASSIGNED, REVOKED } from '../constants';

import apiClient from '../../../data/apiClient';
import { configuration } from '../../../config';

export function createSampleUser(licenseStatus) {
  return {
    userId: faker.random.uuid(),
    emailAddress: faker.internet.email(),
    lastRemindDate: moment(faker.date.past(10)),
    licenseStatus,
  };
}

const users = [
  [...Array(6)].map(() => createSampleUser(ACTIVATED)),
  [...Array(3)].map(() => createSampleUser(ASSIGNED)),
  [...Array(1)].map(() => createSampleUser(REVOKED)),
].flat();

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

function updateUserRemindTimeStamp({ userId, bulkRemind, lastRemindDate }) {
  if (!bulkRemind) {
    const index = users.findIndex(item => item.userId === userId);
    if (index !== -1) {
      users[index] = {
        ...users[index],
        lastRemindDate,
      };
      return users;
    }
  } else {
    return users.map(user =>
      (user.licenseStatus === ASSIGNED ? { ...user, lastRemindDate } : user));
  }

  return null;
}

/**
 * This function mocks out the response from a non-existant API endpoint. Once the endpoint
 * exists, the contents of this function will use the `apiClient` to make an actual API
 * call to get this data.
 */
export function sendLicenseReminder(options = {}) {
  const { userId, bulkRemind } = options;
  const lastRemindDate = moment();
  const response = updateUserRemindTimeStamp({ userId, bulkRemind, lastRemindDate });

  return Promise.resolve(response);
  // return Promise.reject(new Error('Could not connect to the server'));
}

/**
 * This function mocks out the response from a non-existant API endpoint. Once the endpoint
 * exists, the contents of this function will use the `apiClient` to make an actual API
 * call to get this data.
 */
export function sendLicenseRevoke(options = {}) {
  const { userId } = options;

  updateUserLicenseStatus({ userId, status: REVOKED });

  const updatedUser = users.find(item => item.userId === userId);
  return Promise.resolve(updatedUser);
  // return Promise.reject(new Error('Could not connect to the server'));
}

class LicenseManagerApiService {
  static licenseManagerBaseUrl = `${configuration.LICENSE_MANAGER_BASE_URL}/api/v1`;

  static licenseAssign(options, subscriptionUUID) {
    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/${subscriptionUUID}/licenses/assign/`;
    return apiClient.post(url, options, 'json');
  }

  static licenseRemind(options, subscriptionUUID, bulkRemind) {
    const remindUrl = bulkRemind ? 'remind-all' : 'remind';

    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/${subscriptionUUID}/licenses/${remindUrl}/`;
    return apiClient.post(url, options, 'json');
  }

  static fetchSubscriptions(options) {
    const queryParams = {
      ...options,
    };

    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/?${qs.stringify(queryParams)}`;
    return apiClient.get(url);
  }

  static fetchSubscriptionUsers(subscriptionUUID, options) {
    const queryParams = {
      ...options,
    };

    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/${subscriptionUUID}/licenses/?${qs.stringify(queryParams)}`;
    return apiClient.get(url);
  }

  static fetchSubscriptionUsersOverview(subscriptionUUID, options) {
    const queryParams = {
      ...options,
    };

    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/${subscriptionUUID}/licenses/overview/?${qs.stringify(queryParams)}`;
    return apiClient.get(url);
  }

  static licenseRevoke(subscriptionUUID, options) {
    const url = `${LicenseManagerApiService.licenseManagerBaseUrl}/subscriptions/${subscriptionUUID}/licenses/revoke/`;
    return apiClient.post(url, options, 'json');
  }
}

export default LicenseManagerApiService;
