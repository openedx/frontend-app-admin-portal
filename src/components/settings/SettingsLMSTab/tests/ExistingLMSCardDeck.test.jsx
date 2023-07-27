import React from 'react';
import {
  act, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import ExistingLMSCardDeck from '../ExistingLMSCardDeck';
import LmsApiService from '../../../../data/services/LmsApiService';
import { features } from '../../../../config';

jest.mock('../../../../data/services/LmsApiService');

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useRouteMatch: () => ({
    url: 'https://www.test.com/',
  }),
}));

const enterpriseCustomerUuid = 'test-enterprise-id';
const mockEditExistingConfigFn = jest.fn();
const mockOnClick = jest.fn();
const configData = [
  {
    channelCode: 'BLACKBOARD',
    id: 1,
    isValid: [{ missing: [] }, { incorrect: [] }],
    active: true,
    displayName: 'foobar',
    lastSyncAttemptedAt: '2022-11-22T20:59:56Z',
    lastContentSyncAttemptedAt: '2022-11-22T20:59:56Z',
    lastLearnerSyncAttemptedAt: null,
    lastSyncErroredAt: null,
    lastContentSyncErroredAt: null,
    lastLearnerSyncErroredAt: null,
  },
];

const inactiveConfigData = [
  {
    channelCode: 'BLACKBOARD',
    id: 1,
    isValid: [{ missing: [] }, { incorrect: [] }],
    active: false,
    displayName: 'foobar',
    lastSyncAttemptedAt: '2022-11-22T20:59:56Z',
    lastContentSyncAttemptedAt: null,
    lastLearnerSyncAttemptedAt: '2022-11-22T20:59:56Z',
    lastSyncErroredAt: '2022-11-22T20:59:56Z',
    lastContentSyncErroredAt: null,
    lastLearnerSyncErroredAt: '2022-11-22T20:59:56Z',
  },
];

const disabledConfigData = [
  {
    channelCode: 'BLACKBOARD',
    id: 1,
    isValid: [{ missing: [] }, { incorrect: [] }],
    active: false,
    displayName: 'foobar',
    lastSyncAttemptedAt: null,
    lastContentSyncAttemptedAt: null,
    lastLearnerSyncAttemptedAt: null,
    lastSyncErroredAt: null,
    lastContentSyncErroredAt: null,
    lastLearnerSyncErroredAt: null,
  },
];

const incompleteConfigData = [
  {
    channelCode: 'BLACKBOARD',
    id: 2,
    isValid: [{ missing: ['client_id', 'refresh_token'] }, { incorrect: ['blackboard_base_url'] }],
    active: false,
    displayName: 'barfoo',
    lastSyncAttemptedAt: null,
    lastContentSyncAttemptedAt: null,
    lastLearnerSyncAttemptedAt: null,
    lastSyncErroredAt: null,
    lastContentSyncErroredAt: null,
    lastLearnerSyncErroredAt: null,
  },
];

const singleInvalidFieldConfigData = [
  {
    channelCode: 'BLACKBOARD',
    id: 2,
    isValid: [{ missing: ['client_id', 'refresh_token'] }, { incorrect: [] }],
    active: false,
    displayName: 'barfoo',
    lastSyncAttemptedAt: null,
    lastContentSyncAttemptedAt: null,
    lastLearnerSyncAttemptedAt: null,
    lastSyncErroredAt: null,
    lastContentSyncErroredAt: null,
    lastLearnerSyncErroredAt: null,
  },
];

const needsRefreshTokenConfigData = [
  {
    channelCode: 'BLACKBOARD',
    id: 2,
    isValid: [{ missing: ['refresh_token'] }, { incorrect: [] }],
    active: false,
    displayName: 'barfoo',
    lastSyncAttemptedAt: null,
    lastContentSyncAttemptedAt: null,
    lastLearnerSyncAttemptedAt: null,
    lastSyncErroredAt: null,
    lastContentSyncErroredAt: null,
    lastLearnerSyncErroredAt: null,
  },
];

describe('<ExistingLMSCardDeck />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getAuthenticatedUser.mockReturnValue({
      administrator: true,
    });
    features.FEATURE_INTEGRATION_REPORTING = true;
  });

  it('renders active config card', () => {
    render(
      <ExistingLMSCardDeck
        configData={configData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('foobar')).toBeInTheDocument();
    expect(screen.getByText('View sync history'));
    expect(screen.getByText('Last sync:'));

    userEvent.click(screen.getByTestId('existing-lms-config-card-dropdown-1'));
    expect(screen.getByText('Disable'));
    expect(screen.getByText('Configure'));
  });
  it('renders inactive config card', () => {
    features.REPORTING_CONFIGURATIONS = true;
    render(
      <ExistingLMSCardDeck
        configData={inactiveConfigData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getByText('foobar')).toBeInTheDocument();
    expect(screen.getByText('Enable'));
    expect(screen.getByText('Recent sync error:'));

    userEvent.click(screen.getByTestId('existing-lms-config-card-dropdown-1'));
    expect(screen.getByText('Configure'));
    expect(screen.getByText('View sync history'));
  });
  it('can delete inactive config card', async () => {
    const deleteConfigCall = jest.spyOn(LmsApiService, 'deleteBlackboardConfig');
    features.REPORTING_CONFIGURATIONS = true;
    render(
      <ExistingLMSCardDeck
        configData={inactiveConfigData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    // Click kebab menu
    userEvent.click(screen.getByTestId('existing-lms-config-card-dropdown-1'));
    // Click Delete
    userEvent.click(screen.getByTestId('dropdown-delete-item'));
    // Verify modal with delete button appears
    await waitFor(() => {
      screen.getByTestId('confirm-delete-config');
    });
    // Click confirm
    const deleteButton = screen.getByTestId('confirm-delete-config');
    act(() => {
      userEvent.click(deleteButton);
    });
    // Verify delete call
    expect(deleteConfigCall).toHaveBeenCalledTimes(1);
  });
  it('can cancel deleting inactive config card', async () => {
    const deleteConfigCall = jest.spyOn(LmsApiService, 'deleteBlackboardConfig');
    features.REPORTING_CONFIGURATIONS = true;
    render(
      <ExistingLMSCardDeck
        configData={inactiveConfigData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    // Click kebab menu
    userEvent.click(screen.getByTestId('existing-lms-config-card-dropdown-1'));
    // Click Delete
    userEvent.click(screen.getByTestId('dropdown-delete-item'));
    // Verify modal with cancel delete button appears
    const cancelTestId = 'cancel-delete-config';
    await waitFor(() => {
      screen.getByTestId(cancelTestId);
    });
    // Click cancel
    const cancelButton = screen.getByTestId(cancelTestId);
    act(() => {
      userEvent.click(cancelButton);
    });
    // Verify modal closed
    expect(screen.queryByTestId(cancelTestId)).toBeNull();
    // Verify delete was not called
    expect(deleteConfigCall).toHaveBeenCalledTimes(0);
  });
  it('renders incomplete config card', async () => {
    render(
      <ExistingLMSCardDeck
        configData={incompleteConfigData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    expect(screen.getByText('Incomplete')).toBeInTheDocument();
    expect(screen.getByText('barfoo')).toBeInTheDocument();
    expect(screen.getByText('Configure'));
    expect(screen.getByText('Sync not yet attempted'));

    await waitFor(() => userEvent.hover(screen.getByText('Incomplete')));
    expect(screen.getByText('Next Steps')).toBeInTheDocument();
    expect(screen.getByText('2 fields')).toBeInTheDocument();

    userEvent.click(screen.getByTestId('existing-lms-config-card-dropdown-2'));
    expect(screen.getByText('Delete'));
  });
  it('renders multiple config cards', () => {
    render(
      <ExistingLMSCardDeck
        configData={configData.concat(incompleteConfigData)}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    expect(screen.getByText('barfoo')).toBeInTheDocument();
    expect(screen.getByText('foobar')).toBeInTheDocument();
  });
  it('renders delete card action', () => {
    render(
      <ExistingLMSCardDeck
        configData={incompleteConfigData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    expect(screen.getByTestId(`existing-lms-config-card-dropdown-${incompleteConfigData[0].id}`)).toBeInTheDocument();
    userEvent.click(screen.getByTestId(`existing-lms-config-card-dropdown-${incompleteConfigData[0].id}`));

    expect(screen.getByTestId('dropdown-delete-item')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('dropdown-delete-item'));
    expect(LmsApiService.deleteBlackboardConfig).toHaveBeenCalledWith(incompleteConfigData[0].id);
  });
  it('renders disable card action', () => {
    render(
      <ExistingLMSCardDeck
        configData={configData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    expect(screen.getByTestId(`existing-lms-config-card-dropdown-${configData[0].id}`)).toBeInTheDocument();
    userEvent.click(screen.getByTestId(`existing-lms-config-card-dropdown-${configData[0].id}`));

    expect(screen.getByTestId('dropdown-disable-item')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('dropdown-disable-item'));
    const expectedConfigOptions = {
      active: false,
      enterprise_customer: enterpriseCustomerUuid,
    };
    expect(LmsApiService.updateBlackboardConfig).toHaveBeenCalledWith(expectedConfigOptions, configData[0].id);
  });
  it('renders enable card action', () => {
    render(
      <ExistingLMSCardDeck
        configData={disabledConfigData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );

    userEvent.click(screen.getByText('Enable'));
    const expectedConfigOptions = {
      active: true,
      enterprise_customer: enterpriseCustomerUuid,
    };
    expect(LmsApiService.updateBlackboardConfig).toHaveBeenCalledWith(expectedConfigOptions, configData[0].id);
  });
  it('renders correct single field incomplete config hover text', async () => {
    render(
      <ExistingLMSCardDeck
        configData={singleInvalidFieldConfigData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    await waitFor(() => expect(screen.getByText('Incomplete')).toBeInTheDocument());
    await waitFor(() => userEvent.hover(screen.getByText('Incomplete')));
    expect(screen.getByText('Next Steps')).toBeInTheDocument();
    expect(screen.getByText('1 field')).toBeInTheDocument();
  });
  it('renders correct refresh token needed hover text', async () => {
    render(
      <ExistingLMSCardDeck
        configData={needsRefreshTokenConfigData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    await waitFor(() => expect(screen.getByText('Incomplete')).toBeInTheDocument());
    await waitFor(() => userEvent.hover(screen.getByText('Incomplete')));
    expect(screen.getByText('Next Steps'))
      .toBeInTheDocument();
    expect(screen.getByText('authorize your LMS'))
      .toBeInTheDocument();
  });
  it('only shows sync logs to admins', () => {
    getAuthenticatedUser.mockReturnValue({
      administrator: false,
    });
    render(
      <ExistingLMSCardDeck
        configData={configData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    expect(screen.queryByText('View sync history')).not.toBeInTheDocument();
  });
  it('only shows sync logs only when feature is not gated', () => {
    features.FEATURE_INTEGRATION_REPORTING = false;
    render(
      <ExistingLMSCardDeck
        configData={configData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    expect(screen.queryByText('View sync history')).not.toBeInTheDocument();
  });
  it('viewing sync history redirects to detail page', () => {
    getAuthenticatedUser.mockReturnValue({
      administrator: true,
    });
    render(
      <ExistingLMSCardDeck
        configData={configData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    const link = 'https://www.test.com/BLACKBOARD/1';
    expect(screen.getByText('View sync history')).toHaveAttribute('href', link);
  });
});
