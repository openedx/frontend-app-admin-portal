import { Dispatch, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { fetchPortalConfiguration } from './portalConfiguration';
import { fetchLoggedInEnterpriseAdmin } from './enterpriseCustomerAdmin';

/**
 * Type definition for fetch functions passed to fetchInParallel
 */
type FetchFunction = () => Promise<any>;

/**
 * fetchInParallel
 *
 * Takes multiple fetch functions that can be passed like this:
 * [async () => someFetchRequest()]
 *
 * Returns a Promise after all fetch functions have been run in parallel
 * and returned with success or error.
 */
const fetchInParallel = async (fetchFunctions: FetchFunction[]): Promise<PromiseSettledResult<any>[]> => {
  const promises = fetchFunctions.map(fn => fn());
  return Promise.allSettled(promises);
};

const fetchEnterpriseAppData = (slug: string) => (
  async (dispatch: ThunkDispatch<{}, {}, AnyAction>): Promise<void> => {
    const fetchFunctions: FetchFunction[] = [
      async () => dispatch(fetchPortalConfiguration(slug)),
      async () => dispatch(fetchLoggedInEnterpriseAdmin()),
    ];
    await fetchInParallel(fetchFunctions);
  }
);

export {
  fetchEnterpriseAppData,
};
