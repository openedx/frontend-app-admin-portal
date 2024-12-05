import { renderHook } from '@testing-library/react-hooks';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import LmsApiService from '../../../data/services/LmsApiService';

import useEnterpriseMembersTableData from '../data/hooks/useEnterpriseMembersTableData';

describe('useEnterpriseMembersTableData', () => {
  it('should fetch and return members of an enterprise', async () => {
    const mockEnterpriseUUID = 'uuid-bb';
    const mockData = {
      count: 1,
      current_page: 1,
      next: null,
      num_pages: 1,
      previous: null,
      results: [{
        enterprise_customer_user: {
          email: 'jeez.louise@example.com',
          joinedOrg: 'Sep 15, 2021',
          name: 'Jeez Louise',
        },
        enrollments: 11,
      }],
    };
    const mockEnterpriseMembers = jest.spyOn(LmsApiService, 'fetchEnterpriseCustomerMembers');
    mockEnterpriseMembers.mockResolvedValue({ data: mockData });

    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseMembersTableData({ enterpriseId: mockEnterpriseUUID }),
    );
    result.current.fetchEnterpriseMembersTableData({
      pageIndex: 0,
      pageSize: 10,
      filters: [],
      sortBy: [],
    });
    await waitForNextUpdate();
    expect(LmsApiService.fetchEnterpriseCustomerMembers).toHaveBeenCalledWith(mockEnterpriseUUID, { page: 1 });
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.enterpriseMembersTableData.results).toEqual(camelCaseObject(mockData.results));
  });
});
