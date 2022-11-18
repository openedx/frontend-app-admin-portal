import React from 'react';
import { Provider } from 'react-redux'; import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  screen,
  render,
  cleanup,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Router } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import NewFeatureAlertBrowseAndRequest, { generateBrowseAndRequestAlertCookieName } from './index';
import {
  REDIRECT_SETTINGS_BUTTON_TEXT,
  BROWSE_AND_REQUEST_ALERT_TEXT,
} from './data/constants';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { SETTINGS_TABS_VALUES } from '../settings/data/constants';

const mockStore = configureMockStore([thunk]);

const ENTERPRISE_SLUG = 'sluggy';
const ENTERPRISE_ID = 'test-enterprise-id';
const store = mockStore({
  portalConfiguration: {
    enterpriseId: ENTERPRISE_ID,
    enterpriseSlug: ENTERPRISE_SLUG,
  },
});

const useHistoryPush = jest.fn();

const historyMock = { push: useHistoryPush, location: {}, listen: jest.fn() };

const SETTINGS_PAGE_LOCATION = `/${ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.settings}/${SETTINGS_TABS_VALUES.access}`;

function NewFeatureAlertBrowseAndRequestWrapper() {
  return (
    <Router history={historyMock}>
      <Provider store={store}>
        <IntlProvider locale="en">
          <NewFeatureAlertBrowseAndRequest />
        </IntlProvider>
      </Provider>
    </Router>
  );
}

describe('<NewFeatureAlertBrowseAndRequest/>', () => {
  afterEach(() => { cleanup(); });

  it('if cookie is found, alert is hidden', () => {
    const cookieName = generateBrowseAndRequestAlertCookieName(ENTERPRISE_ID);
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${cookieName}=true`,
    });
    render(<NewFeatureAlertBrowseAndRequestWrapper />);
    expect(screen.queryByText(BROWSE_AND_REQUEST_ALERT_TEXT)).toBeFalsy();
  });

  it('show alert, if no cookie is found', () => {
    const wrongCookieName = generateBrowseAndRequestAlertCookieName('foo');
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `${wrongCookieName}=true`,
    });
    render(<NewFeatureAlertBrowseAndRequestWrapper />);
    expect(screen.queryByText(BROWSE_AND_REQUEST_ALERT_TEXT)).toBeTruthy();
  });

  it(`redirects to settings page at ${SETTINGS_PAGE_LOCATION}`, async () => {
    render(<NewFeatureAlertBrowseAndRequestWrapper />);
    const button = screen.getByText(REDIRECT_SETTINGS_BUTTON_TEXT);
    await act(async () => { userEvent.click(button); });
    expect(useHistoryPush).toHaveBeenCalledWith({
      pathname: SETTINGS_PAGE_LOCATION,
    });
  });
});
