import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks';

import useEnterpriseCustomer from '../useEnterpriseCustomer';
import LmsApiService from '../../../../../data/services/LmsApiService';
import { queryClient } from '../../../../test/testUtils';

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>{children}</QueryClientProvider>
);

const TEST_UUID = 'test-uuid';

describe('useEnterpriseCustomer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and return enterprise customer', async () => {
    jest.spyOn(LmsApiService, 'fetchEnterpriseCustomer').mockResolvedValueOnce({
      data: {
        uuid: TEST_UUID,
        slug: 'test-slug',
        name: 'enterprise-customer-name',
        active_integrations: ['BLACKBOARD'],
      },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseCustomer(TEST_UUID),
      { wrapper },
    );

    await waitForNextUpdate();
    expect(result.current.data).toEqual(
      {
        uuid: TEST_UUID,
        slug: 'test-slug',
        name: 'enterprise-customer-name',
        activeIntegrations: ['BLACKBOARD'],
      },
    );
  });
});
