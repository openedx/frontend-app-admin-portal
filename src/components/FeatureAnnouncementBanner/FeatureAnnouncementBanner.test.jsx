import React from 'react';
import {
  render, fireEvent, screen, act,
} from '@testing-library/react';

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

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

describe('<FeatureAnnouncementBanner />', () => {
  it('renders correctly', async () => {
    const flushPromises = () => new Promise(setImmediate);

    LmsApiService.fetchEnterpriseBySlug.mockImplementation(() => Promise.resolve({
      data: mockEnterpriseCustomer,
    }));

    await act(async () => {
      render(<FeatureAnnouncementBanner enterpriseSlug="test-enterprise" />, container);
      await flushPromises();
    });

    await screen.findByText('This is a test title.');
    await screen.findByText('This is a test notification.');
  });

  it('renders markdown correctly', async () => {
    const flushPromises = () => new Promise(setImmediate);

    LmsApiService.fetchEnterpriseBySlug.mockImplementation(() => Promise.resolve({
      data: mockEnterpriseCustomerWithMarkdown,
    }));

    await act(async () => {
      render(<FeatureAnnouncementBanner enterpriseSlug="test-enterprise" />, container);
      await flushPromises();
    });

    await screen.findByText('This is a test title.');
    const selector = (content, element) => content.startsWith('Message') && element.tagName.toLowerCase() === 'p';
    const marked = screen.getByText(selector);
    expect(marked.innerHTML).toEqual('Message with a <a href="http://edx.org" target="_blank">link</a>');
  });

  it('does not render if data is not available', async () => {
    const flushPromises = () => new Promise(setImmediate);

    LmsApiService.fetchEnterpriseBySlug.mockImplementation(() => Promise.resolve({
      data: {},
    }));

    await act(async () => {
      render(<FeatureAnnouncementBanner enterpriseSlug="test-enterprise" />, container);
      await flushPromises();
    });

    expect(container.textContent).not.toContain('This is a test title.');
    expect(container.textContent).not.toContain('This is a test notification.');
  });

  it('calls markBannerNotificationAsRead on alert dismissal.', async () => {
    const flushPromises = () => new Promise(setImmediate);

    LmsApiService.fetchEnterpriseBySlug.mockImplementation(() => Promise.resolve({
      data: mockEnterpriseCustomer,
    }));
    LmsApiService.markBannerNotificationAsRead.mockImplementation(() => Promise.resolve({}));

    await act(async () => {
      render(<FeatureAnnouncementBanner enterpriseSlug="test-enterprise" />, container);
      await flushPromises();
    });
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
