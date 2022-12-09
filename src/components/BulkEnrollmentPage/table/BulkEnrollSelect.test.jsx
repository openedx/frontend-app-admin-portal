/* eslint-disable react/prop-types */
import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import {
  BaseSelectWithContext, SELECT_ONE_TEST_ID,
} from './BulkEnrollSelect';

const mockOnChange = jest.fn();
const defaultToggleRowSelectedProps = {
  indeterminate: false,
  checked: false,
  onChange: mockOnChange,
};
const mockToggleRowSelectedProps = jest.fn(() => defaultToggleRowSelectedProps);
const defaultRow = {
  id: 'foo',
  getToggleRowSelectedProps: mockToggleRowSelectedProps,
};
const checkedRow = {
  ...defaultRow,
  getToggleRowSelectedProps: jest.fn(() => ({
    ...defaultToggleRowSelectedProps,
    checked: true,
  })),
};

describe('BaseSelectWithContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders a checkbox', () => {
    render(<BaseSelectWithContext contextKey="emails" row={defaultRow} />);
    const checkbox = screen.getByTestId(SELECT_ONE_TEST_ID);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveProperty('checked', false);
  });
  it('renders a selected checkbox', () => {
    render(
      <BaseSelectWithContext contextKey="emails" row={checkedRow} />,
    );
    const checkbox = screen.getByTestId(SELECT_ONE_TEST_ID);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveProperty('checked', true);
  });
  it('deselects the row when selected checkbox is checked', () => {
    render(
      <BaseSelectWithContext contextKey="emails" row={defaultRow} />,
    );
    const checkbox = screen.getByTestId(SELECT_ONE_TEST_ID);
    userEvent.click(checkbox);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
