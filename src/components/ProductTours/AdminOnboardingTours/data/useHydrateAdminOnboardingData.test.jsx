import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

import LmsApiService from '../../../../data/services/LmsApiService';
import useHydrateAdminOnboardingData from './useHydrateAdminOnboardingData';
import { queryClient } from '../../../test/testUtils';

jest.mock('../../../../data/services/LmsApiService', () => ({
  fetchEnterpriseCustomerMember: jest.fn(),
  fetchEnterpriseGroupsByEnterprise: jest.fn(),
}));

const HAS_MEMBERS = {
  results: [{
    enterprise_customer_user: {
      user_id: 15,
      email: 'georgiapeach@pup.com',
      joined_org: 'Jun 30, 2023',
      name: 'Georgia Miller',
    },
    enrollments: 0,
  },
  ],
};

const HAS_GROUPS = {
  results: [{
    name: 'marky mark and the funky bunch',
    uuid: 'test-group-uuid',
    accepted_members_count: 5,
    group_type: 'flex',
    created: '2025-04-30T17:55:30.037243Z',
  },
  ],
};

const ENTERPRISE_UUID = 'test-enterprise-uuid';

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>{children}</QueryClientProvider>
);

describe('useHydrateAdminOnboarding', () => {
  it('hook should call the fetchEnterpriseCustomerMember and fetchEnterpriseGroupsByEnterprise methods', async () => {
    const membersSpy = jest.spyOn(LmsApiService, 'fetchEnterpriseCustomerMember');
    LmsApiService.fetchEnterpriseCustomerMember.mockResolvedValueOnce({ data: HAS_MEMBERS });
    const groupSpy = jest.spyOn(LmsApiService, 'fetchEnterpriseGroupsByEnterprise');
    LmsApiService.fetchEnterpriseGroupsByEnterprise.mockResolvedValueOnce({ data: HAS_GROUPS });
    renderHook(
      () => useHydrateAdminOnboardingData({ ENTERPRISE_UUID }),
      { wrapper },
    );
    await waitFor(() => {
      expect(membersSpy).toHaveBeenCalledWith({ ENTERPRISE_UUID });
      expect(groupSpy).toHaveBeenCalledWith({ ENTERPRISE_UUID });
    });
  });
});
