import React from 'react';
import {
  screen,
  render,
  fireEvent,
} from '@testing-library/react';

import TableTextFilter from '../TableTextFilter';

describe('<TableTextFilter />', () => {
  it('renders correctly', () => {
    const props = {
      column: {
        filterValue: 'Demo Course',
        setFilter: jest.fn(),
        Header: 'Course title',
      },
    };
    render(<TableTextFilter {...props} />);
    expect(screen.getByTestId('text-filter').value).toEqual(props.column.filterValue);
    expect(screen.getByLabelText('Search by course title'));
  });

  it('calls setFilter on input change', () => {
    const mockSetFilter = jest.fn();
    const props = {
      column: {
        filterValue: 'Demo Course',
        setFilter: mockSetFilter,
        Header: 'Course title',
      },
    };
    render(<TableTextFilter {...props} />);
    let newInputValue = 'Example Course';
    fireEvent.change(screen.getByTestId('text-filter'), {
      target: { value: newInputValue },
    });
    expect(mockSetFilter).toHaveBeenCalledWith(newInputValue);
    newInputValue = '';
    fireEvent.change(screen.getByTestId('text-filter'), {
      target: { value: newInputValue },
    });
    expect(mockSetFilter).toHaveBeenCalledWith(undefined);
  });

  it('without filterValue, fallback to empty string input value', () => {
    const props = {
      column: {
        filterValue: null,
        setFilter: jest.fn(),
        Header: 'Course title',
      },
    };
    render(<TableTextFilter {...props} />);
    expect(screen.getByTestId('text-filter').value).toEqual('');
  });
});
