/* eslint-disable react/prop-types */
import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import {
  addSelectedRowAction, clearSelectionAction, deleteSelectedRowAction, setSelectedRowsAction,
} from '../data/actions';
import { BulkEnrollContext } from '../BulkEnrollmentContext';
import {
  BaseSelectWithContext, BaseSelectWithContextHeader, SELECT_ONE_TEST_ID, SELECT_ALL_TEST_ID,
} from './BulkEnrollSelect';

const emailsDispatch = jest.fn();
const coursesDispatch = jest.fn();
const defaultRow = {
  getToggleRowSelectedProps: () => ({}),
  toggleRowSelected: jest.fn(),
  id: 'foo',
};

const defaultBulkEnrollInfo = {
  emails: [[], emailsDispatch],
  courses: [[], coursesDispatch],
};
const SelectWithContextWrapper = ({ bulkEnrollInfo = defaultBulkEnrollInfo, children }) => (
  <BulkEnrollContext.Provider value={bulkEnrollInfo}>
    {children}
  </BulkEnrollContext.Provider>
);

describe('BaseSelectWithContext', () => {
  beforeEach(() => {
    emailsDispatch.mockClear();
    coursesDispatch.mockClear();
    defaultRow.toggleRowSelected.mockClear();
  });
  it('renders a checkbox', () => {
    render(<SelectWithContextWrapper><BaseSelectWithContext contextKey="emails" row={defaultRow} /></SelectWithContextWrapper>);
    const checkbox = screen.getByTestId(SELECT_ONE_TEST_ID);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveProperty('checked', false);
  });
  it('toggles the row selected when clicked', () => {
    render(<SelectWithContextWrapper><BaseSelectWithContext contextKey="emails" row={defaultRow} /></SelectWithContextWrapper>);
    const checkbox = screen.getByTestId(SELECT_ONE_TEST_ID);
    userEvent.click(checkbox);
    expect(coursesDispatch).not.toHaveBeenCalled();
    expect(emailsDispatch).toHaveBeenCalledTimes(1);
    expect(emailsDispatch).toHaveBeenCalledWith(addSelectedRowAction(defaultRow));
    expect(defaultRow.toggleRowSelected).toHaveBeenCalledTimes(1);
    expect(defaultRow.toggleRowSelected).toHaveBeenCalledWith(true);
  });
  it('renders a selected checkbox', () => {
    render(
      <SelectWithContextWrapper bulkEnrollInfo={{ ...defaultBulkEnrollInfo, emails: [[defaultRow], emailsDispatch] }}>
        <BaseSelectWithContext contextKey="emails" row={defaultRow} />
      </SelectWithContextWrapper>,
    );
    const checkbox = screen.getByTestId(SELECT_ONE_TEST_ID);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveProperty('checked', true);
  });
  it('deselects the row when selected checkbox is checked', () => {
    render(
      <SelectWithContextWrapper bulkEnrollInfo={{ ...defaultBulkEnrollInfo, emails: [[defaultRow], emailsDispatch] }}>
        <BaseSelectWithContext contextKey="emails" row={defaultRow} />
      </SelectWithContextWrapper>,
    );
    const checkbox = screen.getByTestId(SELECT_ONE_TEST_ID);
    userEvent.click(checkbox);
    expect(coursesDispatch).not.toHaveBeenCalled();
    expect(emailsDispatch).toHaveBeenCalledTimes(1);
    expect(emailsDispatch).toHaveBeenCalledWith(deleteSelectedRowAction(defaultRow.id));
    expect(defaultRow.toggleRowSelected).toHaveBeenCalledTimes(1);
    expect(defaultRow.toggleRowSelected).toHaveBeenCalledWith(false);
  });
});

describe('BaseSelectWithContextHeader', () => {
  const rows = [{ id: 'foo' }, { id: 'bar' }, { id: 'baz' }];
  const defaultProps = {
    rows,
    getToggleAllRowsSelectedProps: jest.fn().mockReturnValue({ onChange: () => {}, indeterminate: false }),
    isAllRowsSelected: false,
    contextKey: 'emails',
  };
  beforeEach(() => {
    emailsDispatch.mockClear();
    coursesDispatch.mockClear();
    defaultProps.getToggleAllRowsSelectedProps.mockClear();
  });
  it('renders a checkbox', () => {
    render(<SelectWithContextWrapper><BaseSelectWithContextHeader contextKey="emails" {...defaultProps} /></SelectWithContextWrapper>);
    const checkbox = screen.getByTestId(SELECT_ALL_TEST_ID);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveProperty('checked', false);
  });
  it('toggles all rows selected when clicked', () => {
    render(<SelectWithContextWrapper><BaseSelectWithContextHeader contextKey="emails" {...defaultProps} /></SelectWithContextWrapper>);
    const checkbox = screen.getByTestId(SELECT_ALL_TEST_ID);
    userEvent.click(checkbox);
    expect(emailsDispatch).toHaveBeenCalledTimes(1);
    expect(emailsDispatch).toHaveBeenCalledWith(setSelectedRowsAction(rows));
  });
  it('renders a selected checkbox', () => {
    render(
      <SelectWithContextWrapper bulkEnrollInfo={{ ...defaultBulkEnrollInfo, emails: [[defaultRow], emailsDispatch] }}>
        <BaseSelectWithContextHeader contextKey="emails" {...{ ...defaultProps, isAllRowsSelected: true }} />
      </SelectWithContextWrapper>,
    );
    const checkbox = screen.getByTestId(SELECT_ALL_TEST_ID);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveProperty('checked', true);
  });
  it('deselects the row when selected checkbox is checked', () => {
    render(
      <SelectWithContextWrapper bulkEnrollInfo={{ ...defaultBulkEnrollInfo, emails: [[defaultRow], emailsDispatch] }}>
        <BaseSelectWithContextHeader contextKey="emails" {...{ ...defaultProps, isAllRowsSelected: true }} />
      </SelectWithContextWrapper>,
    );
    const checkbox = screen.getByTestId(SELECT_ALL_TEST_ID);
    userEvent.click(checkbox);
    expect(emailsDispatch).toHaveBeenCalledTimes(1);
    expect(emailsDispatch).toHaveBeenCalledWith(clearSelectionAction());
  });
});
