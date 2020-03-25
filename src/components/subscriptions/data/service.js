import faker from 'faker';

function createUser(licenseStatus) {
  return {
    uuid: faker.random.uuid(),
    emailAddress: faker.internet.email(),
    licenseStatus,
  };
}

export function fetchSubscriptionDetails() {
  return Promise.resolve({
    uuid: faker.random.uuid(),
    startDate: faker.date.past(),
    endDate: faker.date.future(),
    totalLicensesAvailable: faker.random.number({ min: 10, max: 1000 }),
  });
}

export function fetchSubscriptionUsers() {
  const users = [
    [...Array(6)].map(() => createUser('active')),
    [...Array(3)].map(() => createUser('assigned')),
    [...Array(1)].map(() => createUser('deactivated')),
  ].flat();
  return Promise.resolve(users);
}
