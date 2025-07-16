import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

import LmsApiService from '../../../../data/services/LmsApiService';
import useHasEnterpriseMembers from './useHasEnterpriseMembers';
import { queryClient } from '../../../test/testUtils';

jest.mock('../../../../data/services/LmsApiService', () => ({
  fetchEnterpriseCustomerMember: jest.fn(),
}));

const ENTERPRISE_UUID = 'test-enterprise-uuid';

const HAS_MEMBERS_RESULT = {
  count: 1,
  results: [{
    enterprise_customer_user: {
      user_id: 53841887,
      email: 'cberzatto@thebear.com',
      joined_org: 'Jun 30, 2023',
      name: 'Carmen Berzatto',
    },
    enrollments: 0,
  },
  ],
};

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>{children}</QueryClientProvider>
);

describe('useHasEnterpriseMembers', () => {
  it('hook should call the fetchEnterpriseCustomerMember method', async () => {
    const spy = jest.spyOn(LmsApiService, 'fetchEnterpriseCustomerMember');
    LmsApiService.fetchEnterpriseCustomerMember.mockResolvedValueOnce({ data: HAS_MEMBERS_RESULT });
    renderHook(
      () => useHasEnterpriseMembers(ENTERPRISE_UUID),
      { wrapper },
    );
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(ENTERPRISE_UUID);
    });
  });
});
