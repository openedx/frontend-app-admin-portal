import { fetchPortalConfiguration } from './portalConfiguration';
import { fetchLoggedInEnterpriseAdmin } from './enterpriseCustomerAdmin';

/**
 * fetchInParallel
 *
 * Takes multiple fetch functions that can be passed like this:
 * [async () => someFetchRequest()]
 *
 * Returns a Promise after all fetch functions have been run in parallel
 * and returned with success or error.
 */
const fetchInParallel = async (fetchFunctions) => {
  const promises = fetchFunctions.map(fn => fn());
  return Promise.allSettled(promises);
};

const fetchEnterpriseAppData = slug => (
  async (dispatch) => {
    const fetchFunctions = [
      async () => dispatch(fetchPortalConfiguration(slug)),
      async () => dispatch(fetchLoggedInEnterpriseAdmin()),
    ];
    await fetchInParallel(fetchFunctions);
  }
);

export {
  fetchEnterpriseAppData,
};
