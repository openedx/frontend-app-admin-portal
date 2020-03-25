import faker from 'faker';

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
  return Promise.resolve({
    uuid: faker.random.uuid(),
    startDate: faker.date.past(),
    endDate: faker.date.future(),
    totalLicensesAvailable: faker.random.number({ min: 10, max: 1000 }),
  });
}

export function fetchSubscriptionUsers(searchQuery) {
  if (searchQuery) {
    return Promise.resolve(users.filter(user => user.emailAddress === searchQuery));
  }
  return Promise.resolve(users);
}
