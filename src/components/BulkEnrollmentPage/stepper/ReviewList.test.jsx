import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ReviewList, { ShowHideButton, MAX_ITEMS_DISPLAYED } from './ReviewList';
import { deleteSelectedRowAction } from '../data/actions';

const defaultProps = {
  rows: [
    {
      id: '1234',
      values: {
        foo: 'Bestest item',
      },
    },
    {
      id: '1235',
      values: {
        foo: 'Bestest item2',
      },
    },
  ],
  accessor: 'foo',
  dispatch: jest.fn(),
  subject: {
    singular: 'wug',
    plural: 'wugs',
    title: 'Wugs',
  },
  returnToSelection: jest.fn(),
};

const rowGenerator = (numRows) => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push({
      id: `${i}`,
      values: {
        foo: `${i}@i.com`,
      },
    });
  }
  return rows;
};

describe('ReviewList', () => {
  beforeEach(() => {
    defaultProps.dispatch.mockClear();
    defaultProps.returnToSelection.mockClear();
  });
  it('displays a title', () => {
    render(<ReviewList {...defaultProps} />);
    expect(screen.getByText(defaultProps.subject.title)).toBeInTheDocument();
  });
  it('shows an alert if there are no rows', () => {
    render(<ReviewList {...defaultProps} rows={[]} />);
    expect(screen.getByTestId('no-rows-alert')).toBeInTheDocument();
  });
  it('no rows alert returns the user to the selection screen', () => {
    render(<ReviewList {...defaultProps} rows={[]} />);
    const button = screen.getByTestId('return-to-selection-button');
    userEvent.click(button);
    expect(defaultProps.returnToSelection).toHaveBeenCalledTimes(1);
  });
  it('shows only 25 rows by default', () => {
    const rows = rowGenerator(30);
    render(<ReviewList {...defaultProps} rows={rows} />);
    const rowsBeingShown = rows.splice(0, 25);
    const rowsBeingHidden = rows.splice(25);
    rowsBeingShown.forEach((row) => {
      expect(screen.getByText(row.values.foo)).toBeInTheDocument();
    });
    rowsBeingHidden.forEach((row) => {
      expect(screen.queryByText(row.values.foo)).not.toBeInTheDocument();
    });
  });
  it('lets users show all rows', () => {
    const rows = rowGenerator(30);
    render(<ReviewList {...defaultProps} rows={rows} />);
    screen.debug();
    const button = screen.getByTestId('show-hide');
    userEvent.click(button);
    rows.forEach((row) => {
      expect(screen.getByText(row.values.foo)).toBeInTheDocument();
    });
  });
  it('lets users hide rows', () => {
    const rows = rowGenerator(30);
    render(<ReviewList {...defaultProps} rows={rows} />);
    const button = screen.getByTestId('show-hide');
    userEvent.click(button);
    userEvent.click(button);
    const rowsBeingShown = rows.splice(0, MAX_ITEMS_DISPLAYED);
    const rowsBeingHidden = rows.splice(MAX_ITEMS_DISPLAYED);
    rowsBeingShown.forEach((row) => {
      expect(screen.getByText(row.values.foo)).toBeInTheDocument();
    });
    rowsBeingHidden.forEach((row) => {
      expect(screen.queryByText(row.values.foo)).not.toBeInTheDocument();
    });
  });
  it('does not show the show/hide button when there are less than MAX_ITEMS_DISPLAYED rows', () => {
    render(<ReviewList {...defaultProps} />);
    expect(screen.queryByTestId('show-hide')).not.toBeInTheDocument();
  });
  it('dispatches the deleteSelected row action when the delete button is clicked', () => {
    render(<ReviewList {...defaultProps} />);
    const deleteButton = screen.getAllByTestId('delete-button')[0];
    userEvent.click(deleteButton);
    expect(defaultProps.dispatch).toHaveBeenCalledTimes(1);
    expect(defaultProps.dispatch).toHaveBeenCalledWith(deleteSelectedRowAction(defaultProps.rows[0].id));
  });

  describe('ShowHideButton', () => {
    const buttonProps = {
      isShowingAll: false,
      showAll: jest.fn(),
      show25: jest.fn(),
      numRows: 30,
      subject: {
        singular: 'wug',
        plural: 'wugs',
        title: 'Wugs',
      },
      'data-testid': 'test-button',
    };
    beforeEach(() => {
      buttonProps.show25.mockClear();
      buttonProps.showAll.mockClear();
    });
    it('returns null if there are less than  MAX_ITEMS_DISPLAYED rows', () => {
      render(<ShowHideButton {...buttonProps} numRows={24} />);
      expect(screen.queryByTestId('test-button')).not.toBeInTheDocument();
    });
    it('has show all text when not showing all', () => {
      render(<ShowHideButton {...buttonProps} />);
      expect(screen.getByText(`Show ${buttonProps.numRows - MAX_ITEMS_DISPLAYED} more ${buttonProps.subject.plural}`))
        .toBeInTheDocument();
    });
    it('has hiding text when all rows are showing', () => {
      render(<ShowHideButton {...buttonProps} isShowingAll />);
      expect(screen.getByText(`Hide ${buttonProps.numRows - MAX_ITEMS_DISPLAYED} ${buttonProps.subject.plural}`))
        .toBeInTheDocument();
    });
    it('show button calls showAll func', () => {
      render(<ShowHideButton {...buttonProps} />);
      const button = screen.getByTestId('test-button');
      userEvent.click(button);
      expect(buttonProps.showAll).toHaveBeenCalledTimes(1);
    });
    it('hide button calls show25 func', () => {
      render(<ShowHideButton {...buttonProps} isShowingAll />);
      const button = screen.getByTestId('test-button');
      userEvent.click(button);
      expect(buttonProps.show25).toHaveBeenCalledTimes(1);
    });
  });
});
