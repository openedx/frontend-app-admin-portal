import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import ReduxFormSelect from './index';

const props = {
  id: 'foo',
  input: {},
  label: 'Text me',
  meta: { touched: false, error: undefined },
  options: [{ value: 'excellent', label: 'Excellent' }, { value: 'poor', label: 'Poor' }],
};

describe('<ReduxFormSelect />', () => {
  it('renders a label', () => {
    render(<ReduxFormSelect {...props} />);
    expect(screen.getByText(props.label)).toBeInTheDocument();
  });
  it('shows the options', () => {
    render(<ReduxFormSelect {...props} />);
    const select = screen.getByText(props.label);
    userEvent.click(select);
    props.options.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });
  it('renders an error', () => {
    const error = 'bad field is bad';
    const errorProps = { ...props, meta: { touched: true, error } };
    render(<ReduxFormSelect {...errorProps} />);
    expect(screen.getByText(error)).toBeInTheDocument();
  });
  it('renders a description', () => {
    const description = 'Render field, described';
    render(<ReduxFormSelect {...props} description={description} />);
    expect(screen.getByText(description));
  });
  it('does not render an error if it has not been touched', () => {
    const error = 'bad field is bad';
    const errorProps = { ...props, meta: { touched: false, error } };
    render(<ReduxFormSelect {...errorProps} />);
    expect(screen.queryByText(error)).toBeFalsy();
  });
});
