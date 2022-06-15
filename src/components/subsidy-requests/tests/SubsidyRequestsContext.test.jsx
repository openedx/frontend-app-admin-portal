import { renderHook } from '@testing-library/react-hooks/dom';
import { useSubsidyRequestsContext } from '../SubsidyRequestsContext';
import * as hooks from '../data/hooks';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

jest.mock('../data/hooks');

describe('useSubsidyRequestsContext', () => {
  it('should call useSubsidyRequestConfiguration and useSubsidyRequestsOverview', () => {
    const mockSubsidyRequestConfiguration = {
      uuid: 'uuid',
    };

    const mockSubsidyRequestsCounts = { subscriptionLicenses: 5, couponCodes: undefined };

    hooks.useSubsidyRequestConfiguration.mockReturnValue({
      subsidyRequestConfiguration: mockSubsidyRequestConfiguration,
      isLoading: false,
    });
    const noop = () => {};

    hooks.useSubsidyRequestsOverview.mockReturnValue({
      isLoading: false,
      subsidyRequestsCounts: mockSubsidyRequestsCounts,
      refreshsubsidyRequestsCounts: noop,
      decrementLicenseRequestCount: noop,
      decrementCouponCodeRequestCount: noop,
    });

    const { result } = renderHook(() => useSubsidyRequestsContext(TEST_ENTERPRISE_UUID));
    expect(hooks.useSubsidyRequestConfiguration).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    expect(hooks.useSubsidyRequestsOverview).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);

    const { isLoading, subsidyRequestConfiguration, subsidyRequestsCounts } = result.current;

    expect(isLoading).toEqual(false);
    expect(subsidyRequestConfiguration).toEqual(mockSubsidyRequestConfiguration);
    expect(subsidyRequestsCounts).toEqual(mockSubsidyRequestsCounts);
  });

  it('should return isLoading = true if configuration or overview is loading', () => {
    hooks.useSubsidyRequestConfiguration.mockReturnValue({
      isLoading: true,
    });

    hooks.useSubsidyRequestsOverview.mockReturnValue({
      isLoading: false,
    });

    const { result } = renderHook(() => useSubsidyRequestsContext(TEST_ENTERPRISE_UUID));
    expect(hooks.useSubsidyRequestConfiguration).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    expect(hooks.useSubsidyRequestsOverview).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);

    const { isLoading } = result.current;

    expect(isLoading).toEqual(true);
  });
});
