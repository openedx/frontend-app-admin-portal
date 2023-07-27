/* eslint-disable react/prop-types */
import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { DataTableContext } from '@edx/paragon';
import userEvent from '@testing-library/user-event';

import BaseSelectionStatus from './BaseSelectionStatus';

const mockToggleAllRowsSelected = jest.fn();

const defaultProps = {
  className: 'classy',
  selectedRows: [],
};
const defaultDataTableInfo = {
  itemCount: 3,
  page: [
    { id: 'foo', isSelected: false },
    { id: 'bar', isSelected: false },
    { id: 'baz', isSelected: false },
  ],
  toggleAllRowsSelected: mockToggleAllRowsSelected,
};

const selectedRows = [
  { id: 'foo', values: { aggregationKey: 'foo' } },
  { id: 'bar', values: { aggregationKey: 'bar' } },
];
const dataTableInfoWithSelections = {
  ...defaultDataTableInfo,
  page: defaultDataTableInfo.page.map((row) => {
    if (selectedRows.find(selectedRow => selectedRow.id === row.id)) {
      return {
        ...row,
        isSelected: true,
      };
    }
    return row;
  }),
};

const SelectionStatusWrapper = ({ dataTableInfo, ...props }) => (
  <DataTableContext.Provider value={dataTableInfo}>
    <BaseSelectionStatus {...props} />
  </DataTableContext.Provider>
);

describe('BaseSelectionStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('shows selection status when some rows are selected', () => {
    render(<SelectionStatusWrapper
      dataTableInfo={dataTableInfoWithSelections}
      {...defaultProps}
      selectedRows={selectedRows}
    />);
    const expectedSelectionsOnPage = dataTableInfoWithSelections.page.filter(r => r.isSelected).length;
    expect(screen.getByText(
      `${selectedRows.length} selected (${expectedSelectionsOnPage} shown below)`,
      { exact: false },
    )).toBeInTheDocument();
  });
  it('handle clearing of selections', () => {
    render(<SelectionStatusWrapper
      dataTableInfo={defaultDataTableInfo}
      {...defaultProps}
      selectedRows={selectedRows}
    />);
    const clearSelection = screen.getByText('Clear selection');
    expect(clearSelection).toBeInTheDocument();
    userEvent.click(clearSelection);
    expect(mockToggleAllRowsSelected).toHaveBeenCalledTimes(1);
  });
});
