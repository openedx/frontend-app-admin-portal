/* eslint-disable react/prop-types */
import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { DataTableContext } from '@edx/paragon';
import userEvent from '@testing-library/user-event';
import BaseSelectionStatus from './BaseSelectionStatus';
import { clearSelectionAction, setSelectedRowsAction } from '../data/actions';

const selectedRows = [{ id: 'foo' }, { id: 'bar' }];
const defaultProps = {
  className: 'classy',
  selectedRows: [],
  dispatch: jest.fn(),
};

const defaultDataTableInfo = {
  itemCount: 3,
  rows: [{ id: 'foo' }, { id: 'bar' }, { id: 'baz' }],
  toggleAllRowsSelected: jest.fn(),
};
const SelectionStatusWrapper = ({ dataTableInfo, ...props }) => (
  <DataTableContext.Provider value={dataTableInfo}>
    <BaseSelectionStatus {...props} />
  </DataTableContext.Provider>
);

describe('BaseSelectionStatus', () => {
  beforeEach(() => {
    defaultDataTableInfo.toggleAllRowsSelected.mockClear();
    defaultProps.dispatch.mockClear();
  });
  it('shows select all text when no rows are selected', () => {
    render(<SelectionStatusWrapper dataTableInfo={defaultDataTableInfo} {...defaultProps} />);
    expect(screen.getByText('Select all 3')).toBeInTheDocument();
  });
  it('selects all when select all is clicked', () => {
    render(<SelectionStatusWrapper dataTableInfo={defaultDataTableInfo} {...defaultProps} />);
    const button = screen.getByText('Select all 3');
    userEvent.click(button);
    expect(defaultProps.dispatch).toHaveBeenCalledTimes(1);
    expect(defaultProps.dispatch).toHaveBeenCalledWith(setSelectedRowsAction(defaultDataTableInfo.rows));
    expect(defaultDataTableInfo.toggleAllRowsSelected).toHaveBeenCalledTimes(1);
    expect(defaultDataTableInfo.toggleAllRowsSelected).toHaveBeenCalledWith(true);
  });
  it('shows both buttons when there are some selected rows', () => {
    render(<SelectionStatusWrapper
      dataTableInfo={defaultDataTableInfo}
      {...defaultProps}
      selectedRows={selectedRows}
    />);
    expect(screen.getByText('Select all 3')).toBeInTheDocument();
    expect(screen.getByText('Clear selection')).toBeInTheDocument();
  });
  it('shows selection status when some rows are selected', () => {
    render(<SelectionStatusWrapper
      dataTableInfo={defaultDataTableInfo}
      {...defaultProps}
      selectedRows={selectedRows}
    />);
    expect(screen.getByText(`${selectedRows.length} selected`)).toBeInTheDocument();
  });
  it('shows clear all text when all rows are selected', () => {
    render(<SelectionStatusWrapper
      dataTableInfo={defaultDataTableInfo}
      {...defaultProps}
      selectedRows={defaultDataTableInfo.rows}
    />);
    expect(screen.getByText('Clear selection')).toBeInTheDocument();
    expect(screen.queryByText('Select all 3')).not.toBeInTheDocument();
  });
  it('clears all selections when clear all is clicked', () => {
    render(<SelectionStatusWrapper
      dataTableInfo={defaultDataTableInfo}
      {...defaultProps}
      selectedRows={defaultDataTableInfo.rows}
    />);
    const button = screen.getByText('Clear selection');
    userEvent.click(button);
    expect(defaultProps.dispatch).toHaveBeenCalledTimes(1);
    expect(defaultProps.dispatch).toHaveBeenCalledWith(clearSelectionAction());
    expect(defaultDataTableInfo.toggleAllRowsSelected).toHaveBeenCalledTimes(1);
    expect(defaultDataTableInfo.toggleAllRowsSelected).toHaveBeenCalledWith(false);
  });
  it('shows all selected text if all rows are selected', () => {
    render(<SelectionStatusWrapper
      dataTableInfo={{ ...defaultDataTableInfo }}
      {...defaultProps}
      selectedRows={defaultDataTableInfo.rows}
    />);
    expect(screen.getByText(`All ${defaultDataTableInfo.rows.length} selected`)).toBeInTheDocument();
  });
});
