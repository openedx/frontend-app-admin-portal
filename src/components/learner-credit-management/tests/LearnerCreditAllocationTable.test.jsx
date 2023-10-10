import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';

import LearnerCreditAllocationTable from '../LearnerCreditAllocationTable';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => ({ ENTERPRISE_LEARNER_PORTAL_URL: 'https://enterprise.edx.org' }),
}));

const mockStore = configureMockStore();
const defaultStore = mockStore({
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
    enterpriseSlug: 'test-enterprise-slug',
    enableLearnerPortal: true,
  },
});

const LearnerCreditAllocationTableWrapper = ({
  store = defaultStore,
  ...props
}) => (
  <IntlProvider locale="en">
    <Provider store={store}>
      <LearnerCreditAllocationTable {...props} />
    </Provider>
  </IntlProvider>
);

describe('<LearnerCreditAllocationTable />', () => {
  it('renders with table data', () => {
    const props = {
      isLoading: false,
      tableData: {
        results: [{
          uuid: 'test-uuid',
          userEmail: 'test@example.com',
          courseTitle: 'course-title',
          courseListPrice: 100,
          enrollmentDate: '2-2-23',
          courseProductLine: 'OCM',
          courseKey: 'edX+DemoX',
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
    expect(screen.getByText('Feb', { exact: false }));
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
      isLoading: false,
      tableData: {
        results: [{
          uuid: 'test-uuid',
          userEmail: 'test@example.com',
          courseTitle: 'course-title',
          courseKey: 'edX+CTL.SC101x',
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
    const expectedLink = 'https://enterprise.edx.org/test-enterprise-slug/course/edX+CTL.SC101x';
    const courseLinkElement = screen.getByText('course-title');
    expect(courseLinkElement.getAttribute('href')).toBe(expectedLink);
  });

  it('does not render the course link if the learner portal is disabled', () => {
    const store = mockStore({
      portalConfiguration: {
        enterpriseId: 'test-enterprise-id',
        enterpriseSlug: 'test-enterprise-slug',
        enableLearnerPortal: false,
      },
    });
    const props = {
      isLoading: false,
      tableData: {
        results: [{
          uuid: 'test-uuid',
          userEmail: 'test@example.com',
          courseTitle: 'course-title',
          courseKey: 'edX+CTL.SC101x',
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
    render(<LearnerCreditAllocationTableWrapper store={store} {...props} />);
    const courseTitleElement = screen.queryByText('course-title');
    expect(courseTitleElement.closest('a')).toBeNull();
  });
});
