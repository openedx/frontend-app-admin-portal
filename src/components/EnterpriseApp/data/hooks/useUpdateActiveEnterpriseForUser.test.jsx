import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import { useUpdateActiveEnterpriseForUser } from './index';
import LmsApiService from '../../../../data/services/LmsApiService';
import { queryClient } from '../../../test/testUtils';

jest.mock('../../../../data/services/LmsApiService');
jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));

describe('useUpdateActiveEnterpriseForUser', () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  const mockEnterpriseId = 'enterprise-uuid';
  const mockUser = { username: 'joe_shmoe' };
  const connectedEnterprise = 'someID';
  beforeEach(() => {
    LmsApiService.fetchEnterpriseLearnerData.mockResolvedValue(
      [{ enterpriseCustomer: { uuid: mockEnterpriseId }, active: true }],
    );
  });

  afterEach(() => jest.clearAllMocks());

  it("should update user's active enterprise if it differs from the current enterprise", async () => {
    LmsApiService.fetchEnterpriseLearnerData.mockResolvedValue(
      [
        { enterpriseCustomer: { uuid: mockEnterpriseId }, active: false },
        { enterpriseCustomer: { uuid: 'some-other-uuid' }, active: true },
      ],
    );
    const { result, waitForNextUpdate } = renderHook(
      () => useUpdateActiveEnterpriseForUser({
        enterpriseId: mockEnterpriseId,
        user: mockUser,
      }),
      { wrapper },
    );
    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(LmsApiService.updateUserActiveEnterprise).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('should do nothing if active enterprise is the same as current enterprise', async () => {
    // Pass the value of the enterprise ID returned by ``getActiveLinkedEnterprise`` to the hook
    const { waitForNextUpdate } = renderHook(
      () => useUpdateActiveEnterpriseForUser({
        enterpriseId: connectedEnterprise,
        user: mockUser,
      }),
      { wrapper },
    );
    await waitForNextUpdate();
    expect(LmsApiService.updateUserActiveEnterprise).toHaveBeenCalledTimes(0);
  });

  it('should handle useMutation errors', async () => {
    LmsApiService.fetchEnterpriseLearnerData.mockResolvedValue(
      [
        { enterpriseCustomer: { uuid: mockEnterpriseId }, active: false },
        { enterpriseCustomer: { uuid: 'some-other-uuid' }, active: true },
      ],
    );
    LmsApiService.updateUserActiveEnterprise.mockRejectedValueOnce(Error('uh oh'));
    const { result, waitForNextUpdate } = renderHook(
      () => useUpdateActiveEnterpriseForUser({
        enterpriseId: mockEnterpriseId,
        user: mockUser,
      }),
      { wrapper },
    );
    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(LmsApiService.updateUserActiveEnterprise).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
    expect(logError).toHaveBeenCalledTimes(1);
  });
  it('should handle useQuery errors', async () => {
    LmsApiService.fetchEnterpriseLearnerData.mockRejectedValueOnce(Error('uh oh'));
    const { result, waitForNextUpdate } = renderHook(
      () => useUpdateActiveEnterpriseForUser({
        enterpriseId: mockEnterpriseId,
        user: mockUser,
      }),
      { wrapper },
    );
    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(LmsApiService.fetchEnterpriseLearnerData).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
    expect(logError).toHaveBeenCalledWith("Failed to fetch user's active enterprise");
  });
});
