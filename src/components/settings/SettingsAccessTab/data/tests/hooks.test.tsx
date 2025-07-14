import { renderHook, waitFor } from '@testing-library/react';
import { logError } from '@edx/frontend-platform/logging';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { useLearnerCreditBrowseAndRequest } from '../hooks';
import EnterpriseAccessApiService from '../../../../../data/services/EnterpriseAccessApiService';
import { queryClient } from '../../../../test/testUtils';

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));

jest.mock('../../../../../data/services/EnterpriseAccessApiService');

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

describe('useLearnerCreditBrowseAndRequest', () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      <IntlProvider locale="en">
        {children}
      </IntlProvider>
    </QueryClientProvider>
  );

  const listSubsidyAccessPoliciesSpy = jest.spyOn(EnterpriseAccessApiService, 'listSubsidyAccessPolicies');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch policies and detect BNR-enabled policy', async () => {
    const mockPoliciesResponse = [
      {
        uuid: 'policy-1',
        display_name: 'Policy 1',
        bnr_enabled: false,
      },
      {
        uuid: 'policy-2',
        display_name: 'Policy 2',
        bnr_enabled: true,
      },
    ];

    listSubsidyAccessPoliciesSpy.mockResolvedValue({
      data: {
        results: mockPoliciesResponse,
      },
    });

    const { result } = renderHook(
      () => useLearnerCreditBrowseAndRequest(TEST_ENTERPRISE_UUID),
      { wrapper },
    );

    expect(result.current.isLoadingPolicies).toBe(true);
    expect(result.current.hasBnrEnabledPolicy).toBe(false);

    await waitFor(() => {
      expect(listSubsidyAccessPoliciesSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    });

    await waitFor(() => {
      expect(result.current.isLoadingPolicies).toBe(false);
      expect(result.current.hasBnrEnabledPolicy).toBe(true);
    });
  });

  it('should successfully fetch policies but find no BNR-enabled policies', async () => {
    const mockPoliciesResponse = [
      {
        uuid: 'policy-1',
        display_name: 'Policy 1',
        bnr_enabled: false,
      },
      {
        uuid: 'policy-2',
        display_name: 'Policy 2',
        bnr_enabled: false,
      },
    ];

    listSubsidyAccessPoliciesSpy.mockResolvedValue({
      data: {
        results: mockPoliciesResponse,
      },
    });

    const { result } = renderHook(
      () => useLearnerCreditBrowseAndRequest(TEST_ENTERPRISE_UUID),
      { wrapper },
    );

    expect(result.current.isLoadingPolicies).toBe(true);
    expect(result.current.hasBnrEnabledPolicy).toBe(false);

    await waitFor(() => {
      expect(listSubsidyAccessPoliciesSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    });

    await waitFor(() => {
      expect(result.current.isLoadingPolicies).toBe(false);
      expect(result.current.hasBnrEnabledPolicy).toBe(false);
    });
  });

  it('should handle empty policies response', async () => {
    listSubsidyAccessPoliciesSpy.mockResolvedValue({
      data: {
        results: [],
      },
    });

    const { result } = renderHook(
      () => useLearnerCreditBrowseAndRequest(TEST_ENTERPRISE_UUID),
      { wrapper },
    );

    await waitFor(() => {
      expect(listSubsidyAccessPoliciesSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    });

    await waitFor(() => {
      expect(result.current.isLoadingPolicies).toBe(false);
      expect(result.current.hasBnrEnabledPolicy).toBe(false);
    });
  });

  it('should handle API error and log the error', async () => {
    const mockError = new Error('API request failed');
    listSubsidyAccessPoliciesSpy.mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useLearnerCreditBrowseAndRequest(TEST_ENTERPRISE_UUID),
      { wrapper },
    );

    expect(result.current.isLoadingPolicies).toBe(true);
    expect(result.current.hasBnrEnabledPolicy).toBe(false);

    await waitFor(() => {
      expect(listSubsidyAccessPoliciesSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    });

    await waitFor(() => {
      expect(logError).toHaveBeenCalledWith(mockError);
    });

    await waitFor(() => {
      expect(result.current.isLoadingPolicies).toBe(false);
      expect(result.current.hasBnrEnabledPolicy).toBe(false);
    });
  });

  it('should not fetch policies when enterpriseUuid is not provided', () => {
    const { result } = renderHook(
      () => useLearnerCreditBrowseAndRequest(null),
      { wrapper },
    );

    expect(result.current.isLoadingPolicies).toBe(true);
    expect(result.current.hasBnrEnabledPolicy).toBe(false);
    expect(listSubsidyAccessPoliciesSpy).not.toHaveBeenCalled();
  });

  it('should refetch policies when enterpriseUuid changes', async () => {
    const mockPoliciesResponse = [
      {
        uuid: 'policy-1',
        display_name: 'Policy 1',
        bnr_enabled: true,
      },
    ];

    listSubsidyAccessPoliciesSpy.mockResolvedValue({
      data: {
        results: mockPoliciesResponse,
      },
    });

    const { result, rerender } = renderHook(
      ({ enterpriseUuid }) => useLearnerCreditBrowseAndRequest(enterpriseUuid),
      {
        wrapper,
        initialProps: { enterpriseUuid: TEST_ENTERPRISE_UUID },
      },
    );

    await waitFor(() => {
      expect(listSubsidyAccessPoliciesSpy).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    });

    await waitFor(() => {
      expect(result.current.isLoadingPolicies).toBe(false);
    });

    jest.clearAllMocks();
    const NEW_ENTERPRISE_UUID = 'new-enterprise-uuid';

    rerender({ enterpriseUuid: NEW_ENTERPRISE_UUID });

    await waitFor(() => {
      expect(listSubsidyAccessPoliciesSpy).toHaveBeenCalledWith(NEW_ENTERPRISE_UUID);
    });

    expect(listSubsidyAccessPoliciesSpy).toHaveBeenCalledTimes(1);
  });
});
