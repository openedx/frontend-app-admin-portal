import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  screen,
  render,
  cleanup,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Router } from 'react-router-dom';

import BrowseAndRequestTour from '../BrowseAndRequestTour';

import {
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  TOUR_TARGETS,
} from '../constants';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';
import { SETTINGS_TABS_VALUES } from '../../settings/data/constants';
import { features } from '../../../config';

features.FEATURE_BROWSE_AND_REQUEST = true;

const mockStore = configureMockStore([thunk]);

const ENTERPRISE_SLUG = 'sluggy';
const store = mockStore({
  portalConfiguration: {
    enterpriseSlug: ENTERPRISE_SLUG,
    enableBrowseAndRequest: true,
  },
});

const useHistoryPush = jest.fn();

const SUBSCRIPTION_PAGE_LOCATION = `/${ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.subscriptionManagement}`;
const SETTINGS_PAGE_LOCATION = `/${ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.settings}/${SETTINGS_TABS_VALUES.access}`;

const historyMock = (pathname = SUBSCRIPTION_PAGE_LOCATION) => ({
  push: useHistoryPush,
  location: { pathname },
  listen: jest.fn(),
});

// eslint-disable-next-line react/prop-types
const tourWithContext = ({ pathname } = {}) => (
  <Router history={historyMock(pathname)}>
    <Provider store={store}>
      <>
        <BrowseAndRequestTour />
        <p id={TOUR_TARGETS.SETTINGS_SIDEBAR}>Settings</p>
      </>
    </Provider>
  </Router>
);

describe('<BrowseAndRequestTour/>', () => {
  afterEach(() => { cleanup(); });

  it('is shown when feature is enabled and no cookie found ', () => {
    render(tourWithContext());
    expect(screen.queryByText('New Feature')).toBeTruthy();
  });

  it(`redirects to settings page at ${SETTINGS_PAGE_LOCATION}`, async () => {
    render(tourWithContext());
    const button = screen.getByText('Continue To Settings');
    await act(async () => { userEvent.click(button); });
    expect(useHistoryPush).toHaveBeenCalledWith({
      pathname: SETTINGS_PAGE_LOCATION,
    });
    expect(screen.queryByText('New Feature')).toBeFalsy();
  });

  it('is shown when feature is enabled and no cookie found ', () => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${BROWSE_AND_REQUEST_TOUR_COOKIE_NAME}=true`,
    });
    render(tourWithContext());
    expect(screen.queryByText('New Feature')).toBeFalsy();
  });

  it('not shown in settings page', () => {
    render(tourWithContext({ pathname: SETTINGS_PAGE_LOCATION }));
    expect(screen.queryByText('New Feature')).toBeFalsy();
  });
});
