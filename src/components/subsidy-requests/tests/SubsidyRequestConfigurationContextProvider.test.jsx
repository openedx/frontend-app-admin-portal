import { screen, render } from '@testing-library/react';
import SubsidyRequestsContextProvider from '../SubsidyRequestsContextProvider';
import * as hooks from '../data/hooks';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

jest.mock('../data/hooks');

describe('SubsidyRequestsContextProvider', () => {
  const basicProps = {
    enableBrowseAndRequest: true,
    enterpriseUUID: TEST_ENTERPRISE_UUID,
    children: 'children',
  };

  it('should not call useSubsidyRequestConfiguration if enableBrowseAndRequest = false', () => {
    render(
      <SubsidyRequestsContextProvider {...basicProps} enableBrowseAndRequest={false} />,
    );

    expect(hooks.useSubsidyRequestConfiguration).not.toHaveBeenCalled();
    expect(screen.getByText('children'));
  });

  it('should call useSubsidyRequestConfiguration and render children', () => {
    hooks.useSubsidyRequestConfiguration.mockReturnValue({
      subsidyRequestConfiguration: undefined,
      isLoading: false,
    });

    render(
      <SubsidyRequestsContextProvider {...basicProps} />,
    );

    expect(hooks.useSubsidyRequestConfiguration).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    expect(screen.getByText('children'));
  });

  it('should render <EnterpriseAppSkeleton /> if loading configuration', () => {
    hooks.useSubsidyRequestConfiguration.mockReturnValue({
      subsidyRequestConfiguration: undefined,
      isLoading: true,
    });

    render(
      <SubsidyRequestsContextProvider {...basicProps} />,
    );

    expect(screen.getByText('Loading...'));
  });
});
