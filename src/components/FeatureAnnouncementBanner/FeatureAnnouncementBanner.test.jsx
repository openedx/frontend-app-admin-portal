import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import FeatureAnnouncementBanner from './index';
import LmsApiService from '../../data/services/LmsApiService';

jest.mock('../../data/services/LmsApiService');

const mockEnterpriseCustomer = {
  enterprise_notification_banner: { title: 'This is a test title.', text: 'This is a test notification.', id: 1 },
};

const mockEnterpriseCustomerWithMarkdown = {
  enterprise_notification_banner: {
    title: 'This is a test title.',
    text: 'Message with a [link](http://edx.org)',
    id: 1,
  },
};

const FeatureAnnouncementBannerWrapper = (props) => (
  <IntlProvider locale="en">
    <FeatureAnnouncementBanner {...props} />
  </IntlProvider>
);

describe('<FeatureAnnouncementBanner />', () => {
  it('renders correctly', async () => {
    LmsApiService.fetchEnterpriseBySlug.mockImplementation(() => Promise.resolve({
      data: mockEnterpriseCustomer,
    }));

    render(<FeatureAnnouncementBannerWrapper enterpriseSlug="test-enterprise" />);

    await screen.findByText('This is a test title.');
    await screen.findByText('This is a test notification.');
  });

  it('renders markdown correctly', async () => {
    LmsApiService.fetchEnterpriseBySlug.mockImplementation(() => Promise.resolve({
      data: mockEnterpriseCustomerWithMarkdown,
    }));

    render(<FeatureAnnouncementBannerWrapper enterpriseSlug="test-enterprise" />);

    await screen.findByText('This is a test title.');
    const selector = (content, element) => content.startsWith('Message') && element.tagName.toLowerCase() === 'p';
    const marked = screen.getByText(selector);
    expect(marked.innerHTML).toEqual('Message with a <a href="http://edx.org" target="_blank">link</a>');
  });

  it('does not render if data is not available', async () => {
    LmsApiService.fetchEnterpriseBySlug.mockImplementation(() => Promise.resolve({
      data: {},
    }));

    render(<FeatureAnnouncementBannerWrapper enterpriseSlug="test-enterprise" />);

    expect(screen.queryByText('This is a test title.'));
    expect(screen.queryByText('This is a test notification.'));
  });

  it('calls markBannerNotificationAsRead on alert dismissal.', async () => {
    LmsApiService.fetchEnterpriseBySlug.mockImplementation(() => Promise.resolve({
      data: mockEnterpriseCustomer,
    }));
    LmsApiService.markBannerNotificationAsRead.mockImplementation(() => Promise.resolve({}));

    render(<FeatureAnnouncementBannerWrapper enterpriseSlug="test-enterprise" />);

    await screen.findByText('This is a test title.');
    await screen.findByText('This is a test notification.');
    const closeBtn = await screen.findByText('Dismiss');
    fireEvent(
      closeBtn,
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    expect(LmsApiService.markBannerNotificationAsRead.mock.calls).toHaveLength(1);
  });
});
