import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import LearnerCreditAllocationTable from '../LearnerCreditAllocationTable';

const LearnerCreditAllocationTableWrapper = (props) => (
  <IntlProvider locale="en">
    <LearnerCreditAllocationTable {...props} />
  </IntlProvider>
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

    expect(screen.getByText('Open', { exact: false }));
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
});
