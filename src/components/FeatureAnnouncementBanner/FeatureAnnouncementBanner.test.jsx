import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from '@testing-library/react';

import FeatureAnnouncementBanner from './index';
import LmsApiService from '../../data/services/LmsApiService';

jest.mock('../../data/services/LmsApiService');

const mockEnterpriseCustomer = {
  enterprise_notification_banner: { text: 'This is a test notification.', id: 1 },
};

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
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

    expect(container.textContent).toContain('This is a test notification.');
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
    expect(container.textContent).toContain('This is a test notification.');

    const closeButton = document.getElementsByClassName('btn btn-tertiary btn-sm')[0];
    closeButton.click();
    expect(LmsApiService.markBannerNotificationAsRead.mock.calls).toHaveLength(1);
  });
});
