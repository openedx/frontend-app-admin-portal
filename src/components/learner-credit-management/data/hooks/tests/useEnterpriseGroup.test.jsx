import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks';

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
        enterprise_customer: 'customer-uuid',
        name: 'groupidy group',
        uuid: 'group-uuid',
      },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseGroup(mockSubsidyAccessPolicy),
      { wrapper },
    );

    await waitForNextUpdate();
    expect(result.current.data).toEqual(
      { enterpriseCustomer: 'customer-uuid', name: 'groupidy group', uuid: 'group-uuid' },
    );
  });

  it('should return null if no group associations are listed', async () => {
    jest.spyOn(LmsApiService, 'fetchEnterpriseGroup').mockResolvedValueOnce({
      data: {
        enterprise_customer: 'customer-uuid',
        name: 'groupidy group',
        uuid: 'group-uuid',
      },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseGroup(mockSubsidyAccessPolicyNoGroups),
      { wrapper },
    );

    await waitForNextUpdate();
    expect(result.current.data).toBe(null);
  });
});
