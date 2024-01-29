import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ReviewItem from './ReviewItem';
import { deleteSelectedRowAction } from '../data/actions';

const defaultProps = {
  row: {
    id: '124',
    values: {
      foo: 'Bestest item',
    },
  },
  accessor: 'foo',
  dispatch: jest.fn(),
  altText: 'deleteButton alt text',
};

describe('AddLearnersStep', () => {
  beforeEach(() => {
    defaultProps.dispatch.mockClear();
  });
  it('displays an item via the accessor', () => {
    render(<ReviewItem {...defaultProps} />);
    expect(screen.getByText(defaultProps.row.values.foo)).toBeInTheDocument();
  });
  it('remove button gets rendered with a correctly named aria label prop', () => {
    render(<ReviewItem {...defaultProps} />);
    expect(screen.getByTitle(defaultProps.altText)).toBeInTheDocument();
  });
  it('dispatches the deleteSelected row action when the delete button is clicked', () => {
    render(<ReviewItem {...defaultProps} />);
    const deleteButton = screen.getByTestId('delete-button');
    userEvent.click(deleteButton);
    expect(defaultProps.dispatch).toHaveBeenCalledTimes(1);
    expect(defaultProps.dispatch).toHaveBeenCalledWith(deleteSelectedRowAction(defaultProps.row.id));
  });
});
