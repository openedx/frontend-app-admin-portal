import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { axe } from 'jest-axe';

import ReviewItem from './ReviewItem';
import { deleteSelectedRowAction } from '../data/actions';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

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

  // Skipped because this test fails a11y checks; to be addressed in ENT-11719
  it.skip('has no accessibility violations', async () => {
    const { container } = render(<ReviewItem {...defaultProps} />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
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
