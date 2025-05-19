import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { fetchEnterpriseAppData } from './enterpriseApp';
import { fetchPortalConfiguration } from './portalConfiguration';
import { fetchLoggedInEnterpriseAdmin } from './enterpriseCustomerAdmin';

// Mock the imported functions
jest.mock('./portalConfiguration', () => ({
  fetchPortalConfiguration: jest.fn(),
}));

jest.mock('./enterpriseCustomerAdmin', () => ({
  fetchLoggedInEnterpriseAdmin: jest.fn(),
}));

const mockStore = configureMockStore([thunk]);

describe('enterpriseApp actions', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore();
    jest.clearAllMocks();
  });

  describe('fetchEnterpriseAppData', () => {
    const slug = 'test-enterprise';

    it('calls fetchPortalConfiguration and fetchLoggedInEnterpriseAdmin', async () => {
      // Mock the return values of the action creators
      const mockPortalConfigPromise = Promise.resolve('portal-config-result');
      const mockAdminPromise = Promise.resolve('admin-result');

      (fetchPortalConfiguration as jest.Mock).mockImplementation(() => () => mockPortalConfigPromise);
      (fetchLoggedInEnterpriseAdmin as jest.Mock).mockImplementation(() => () => mockAdminPromise);

      // Call the action creator
      await store.dispatch(fetchEnterpriseAppData(slug));

      // Verify that both fetch functions were called
      expect(fetchPortalConfiguration).toHaveBeenCalledWith(slug);
      expect(fetchLoggedInEnterpriseAdmin).toHaveBeenCalled();
    });

    it('continues execution even if one fetch fails', async () => {
      // Mock one success and one failure
      const mockPortalConfigPromise = Promise.resolve('portal-config-result');
      const mockError = new Error('Failed to fetch admin');
      const mockAdminPromise = Promise.reject(mockError);

      (fetchPortalConfiguration as jest.Mock).mockImplementation(() => () => mockPortalConfigPromise);
      (fetchLoggedInEnterpriseAdmin as jest.Mock).mockImplementation(() => () => mockAdminPromise);

      // Action should not throw despite the rejection
      await expect(store.dispatch(fetchEnterpriseAppData(slug))).resolves.not.toThrow();

      // Verify that both fetch functions were still called
      expect(fetchPortalConfiguration).toHaveBeenCalledWith(slug);
      expect(fetchLoggedInEnterpriseAdmin).toHaveBeenCalled();
    });

    it('waits for all promises to settle before returning', async () => {
      // Create promises that resolve after a delay
      const delay = (ms: number) => new Promise<void>(resolve => { setTimeout(() => resolve(), ms); });

      const mockPortalConfigPromise = delay(100).then(() => 'portal-config-result');
      const mockAdminPromise = delay(50).then(() => 'admin-result');

      (fetchPortalConfiguration as jest.Mock).mockImplementation(() => () => mockPortalConfigPromise);
      (fetchLoggedInEnterpriseAdmin as jest.Mock).mockImplementation(() => () => mockAdminPromise);

      // Create a spy to check when the promise settles
      const settleSpy = jest.fn();

      // Call the action creator and add a then callback with the spy
      const actionPromise = store.dispatch(fetchEnterpriseAppData(slug)).then(settleSpy);

      // Initially, the spy should not have been called
      expect(settleSpy).not.toHaveBeenCalled();

      // After all promises settle, the spy should be called
      await actionPromise;
      expect(settleSpy).toHaveBeenCalled();
    });
  });
});
