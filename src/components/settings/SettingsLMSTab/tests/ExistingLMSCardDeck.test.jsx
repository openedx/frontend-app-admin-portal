import React from 'react';
import {
  act, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import ExistingLMSCardDeck from '../ExistingLMSCardDeck';
import LmsApiService from '../../../../data/services/LmsApiService';
import { features } from '../../../../config';

jest.mock('../../../../data/services/LmsApiService');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'https://www.test.com/',
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

const renderExistingLMSCardDeck = (data) => render(
  <IntlProvider locale="en">
    <ExistingLMSCardDeck
      configData={data}
      editExistingConfig={mockEditExistingConfigFn}
      onClick={mockOnClick}
      enterpriseCustomerUuid={enterpriseCustomerUuid}
    />
  </IntlProvider>,
);

describe('<ExistingLMSCardDeck />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getAuthenticatedUser.mockReturnValue({
      administrator: true,
    });
  });

  it('renders active config card', () => {
    renderExistingLMSCardDeck(configData);
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
    renderExistingLMSCardDeck(inactiveConfigData);
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
    renderExistingLMSCardDeck(inactiveConfigData);

    userEvent.click(screen.getByTestId('existing-lms-config-card-dropdown-1'));
    userEvent.click(screen.getByTestId('dropdown-delete-item'));

    await waitFor(() => {
      screen.getByTestId('confirm-delete-config');
    });

    const deleteButton = screen.getByTestId('confirm-delete-config');
    act(() => {
      userEvent.click(deleteButton);
    });

    expect(deleteConfigCall).toHaveBeenCalledTimes(1);
  });

  it('can cancel deleting inactive config card', async () => {
    const deleteConfigCall = jest.spyOn(LmsApiService, 'deleteBlackboardConfig');
    features.REPORTING_CONFIGURATIONS = true;
    renderExistingLMSCardDeck(inactiveConfigData);

    userEvent.click(screen.getByTestId('existing-lms-config-card-dropdown-1'));
    userEvent.click(screen.getByTestId('dropdown-delete-item'));

    const cancelTestId = 'cancel-delete-config';
    await waitFor(() => {
      screen.getByTestId(cancelTestId);
    });

    const cancelButton = screen.getByTestId(cancelTestId);
    act(() => {
      userEvent.click(cancelButton);
    });

    expect(screen.queryByTestId(cancelTestId)).toBeNull();
    expect(deleteConfigCall).toHaveBeenCalledTimes(0);
  });

  it('renders incomplete config card', async () => {
    renderExistingLMSCardDeck(incompleteConfigData);
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
    renderExistingLMSCardDeck(configData.concat(incompleteConfigData));
    expect(screen.getByText('barfoo')).toBeInTheDocument();
    expect(screen.getByText('foobar')).toBeInTheDocument();
  });

  it('renders delete card action', () => {
    renderExistingLMSCardDeck(incompleteConfigData);
    expect(screen.getByTestId(`existing-lms-config-card-dropdown-${incompleteConfigData[0].id}`)).toBeInTheDocument();
    userEvent.click(screen.getByTestId(`existing-lms-config-card-dropdown-${incompleteConfigData[0].id}`));

    expect(screen.getByTestId('dropdown-delete-item')).toBeInTheDocument();
    userEvent.click(screen.getByTestId('dropdown-delete-item'));
    expect(LmsApiService.deleteBlackboardConfig).toHaveBeenCalledWith(incompleteConfigData[0].id);
  });

  it('renders disable card action', () => {
    renderExistingLMSCardDeck(configData);
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
    renderExistingLMSCardDeck(disabledConfigData);
    userEvent.click(screen.getByText('Enable'));
    const expectedConfigOptions = {
      active: true,
      enterprise_customer: enterpriseCustomerUuid,
    };
    expect(LmsApiService.updateBlackboardConfig).toHaveBeenCalledWith(expectedConfigOptions, configData[0].id);
  });

  it('renders correct single field incomplete config hover text', async () => {
    renderExistingLMSCardDeck(singleInvalidFieldConfigData);
    await waitFor(() => expect(screen.getByText('Incomplete')).toBeInTheDocument());
    await waitFor(() => userEvent.hover(screen.getByText('Incomplete')));
    expect(screen.getByText('Next Steps')).toBeInTheDocument();
    expect(screen.getByText('1 field')).toBeInTheDocument();
  });

  it('renders correct refresh token needed hover text', async () => {
    renderExistingLMSCardDeck(needsRefreshTokenConfigData);
    await waitFor(() => expect(screen.getByText('Incomplete')).toBeInTheDocument());
    await waitFor(() => userEvent.hover(screen.getByText('Incomplete')));
    expect(screen.getByText('Next Steps')).toBeInTheDocument();
    expect(screen.getByText('authorize your LMS')).toBeInTheDocument();
  });

  it('only shows sync logs to admins', () => {
    getAuthenticatedUser.mockReturnValue({
      administrator: false,
    });
    renderExistingLMSCardDeck(configData);
    expect(screen.queryByText('View sync history')).not.toBeInTheDocument();
  });

  it('viewing sync history redirects to detail page', () => {
    getAuthenticatedUser.mockReturnValue({
      administrator: true,
    });
    renderExistingLMSCardDeck(configData);
    const link = 'https://www.test.com/BLACKBOARD/1';
    expect(screen.getByText('View sync history')).toHaveAttribute('href', link);
  });
});
