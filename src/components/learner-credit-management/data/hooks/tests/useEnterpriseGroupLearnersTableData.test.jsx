import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import LmsApiService from '../../../../../data/services/LmsApiService';
import { queryClient } from '../../../../test/testUtils';
import useEnterpriseGroupLearnersTableData from '../useEnterpriseGroupLearnersTableData';

jest.mock('../../../../../data/services/LmsApiService', () => ({
  fetchEnterpriseGroupLearners: jest.fn(),
}));

jest.mock('@edx/frontend-platform/utils', () => ({
  camelCaseObject: jest.fn(),
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>{children}</QueryClientProvider>
);

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
      }],
    };
    LmsApiService.fetchEnterpriseGroupLearners.mockResolvedValue(mockData);
    camelCaseObject.mockResolvedValue(mockData);

    const { waitForNextUpdate } = renderHook(
      () => useEnterpriseGroupLearnersTableData(mockGroupUUID),
      { wrapper },
    );
    await waitForNextUpdate();
    expect(LmsApiService.fetchEnterpriseGroupLearners).toHaveBeenCalledWith(mockGroupUUID);
  });
});
