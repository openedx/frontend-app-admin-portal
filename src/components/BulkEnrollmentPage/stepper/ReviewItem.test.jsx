import { screen, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ReviewItem from './ReviewItem';
import '@testing-library/jest-dom';
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
  it('remove button gets rendered with a correctly named aria label prop', async () => {
    render(<ReviewItem {...defaultProps} />);
    const iconButton = await screen.findByTestId('delete-button');
    expect(iconButton).toHaveAttribute('aria-label', defaultProps.altText);
  });
  it('dispatches the deleteSelected row action when the delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<ReviewItem {...defaultProps} />);
    const deleteButton = screen.getByTestId('delete-button');
    await user.click(deleteButton);
    expect(defaultProps.dispatch).toHaveBeenCalledTimes(1);
    expect(defaultProps.dispatch).toHaveBeenCalledWith(deleteSelectedRowAction(defaultProps.row.id));
  });
});
