import React from 'react';
import {
  act, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import ExistingLMSCardDeck from '../../ExistingLMSCardDeck';
import LmsApiService from '../../../../../data/services/LmsApiService';

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

const syncData = {
  data: {
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
        friendly_status_message: null,
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

    expect(screen.getByText('Course')).toBeInTheDocument();
    expect(screen.getByText('Course key')).toBeInTheDocument();
    expect(screen.getByText('Sync status')).toBeInTheDocument();
    expect(screen.getByText('Sync attempt time')).toBeInTheDocument();

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
  it('populates with sync data', async () => {
    const mockFetchCmits = jest.spyOn(LmsApiService, 'fetchContentMetadataItemTransmission');
    mockFetchCmits.mockResolvedValue(syncData);

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
    expect(screen.getByText('Pending')).toBeInTheDocument();

    expect(screen.getByText('Demo3')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
  test('csv download works', async () => {
    const mockFetchCmits = jest.spyOn(LmsApiService, 'fetchContentMetadataItemTransmission');
    mockFetchCmits.mockResolvedValue(syncData);

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
    expect(screen.queryByText('Download history')).toBeInTheDocument();

    // Click the button
    await act(async () => {
      const input = screen.getByText('Download history');
      userEvent.click(input);
    });
    // Expect to have updated the state to complete
    expect(screen.queryByText('Downloaded')).toBeInTheDocument();
  });
});
