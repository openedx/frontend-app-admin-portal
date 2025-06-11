import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import useEnterpriseGroup from '../useEnterpriseGroup';
import LmsApiService from '../../../../../data/services/LmsApiService';
import { queryClient } from '../../../../test/testUtils';

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>{children}</QueryClientProvider>
);

const mockSubsidyAccessPolicy = {
  uuid: 'test-subsidy-access-policy-uuid',
  groupAssociations: ['group-uuid'],
};

const mockSubsidyAccessPolicyNoGroups = {
  uuid: 'test-subsidy-access-policy-uuid',
  groupAssociations: null,
};

describe('useEnterpriseGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and return enterprise group', async () => {
    jest.spyOn(LmsApiService, 'fetchEnterpriseGroup').mockResolvedValueOnce({
      data: {
        enterpriseCustomer: 'customer-uuid',
        name: 'groupidy group',
        uuid: 'group-uuid',
      },
    });

    const { result } = renderHook(
      () => useEnterpriseGroup(mockSubsidyAccessPolicy),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
    expect(result.current.data).toEqual(
      { enterpriseCustomer: 'customer-uuid', name: 'groupidy group', uuid: 'group-uuid' },
    );
  });

  it('should return null if no group associations are listed', async () => {
    jest.spyOn(LmsApiService, 'fetchEnterpriseGroup').mockResolvedValueOnce({
      data: {
        enterpriseCustomer: 'customer-uuid',
        name: 'groupidy group',
        uuid: 'group-uuid',
      },
    });

    const { result } = renderHook(
      () => useEnterpriseGroup(mockSubsidyAccessPolicyNoGroups),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.data).toBe(null);
    });
  });
});
