import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import EnrollmentsTable from './index';

const mockStore = configureMockStore([thunk]);
const enterpriseId = 'test-enterprise';
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
  table: {
    enrollments: {
      data: {
        results: [],
        current_page: 1,
        num_pages: 1,
      },
      ordering: null,
      loading: false,
      error: null,
    },
  },
});

const EnrollmentsWrapper = props => (
  <BrowserRouter>
    <Provider store={store}>
      <IntlProvider locale="en">
        <EnrollmentsTable
          {...props}
        />
      </IntlProvider>
    </Provider>
  </BrowserRouter>
);

describe('EnrollmentsTable', () => {
  it('renders empty state correctly', () => {
    const tree = renderer
      .create((
        <EnrollmentsWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders regular zero state for no results', () => {
    render(<EnrollmentsWrapper />);
    expect(screen.getByText('There are no results.')).toBeInTheDocument();
  });
  it('renders a group-specific no results warning message when the filter is applied', () => {
    const groupUuid = 'test_uuid123';
    // eslint-disable-next-line no-global-assign
    window = Object.create(window);
    const params = `?group_uuid=${groupUuid}`;
    Object.defineProperty(window, 'location', {
      value: {
        search: params,
      },
      writable: true,
    });
    render(<EnrollmentsWrapper />);
    const emptyMessage = 'We are currently processing the latest updates. The data is refreshed twice a day. Thank you for your patience, and please check back soon.';
    expect(screen.getByText(emptyMessage)).toBeInTheDocument();
  });
  // TODO: This test is not snapshotting the full table properly
  // it('renders a full table correctly', () => {
  //   EnterpriseDataApiService.fetchCourseEnrollments = jest.fn(() =>
  //     Promise.resolve(mockEnrollmentFetchResponse));

  //   const tree = renderer
  //     .create((
  //       <EnrollmentsWrapper />
  //     ))
  //     .toJSON();
  //   expect(EnterpriseDataApiService.fetchCourseEnrollments).toHaveBeenCalled();
  //   expect(tree).toMatchSnapshot();
  // });
});
