import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TextAreaAutoSize from './index';

const props = {
  id: 'foo',
  input: {},
  label: 'Text me',
  meta: { touched: false, error: undefined },
};

describe('<TextAreaAutoSize />', () => {
  it('renders a label', () => {
    render(<TextAreaAutoSize {...props} />);
    expect(screen.getByText(props.label)).toBeInTheDocument();
  });
  it('renders an error', () => {
    const error = 'bad text area is bad';
    const errorProps = { ...props, meta: { touched: true, error } };
    render(<TextAreaAutoSize {...errorProps} />);
    expect(screen.getByText(error)).toBeInTheDocument();
  });
  it('renders a description', () => {
    const description = 'Text areas, described';
    render(<TextAreaAutoSize {...props} description={description} />);
    expect(screen.getByText(description));
  });
  it('does not render an error if it has not been touched', () => {
    const error = 'bad text area is bad';
    const errorProps = { ...props, meta: { touched: false, error } };
    render(<TextAreaAutoSize {...errorProps} />);
    expect(screen.queryByText(error)).toBeFalsy();
  });
});
