import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import LearnerCreditAllocationTable from '../LearnerCreditAllocationTable';

const mockStore = configureMockStore();
const store = mockStore({
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise-slug',
  },
});

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => ({ ENTERPRISE_LEARNER_PORTAL_URL: 'https://enterprise.edx.org' }),
}));

const LearnerCreditAllocationTableWrapper = (props) => (
  <Provider store={store}>
    <IntlProvider locale="en">
      <LearnerCreditAllocationTable {...props} />
    </IntlProvider>
  </Provider>
);

describe('<LearnerCreditAllocationTable />', () => {
  it('renders with table data', () => {
    const props = {
      enterpriseUUID: 'test-enterprise-id',
      isLoading: false,
      budgetType: 'OCM',
      tableData: {
        results: [{
          userEmail: 'test@example.com',
          courseTitle: 'course-title',
          courseListPrice: 100,
          enrollmentDate: '2-2-23',
          courseProductLine: 'OCM',
        }],
        itemCount: 1,
        pageCount: 1,
      },
      fetchTableData: jest.fn(),
    };
    props.fetchTableData.mockReturnValue(props.tableData);

    render(<LearnerCreditAllocationTableWrapper {...props} />);

    expect(screen.getByText(props.tableData.results[0].userEmail.toString(), {
      exact: false,
    }));
    expect(screen.getByText(props.tableData.results[0].courseTitle.toString(), {
      exact: false,
    }));
    expect(screen.getByText(props.tableData.results[0].courseListPrice.toString(), {
      exact: false,
    }));
    expect(screen.getByText('February', { exact: false }));
  });
  it('renders with empty table data', () => {
    const props = {
      enterpriseUUID: 'test-enterprise-id',
      isLoading: false,
      budgetType: 'OCM',
      tableData: {
        results: [],
        itemCount: 0,
        pageCount: 0,
      },
      fetchTableData: jest.fn(),
    };
    props.fetchTableData.mockReturnValue(props.tableData);

    render(<LearnerCreditAllocationTableWrapper {...props} />);

    expect(screen.getByText('No results found', { exact: false }));
  });

  it('constructs the correct URL for the course', () => {
    const props = {
      enterpriseUUID: 'test-enterprise-id',
      isLoading: false,
      budgetType: 'OCM',
      tableData: {
        results: [{
          userEmail: 'test@example.com',
          courseTitle: 'course-title',
          courseKey: 'course-v1:edX=CTL.SC101x.3T2019',
          courseListPrice: 100,
          enrollmentDate: '2-2-23',
          courseProductLine: 'OCM',
        }],
        itemCount: 1,
        pageCount: 1,
      },
      fetchTableData: jest.fn(),
    };
    props.fetchTableData.mockReturnValue(props.tableData);

    render(<LearnerCreditAllocationTableWrapper {...props} />);

    const expectedLink = 'https://enterprise.edx.org/test-enterprise-slug/course/course-v1:edX=CTL.SC101x.3T2019';
    const courseLinkElement = screen.getByText('course-title');

    expect(courseLinkElement.getAttribute('href')).toBe(expectedLink);
  });
});
