import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ModuleActivityReport from './ModuleActivityReport';
import { TEST_ENTERPRISE_CUSTOMER_SLUG } from '../../subscriptions/tests/TestUtilities';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

const DEFAULT_PROPS = {
  enterpriseId: TEST_ENTERPRISE_CUSTOMER_SLUG,
};
const getMockData = ({ count }) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      module_performance_unique_id: i,
      username: `Email ${i}`,
      course_name: `Course ${i}`,
      module_name: `Module ${i}`,
      module_grade: `Module Grade ${i}`,
      percentage_completed_activities: `${(i % 100)}%`,
      hours_online: `${i} Hours Online`,
      log_viewed: `${i} Log Views`,
    });
  }
  return data;
};

jest.mock('../data/hooks', () => (
  jest.fn(() => ({
    isLoading: false,
    paginationData: {
      itemCount: 500,
      pageCount: 5,
      data: getMockData(500),
    },
  }))
));

const ModuleActivityReportWrapper = props => (
  <IntlProvider locale="en">
    <ModuleActivityReport {...props} />
  </IntlProvider>
);

describe('ModuleActivityReport', () => {
  it('renders the module activity report correctly when table is empty.', async () => {
    render(<ModuleActivityReportWrapper {...DEFAULT_PROPS} />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Course Title')).toBeInTheDocument();
    expect(screen.getByText('Module')).toBeInTheDocument();
    expect(screen.getByText('Grade')).toBeInTheDocument();
    expect(screen.getByText('% Activities Complete')).toBeInTheDocument();
    expect(screen.getByText('Learning Hours')).toBeInTheDocument();
    expect(screen.getByText('Log Views')).toBeInTheDocument();
  });
});
