import { renderHook } from '@testing-library/react-hooks';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import LmsApiService from '../../../../../data/services/LmsApiService';
import { useEnterpriseGroupLearnersTableData } from '../../../../PeopleManagement/data/hooks';

describe('useEnterpriseGroupLearnersTableData', () => {
  it('should fetch and return enterprise learners', async () => {
    const mockGroupUUID = 'test-uuid';
    const mockData = {
      count: 1,
      current_page: 1,
      next: null,
      num_pages: 1,
      previous: null,
      results: [{
        activated_at: '2024-11-06T21:01:32.953901Z',
        enterprise_customer_user_id: 1,
        enterprise_group_membership_uuid: 'test-uuid',
        member_details: {
          user_email: 'test@2u.com',
          user_name: 'Test 2u',
        },
        recent_action: 'Accepted: November 06, 2024',
        status: 'accepted',
        enrollments: 1,
      }],
    };
    const mockEnterpriseGroupLearners = jest.spyOn(LmsApiService, 'fetchEnterpriseGroupLearners');
    mockEnterpriseGroupLearners.mockResolvedValue({ data: mockData });

    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseGroupLearnersTableData({ groupUuid: mockGroupUUID }),
    );
    result.current.fetchEnterpriseGroupLearnersTableData({
      pageIndex: 0,
      pageSize: 10,
      filters: [],
      sortBy: [],
    });
    await waitForNextUpdate();
    expect(LmsApiService.fetchEnterpriseGroupLearners).toHaveBeenCalledWith(mockGroupUUID, { page: 1 });
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.enterpriseGroupLearnersTableData.results).toEqual(camelCaseObject(mockData.results));
  });
});
