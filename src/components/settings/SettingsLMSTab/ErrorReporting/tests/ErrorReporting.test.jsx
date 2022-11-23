import React from 'react';
import {
  act, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import ExistingLMSCardDeck from '../../ExistingLMSCardDeck';
import LmsApiService from '../../../../../data/services/LmsApiService';
import { features } from '../../../../../config';

const enterpriseCustomerUuid = 'test-enterprise-id';
const mockEditExistingConfigFn = jest.fn();
const mockOnClick = jest.fn();

// file-saver mocks
jest.mock('file-saver', () => ({ saveAs: jest.fn() }));
// eslint-disable-next-line func-names
global.Blob = function (content, options) { return ({ content, options }); };

const configData = [
  {
    channelCode: 'BLACKBOARD',
    id: 1,
    isValid: [{ missing: [] }, { incorrect: [] }],
    active: true,
    displayName: 'foobar',
  },
];

const contentSyncData = {
  data: {
    count: 12,
    pages_count: 2,
    results: [
      {
        content_title: 'Demo1',
        content_id: 'DemoX',
        sync_status: 'okay',
        sync_last_attempted_at: '2022-09-21T19:27:18.127225Z',
        friendly_status_message: null,
      },
      {
        content_title: 'Demo2',
        content_id: 'DemoX-2',
        sync_status: 'pending',
        sync_last_attempted_at: '2022-09-27T19:27:18.127225Z',
        friendly_status_message: null,
      },
      {
        content_title: 'Demo3',
        content_id: 'DemoX-3',
        sync_status: 'error',
        sync_last_attempted_at: '2022-09-26T19:27:18.127225Z',
        friendly_status_message: 'The request was unauthorized, check your credentials.',
      },
      {
        content_title: 'Demo4',
        content_id: 'DemoX-4',
        sync_status: 'pending',
        sync_last_attempted_at: '2022-09-26T19:27:18.127225Z',
        friendly_status_message: 'The request was unauthorized, check your credentials.',
      },
      {
        content_title: 'Demo5',
        content_id: 'DemoX-5',
        sync_status: 'pending',
        sync_last_attempted_at: '2022-09-26T19:27:18.127225Z',
        friendly_status_message: 'The request was unauthorized, check your credentials.',
      },
      {
        content_title: 'Demo6',
        content_id: 'DemoX-6',
        sync_status: 'pending',
        sync_last_attempted_at: '2022-09-26T19:27:18.127225Z',
        friendly_status_message: 'The request was unauthorized, check your credentials.',
      },
      {
        content_title: 'Demo7',
        content_id: 'DemoX-7',
        sync_status: 'pending',
        sync_last_attempted_at: '2022-09-26T19:27:18.127225Z',
        friendly_status_message: 'The request was unauthorized, check your credentials.',
      },
      {
        content_title: 'Demo8',
        content_id: 'DemoX-8',
        sync_status: 'pending',
        sync_last_attempted_at: '2022-09-26T19:27:18.127225Z',
        friendly_status_message: 'The request was unauthorized, check your credentials.',
      },
      {
        content_title: 'Demo9',
        content_id: 'DemoX-9',
        sync_status: 'pending',
        sync_last_attempted_at: '2022-09-26T19:27:18.127225Z',
        friendly_status_message: 'The request was unauthorized, check your credentials.',
      },
      {
        content_title: 'Demo10',
        content_id: 'DemoX-10',
        sync_status: 'pending',
        sync_last_attempted_at: '2022-09-26T19:27:18.127225Z',
        friendly_status_message: 'The request was unauthorized, check your credentials.',
      },
    ],
  },
  status: 200,
  statusText: 'OK',
};

const learnerSyncData = {
  data: {
    count: 2,
    pages_count: 1,
    results: [
      {
        user_email: 'totallynormalemail@example.com',
        content_title: 'its LEARNING!',
        progress_status: 'In progress',
        sync_status: 'pending',
        sync_last_attempted_at: '2022-10-25T17:52:57.277596Z',
        friendly_status_message: null,
      },
      {
        user_email: 'jlantern@example.com',
        content_title: 'spooooky',
        progress_status: 'Passed',
        sync_status: 'error',
        sync_last_attempted_at: '2022-10-31T03:00:00.277596Z',
        friendly_status_message: 'The server is temporarily unavailable.',
      },
    ],
  },
  status: 200,
  statusText: 'OK',
};

describe('<ExistingLMSCardDeck />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getAuthenticatedUser.mockReturnValue({
      administrator: true,
    });
    features.FEATURE_INTEGRATION_REPORTING = true;
  });
  it('opens error reporting modal', () => {
    render(
      <IntlProvider locale="en">
        <ExistingLMSCardDeck
          configData={configData}
          editExistingConfig={mockEditExistingConfigFn}
          onClick={mockOnClick}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>,
    );
    userEvent.click(screen.queryByText('View sync history'));
    expect(screen.getByText('foobar Sync History')).toBeInTheDocument();
    expect(screen.getAllByText('Course')).toHaveLength(2);
    expect(screen.getByText('Course key')).toBeInTheDocument();
    expect(screen.getAllByText('Sync status')).toHaveLength(2);
    expect(screen.getAllByText('Sync attempt time')).toHaveLength(2);

    expect(screen.getAllByText('No results found')).toHaveLength(2);
  });
  it('populates with content sync data', async () => {
    const mockFetchCmits = jest.spyOn(LmsApiService, 'fetchContentMetadataItemTransmission');
    mockFetchCmits.mockResolvedValue(contentSyncData);

    render(
      <IntlProvider locale="en">
        <ExistingLMSCardDeck
          configData={configData}
          editExistingConfig={mockEditExistingConfigFn}
          onClick={mockOnClick}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>,
    );
    userEvent.click(screen.queryByText('View sync history'));

    await waitFor(() => expect(screen.getByText('Demo1')).toBeInTheDocument());

    expect(screen.getByText('Demo1')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();

    expect(screen.getByText('Demo2')).toBeInTheDocument();
    expect(screen.getAllByText('Pending')[0]).toBeInTheDocument();

    expect(screen.getByText('Demo3')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();

    await waitFor(() => userEvent.click(screen.queryByText('Read')));
    expect(screen.getByText('The request was unauthorized, check your credentials.')).toBeInTheDocument();
  });
  it('paginates over data', async () => {
    const mockFetchCmits = jest.spyOn(LmsApiService, 'fetchContentMetadataItemTransmission');
    mockFetchCmits.mockResolvedValue(contentSyncData);

    render(
      <IntlProvider locale="en">
        <ExistingLMSCardDeck
          configData={configData}
          editExistingConfig={mockEditExistingConfigFn}
          onClick={mockOnClick}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>,
    );
    userEvent.click(screen.queryByText('View sync history'));

    await waitFor(() => expect(screen.getByText('Demo1')).toBeInTheDocument());
    expect(screen.getAllByLabelText('Next, Page 2')[0]).not.toBeDisabled();
    act(() => {
      fireEvent.click(screen.getAllByLabelText('Next, Page 2')[0]);
    });

    await waitFor(() => expect(mockFetchCmits).toBeCalledWith('test-enterprise-id', 'BLACKBOARD', 1, 1, {}));
  });
  it('adds filters to the backend url query params', async () => {
    const mockFetchCmits = jest.spyOn(LmsApiService, 'fetchContentMetadataItemTransmission');
    mockFetchCmits.mockResolvedValue(contentSyncData);

    render(
      <IntlProvider locale="en">
        <ExistingLMSCardDeck
          configData={configData}
          editExistingConfig={mockEditExistingConfigFn}
          onClick={mockOnClick}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>,
    );
    userEvent.click(screen.queryByText('View sync history'));

    await waitFor(() => expect(screen.getByText('Demo1')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Search course key'), {
      target: { value: 'ayylmao' },
    });

    await waitFor(() => expect(mockFetchCmits).toBeCalledWith('test-enterprise-id', 'BLACKBOARD', 1, 0, { content_id: 'ayylmao' }));
  });
  test('csv download works', async () => {
    const mockFetchCmits = jest.spyOn(LmsApiService, 'fetchContentMetadataItemTransmission');
    mockFetchCmits.mockResolvedValue(contentSyncData);

    render(
      <IntlProvider locale="en">
        <ExistingLMSCardDeck
          configData={configData}
          editExistingConfig={mockEditExistingConfigFn}
          onClick={mockOnClick}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>,
    );
    userEvent.click(screen.queryByText('View sync history'));
    await waitFor(() => expect(screen.getByText('Demo1')).toBeInTheDocument());

    // Expect to be in the default state
    expect(screen.getAllByText('Download history')).toHaveLength(2);

    // Click the button
    await act(async () => {
      const input = screen.getByTestId('content-download');
      userEvent.click(input);
    });
    // Expect to have updated the state to complete
    expect(screen.queryByText('Downloaded')).toBeInTheDocument();
  });
  it('populates with learner sync data', async () => {
    const mockFetchLmits = jest.spyOn(LmsApiService, 'fetchLearnerMetadataItemTransmission');
    mockFetchLmits.mockResolvedValue(learnerSyncData);

    render(
      <IntlProvider locale="en">
        <ExistingLMSCardDeck
          configData={configData}
          editExistingConfig={mockEditExistingConfigFn}
          onClick={mockOnClick}
          enterpriseCustomerUuid={enterpriseCustomerUuid}
        />
      </IntlProvider>,
    );
    await waitFor(() => userEvent.click(screen.queryByText('View sync history')));
    await waitFor(() => userEvent.click(screen.queryByText('Learner Activity')));

    expect(screen.getByText('Learner email')).toBeInTheDocument();
    expect(screen.getAllByText('Course')).toHaveLength(2);
    expect(screen.getByText('Completion status')).toBeInTheDocument();
    expect(screen.getAllByText('Sync status')).toHaveLength(2);
    expect(screen.getAllByText('Sync attempt time')).toHaveLength(2);

    await waitFor(() => expect(screen.getByText('its LEARNING!')).toBeInTheDocument());
    expect(screen.getByText('In progress')).toBeInTheDocument();

    expect(screen.getByText('spooooky')).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    await waitFor(() => userEvent.click(screen.queryByText('Read')));
    expect(screen.getByText('The server is temporarily unavailable.')).toBeInTheDocument();
  });
});
