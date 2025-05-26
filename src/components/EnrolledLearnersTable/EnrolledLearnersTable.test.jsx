import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import EnrolledLearnersTable from './index';
import useCourseUsers from './data/hooks/useCourseUsers';
import { mockEnrolledLearnersData, mockEmptyEnrolledLearnersData } from './data/tests/constants';

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);

jest.mock('./data/hooks/useCourseUsers', () => jest.fn());

const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
});

const EnrolledLearnersWrapper = props => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <Provider store={store}>
        <EnrolledLearnersTable {...props} />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

describe('EnrolledLearnersTable', () => {
  beforeEach(() => {
    useCourseUsers.mockReturnValue(mockEnrolledLearnersData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders table with correct columns', () => {
    const wrapper = mount(<EnrolledLearnersWrapper id="enrolled-learners" />);
    const table = wrapper.find('[role="table"]');

    expect(table.exists()).toBe(true);

    const columnHeaders = table.find('thead th').map(th => th.text());
    expect(columnHeaders).toEqual([
      'Email',
      'Account Created',
      'Total Course Enrollment Count',
    ]);
  });

  it('renders correct number of rows with data', () => {
    const wrapper = mount(<EnrolledLearnersWrapper id="enrolled-learners" />);
    const rows = wrapper.find('tbody tr');
    expect(rows.length).toBe(mockEnrolledLearnersData.data.results.length);
  });

  it('renders empty table correctly', () => {
    useCourseUsers.mockReturnValue(mockEmptyEnrolledLearnersData);
    const wrapper = mount(<EnrolledLearnersWrapper id="enrolled-learners" />);
    expect(wrapper.find('[role="table"]').exists()).toBe(true);
    expect(wrapper.find('tbody tr').length).toBe(0);
  });
});
