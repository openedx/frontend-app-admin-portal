import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react-hooks';
import LmsApiService from '../../../../data/services/LmsApiService';
import { useEnterpriseLearnerData } from './hooks';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('../../../../data/services/LmsApiService', () => ({
  fetchEnterpriseCustomerMembers: jest.fn(),
}));

const ENTERPRISE_UUID = 'test-enterprise-uuid';
const LEARNER_ID = 1;

const TEST_ENTERPRISE_USER = {
  results: [{
    enterprise_customer_user: {
      user_id: 53841887,
      email: 'ahightower@dragons.com',
      joined_org: 'Jun 30, 2023',
      name: 'Alicent Hightower',
    },
    enrollments: 0,
  },
  ],
};

describe('useFetchLearnerData', () => {
  it('should fetch enterprise learner data', async () => {
    const spy = jest.spyOn(LmsApiService, 'fetchEnterpriseCustomerMembers');
    LmsApiService.fetchEnterpriseCustomerMembers.mockResolvedValueOnce({ data: TEST_ENTERPRISE_USER });
    renderHook(() => useEnterpriseLearnerData(ENTERPRISE_UUID, LEARNER_ID));
    const options = { user_id: LEARNER_ID };
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(ENTERPRISE_UUID, options);
    });
  });
});
