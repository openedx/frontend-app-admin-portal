import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react-hooks';
import LmsApiService from '../../../../data/services/LmsApiService';
import { useEnterpriseLearnerData } from './hooks';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('../../../../data/services/LmsApiService', () => ({
  fetchEnterpriseLearnerData: jest.fn(),
}));

const ENTERPRISE_UUID = 'test-enterprise-uuid';
const LEARNER_ID = 1;

const TEST_ENTERPRISE_USER = [{
  user: {
    first_name: 'Alicent',
    last_name: 'Hightower',
    email: 'ahightower@atp.com',
    date_joined: '2024-09-15T12:53:43Z',
  },
}];

describe('useFetchLearnerData', () => {
  it('should fetch enterprise learner data', async () => {
    const spy = jest.spyOn(LmsApiService, 'fetchEnterpriseLearnerData');
    LmsApiService.fetchEnterpriseLearnerData.mockResolvedValueOnce({ data: TEST_ENTERPRISE_USER });
    renderHook(() => useEnterpriseLearnerData(ENTERPRISE_UUID, LEARNER_ID));
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(ENTERPRISE_UUID, LEARNER_ID, undefined);
    });
  });
});
