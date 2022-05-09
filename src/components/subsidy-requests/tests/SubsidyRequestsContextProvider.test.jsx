import { screen, render } from '@testing-library/react';
import SubsidyRequestsContextProvider from '../SubsidyRequestsContextProvider';
import * as hooks from '../data/hooks';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

jest.mock('../data/hooks');

describe('SubsidyRequestsContextProvider', () => {
  const basicProps = {
    enterpriseUUID: TEST_ENTERPRISE_UUID,
    children: 'children',
  };

  it('should call useSubsidyRequestConfiguration and useSubsidyRequestsOverview, then render children', () => {
    hooks.useSubsidyRequestConfiguration.mockReturnValue({
      subsidyRequestConfiguration: undefined,
      isLoading: false,
    });
    const noop = () => {};
    hooks.useSubsidyRequestsOverview.mockReturnValue({
      isLoading: false,
      subsidyRequestsCounts: { subscriptionLicenses: undefined, couponCodes: undefined },
      refreshsubsidyRequestsCounts: noop,
      decrementLicenseRequestCount: noop,
      decrementCouponCodeRequestCount: noop,
    });

    render(
      <SubsidyRequestsContextProvider {...basicProps} />,
    );

    expect(hooks.useSubsidyRequestConfiguration).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    expect(hooks.useSubsidyRequestsOverview).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    expect(screen.getByText('children'));
  });

  it('should render <EnterpriseAppSkeleton /> if loading configuration', () => {
    hooks.useSubsidyRequestConfiguration.mockReturnValue({
      subsidyRequestConfiguration: undefined,
      isLoading: true,
    });
    hooks.useSubsidyRequestsOverview.mockReturnValue({
      subsidyRequestsCounts: undefined,
      isLoading: false,
    });

    render(
      <SubsidyRequestsContextProvider {...basicProps} />,
    );

    expect(screen.getByText('Loading...'));
  });

  it('should render <EnterpriseAppSkeleton /> if loading outstanding requests counts', () => {
    hooks.useSubsidyRequestConfiguration.mockReturnValue({
      subsidyRequestConfiguration: undefined,
      isLoading: false,
    });
    hooks.useSubsidyRequestsOverview.mockReturnValue({
      subsidyRequestsCounts: undefined,
      isLoading: true,
    });

    render(
      <SubsidyRequestsContextProvider {...basicProps} />,
    );

    expect(screen.getByText('Loading...'));
  });
});
