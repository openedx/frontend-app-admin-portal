import faker from 'faker';
import moment from 'moment';

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

export function fetchSubscriptionDetails() {
  const purchaseDate = moment(faker.date.past());
  const startDate = moment(purchaseDate).add(15, 'days');
  const endDate = moment(startDate).add(6, 'months');

  return Promise.resolve({
    uuid: faker.random.uuid(),
    totalLicensesAvailable: faker.random.number({ min: 10, max: 1000 }),
    purchaseDate: purchaseDate.toISOString(),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });
}

export function fetchSubscriptionUsers(searchQuery) {
  if (searchQuery) {
    return Promise.resolve(users.filter(user => user.emailAddress === searchQuery));
  }
  return Promise.resolve(users);
}
