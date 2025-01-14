import React from 'react';
import { render, screen } from '@testing-library/react';
import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import TableComponent from './index';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));
jest.mock('../../utils', () => ({
  updateUrl: jest.fn(),
}));

const mockPaginateTable = jest.fn();
const mockSortTable = jest.fn();
const mockClearTable = jest.fn();

const mockDefaultProps = {
  id: 'test-table',
  columns: [],
  formatData: jest.fn(data => data),
  enterpriseId: 'enterprise-id',
  paginateTable: mockPaginateTable,
  sortTable: mockSortTable,
  clearTable: mockClearTable,
  location: { pathname: '/test', search: '' },
  navigate: jest.fn(),
};

const TableComponentWrapper = props => (
  <MemoryRouter>
    <TableComponent {...props} />
  </MemoryRouter>
);

describe('TableComponent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the loading message when loading and no data is available', () => {
    const defaultProps = {
      ...mockDefaultProps,
      loading: true,
      data: undefined,
    };

    render(<TableComponentWrapper {...defaultProps} />);

    expect(screen.getByText('Loading...'));
  });

  it('renders the error message when there is an error', () => {
    const errorProps = { ...mockDefaultProps, error: new Error('Test Error') };
    render(<TableComponentWrapper {...errorProps} />);
    expect(screen.getByText('Unable to load data'));
    expect(screen.getByText('Try refreshing your screen Test Error'));
  });

  it('renders the empty data message when no data is available', () => {
    render(<TableComponentWrapper {...mockDefaultProps} data={[]} />);
    expect(screen.getByText('There are no results.'));
  });

  it('renders the table content when data is available', () => {
    const dataProps = {
      ...mockDefaultProps,
      data: [
        {
          user_email: 'testuser1@gmail.com',
          enrollment_id: 6066,
          enrollment_date: '2024-12-30',
          course_key: 'TEFLx+GRA.30.1x',
          courserun_key: 'course-v1:TEFLx+GRA.30.1x+3T2024',
          course_title: '30-hour Grammar and Language Awareness',
          passed_date: '2025-01-04',
          current_grade: 0.98,
        },
        {
          user_email: 'testuser2@gmail.com',
          enrollment_id: 5055,
          enrollment_date: '2024-07-13',
          course_key: 'FEFRx+GIA.30.1x',
          courserun_key: 'course-v1:FEFRx+GIA.30.1x+3T2024',
          course_title: 'Project Management Professional',
          passed_date: '2025-03-01',
          current_grade: 0.88,
        },
      ],
      columns: [
        { key: 'user_email', label: 'Email', columnSortable: true },
        { key: 'course_title', label: 'Course Title', columnSortable: false },
        { key: 'current_grade', label: 'Current Grade', columnSortable: true },
      ],
      currentPage: 1,
      pageCount: 1,
      ordering: 'current_grade',
      loading: false,
      error: undefined,
    };

    render(<TableComponentWrapper {...dataProps} />);

    expect(screen.getByText('Email'));
    expect(screen.getByText('Course Title'));
    expect(screen.getByText('Current Grade'));

    expect(screen.getByText('testuser1@gmail.com'));
    expect(screen.getByText('30-hour Grammar and Language Awareness'));
    expect(screen.getByText('0.98'));

    expect(screen.getByText('testuser2@gmail.com'));
    expect(screen.getByText('Project Management Professional'));
    expect(screen.getByText('0.88'));
  });

  it('calls paginateTable on mount', () => {
    render(<TableComponentWrapper {...mockDefaultProps} />);

    expect(mockPaginateTable).toHaveBeenCalled();
  });

  it('calls clearTable on unmount', () => {
    const { unmount } = render(<TableComponentWrapper {...mockDefaultProps} />);
    unmount();
    expect(mockClearTable).toHaveBeenCalled();
  });

  it('Does not call sortTable when ordering is null or undefined', () => {
    const prevOrdering = null;

    let ordering;
    const wrapper = shallow(
      <TableComponentWrapper
        ordering={ordering}
        prevOrdering={prevOrdering}
        sortTable={mockSortTable}
      />,
    );
    expect(mockSortTable).not.toHaveBeenCalled();

    ordering = null;
    wrapper.setProps({ ordering });
    expect(mockSortTable).not.toHaveBeenCalled();
  });

  it('calls sortTable when ordering changes', () => {
    const defaultProps = {
      ...mockDefaultProps,
      location: { search: '?ordering=current_grade&page=1' },
      sortTable: mockSortTable,
      paginateTable: mockPaginateTable,
    };

    const { rerender } = render(<TableComponentWrapper {...defaultProps} />);

    // Simulate a change in the query params, causing componentDidUpdate to be triggered
    const newLocation = { search: '?ordering=-current_grade&page=2' };

    rerender(<TableComponentWrapper {...defaultProps} location={newLocation} />);

    expect(mockSortTable).toHaveBeenCalledWith('-current_grade');
  });

  it('does not call sortTable when ordering is null or undefined', () => {
    const defaultProps = {
      ...mockDefaultProps,
      location: { search: '?ordering=null&page=1' }, // Set ordering to null in query params
      sortTable: mockSortTable,
      paginateTable: mockPaginateTable,
    };

    const { rerender } = render(<TableComponentWrapper {...defaultProps} />);

    // Simulate a change where ordering is undefined in the query params
    const newLocation = { search: '?ordering=&page=2' }; // ordering is undefined in query params

    rerender(<TableComponentWrapper {...defaultProps} location={newLocation} />);

    expect(mockSortTable).not.toHaveBeenCalled();
  });
});
