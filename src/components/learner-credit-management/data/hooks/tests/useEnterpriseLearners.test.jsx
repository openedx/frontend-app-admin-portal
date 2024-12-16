import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import LmsApiService from '../../../../../data/services/LmsApiService';
import { queryClient } from '../../../../test/testUtils';
import useEnterpriseLearners from '../useEnterpriseLearners';

jest.mock('../../../../../data/services/LmsApiService', () => ({
  fetchEnterpriseLearnerData: jest.fn(),
}));

jest.mock('@edx/frontend-platform/utils', () => ({
  camelCaseObject: jest.fn(),
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>{children}</QueryClientProvider>
);

describe('useEnterpriseLearners', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and return enterprise learners', async () => {
    const mockData = [
      {
        user: {
          email: 'test@2u.com',
        },
      },
    ];
    LmsApiService.fetchEnterpriseLearnerData.mockResolvedValue(mockData);
    camelCaseObject.mockResolvedValue(mockData);

    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseLearners({ enterpriseUUID: 'test-id' }),
      { wrapper },
    );
    await waitForNextUpdate();
    expect(LmsApiService.fetchEnterpriseLearnerData).toHaveBeenCalledWith({
      enterprise_customer: 'test-id',
    });
    expect(camelCaseObject).toHaveBeenCalledWith(mockData);
    expect(result.current.allEnterpriseLearners).toEqual(['test@2u.com']);
  });
});
