import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

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

    const { result } = renderHook(
      () => useEnterpriseCustomer(TEST_UUID),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
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
